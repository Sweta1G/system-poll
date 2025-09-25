import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("/", {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

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
  hasVoted?: boolean; // indicates if this specific student has voted
}
