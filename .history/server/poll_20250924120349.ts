import { Server, Socket } from "socket.io";

export type PollPhase = "idle" | "active" | "results";

export interface PollState {
  phase: PollPhase;
  questionId: string | null;
  question: string | null;
  options: string[];
  votes: number[];
  submissions: number;
  participants: number;
  deadline: number | null; // epoch ms
  correctAnswers?: boolean[];
}

interface HistoryItem {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  at: number;
}

interface ChatMessage {
  id: string;
  from: string; // name if available
  text: string;
  at: number;
}

function now() {
  return Date.now();
}

export class PollManager {
  private io: Server;
  private participants = new Map<string, string>(); // socketId -> name
  private kicked = new Set<string>(); // socketId set
  private answers = new Map<string, number>(); // socketId -> optionIndex
  private phase: PollPhase = "idle";
  private questionId: string | null = null;
  private question: string | null = null;
  private options: string[] = [];
  private votes: number[] = [];
  private correctAnswers: boolean[] = [];
  private deadline: number | null = null;
  private tick?: NodeJS.Timeout;
  private history: HistoryItem[] = [];
  private chat: ChatMessage[] = [];

  constructor(io: Server) {
    this.io = io;
  }

  attach() {
    this.io.on("connection", (socket) => this.onConnection(socket));
  }

  private onConnection(socket: Socket) {
    socket.on("student:join", (name: string) => {
      if (this.kicked.has(socket.id)) {
        socket.emit("system:kicked");
        return;
      }
      const sanitized = String(name || "").trim().slice(0, 50) || "Anonymous";
      this.participants.set(socket.id, sanitized);
      this.emitParticipants();
      this.emitState();
    });

    socket.on("student:submit", (payload: { optionIndex: number }) => {
      if (this.phase !== "active") return;
      const idx = Number(payload?.optionIndex);
      if (!Number.isInteger(idx) || idx < 0 || idx >= this.options.length) return;
      if (this.answers.has(socket.id)) return; // one-time submit
      this.answers.set(socket.id, idx);
      this.votes[idx] = (this.votes[idx] ?? 0) + 1;
      this.emitState();
      // If all current participants have answered, end early
      if (this.answers.size >= this.participants.size) {
        this.finishQuestion();
      }
    });

    socket.on("teacher:start", (payload: { question: string; options: string[]; duration?: number; correctAnswers?: boolean[] }) => {
      const q = String(payload?.question || "").trim();
      let opts = Array.isArray(payload?.options) ? payload.options.map((o) => String(o).trim()).filter(Boolean) : [];
      const duration = Math.max(5, Math.min(60 * 60, Number(payload?.duration || 60))); // 5s..1h
      const correctAnswers = Array.isArray(payload?.correctAnswers) ? payload.correctAnswers : [];
      
      if (!q || opts.length < 2) return;
      if (this.phase === "active") return; // cannot start while active
      // normalize duplicate options
      const seen = new Set<string>();
      opts = opts
        .filter((o) => {
          const key = o.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 10);

      this.questionId = Math.random().toString(36).slice(2);
      this.question = q;
      this.options = opts;
      this.votes = new Array(opts.length).fill(0);
      this.correctAnswers = correctAnswers.slice(0, opts.length); // Ensure it matches options length
      this.answers.clear();
      this.phase = "active";
      this.deadline = now() + duration * 1000;

      this.clearTick();
      this.tick = setInterval(() => this.onTick(), 250);
      this.emitState();
    });

    socket.on("teacher:end", () => {
      if (this.phase === "active") this.finishQuestion();
    });

    // Participants APIs
    socket.on("teacher:participants", (cb?: (list: Array<{ id: string; name: string }>) => void) => {
      const list = [...this.participants.entries()].map(([id, name]) => ({ id, name }));
      if (cb) cb(list);
      else socket.emit("participants:update", list);
    });

    socket.on("teacher:kick", (socketId: string) => {
      const s = this.io.sockets.sockets.get(socketId);
      if (s) {
        // Emit first, then disconnect after a short delay so client receives the event
        s.emit("system:kicked");
        setTimeout(() => s.disconnect(true), 150);
        this.kicked.add(socketId);
      }
      this.participants.delete(socketId);
      this.answers.delete(socketId);
      this.emitParticipants();
      this.emitState();
    });

    // History APIs
    socket.on("teacher:history", (cb?: (history: HistoryItem[]) => void) => {
      const snapshot = [...this.history];
      if (cb) cb(snapshot);
      else socket.emit("poll:history", snapshot);
    });

    // Chat APIs
    socket.on("chat:send", (text: string) => {
      const name = this.participants.get(socket.id) || "User";
      const msg: ChatMessage = { id: Math.random().toString(36).slice(2), from: name, text: String(text || "").slice(0, 500), at: now() };
      if (!msg.text) return;
      this.chat.push(msg);
      if (this.chat.length > 50) this.chat.shift();
      this.io.emit("chat:new", msg);
    });

    socket.on("chat:history", (cb?: (messages: ChatMessage[]) => void) => {
      const snapshot = [...this.chat];
      if (cb) cb(snapshot);
      else socket.emit("chat:history", snapshot);
    });

    socket.on("disconnect", () => {
      this.participants.delete(socket.id);
      // If all remaining participants already answered, finish
      if (this.phase === "active" && this.answers.size >= this.participants.size) {
        this.finishQuestion();
      } else {
        this.emitParticipants();
        this.emitState();
      }
    });

    // Send initial state
    this.emitParticipants(socket);
    this.emitState(socket);
  }

  private onTick() {
    if (this.phase !== "active" || this.deadline == null) return;
    if (now() >= this.deadline) {
      this.finishQuestion();
    } else {
      // low-overhead live updates about remaining time
      this.emitState();
    }
  }

  private finishQuestion() {
    if (this.question && this.options.length) {
      this.history.unshift({
        id: this.questionId || Math.random().toString(36).slice(2),
        question: this.question,
        options: [...this.options],
        votes: [...this.votes],
        at: now(),
      });
      if (this.history.length > 25) this.history.pop();
    }
    this.phase = "results";
    this.deadline = null;
    this.clearTick();
    this.emitState();
  }

  private clearTick() {
    if (this.tick) clearInterval(this.tick);
    this.tick = undefined;
  }

  private getState(): PollState {
    return {
      phase: this.phase,
      questionId: this.questionId,
      question: this.question,
      options: [...this.options],
      votes: [...this.votes],
      submissions: this.answers.size,
      participants: this.participants.size,
      deadline: this.deadline,
      correctAnswers: [...this.correctAnswers],
    };
  }

  private emitState(target?: Socket) {
    const payload = this.getState();
    if (target) target.emit("poll:update", payload);
    else this.io.emit("poll:update", payload);
  }

  private emitParticipants(target?: Socket) {
    const list = [...this.participants.entries()].map(([id, name]) => ({ id, name }));
    if (target) target.emit("participants:update", list);
    else this.io.emit("participants:update", list);
  }
}
