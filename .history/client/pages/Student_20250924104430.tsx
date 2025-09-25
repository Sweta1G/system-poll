import AppLayout from "@/components/AppLayout";
import ChatWidget from "@/components/ChatWidget";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, PollState } from "@/lib/socket";

function getNameKey() {
  // unique per tab (using a random tabId stored in sessionStorage)
  const tabId = (sessionStorage.getItem("tabId") || (() => {
    const v = Math.random().toString(36).slice(2);
    sessionStorage.setItem("tabId", v);
    return v;
  })());
  return `studentName:${tabId}`;
}

export default function StudentPage() {
  const socketRef = useRef(getSocket());
  const [state, setState] = useState<PollState>({
    phase: "idle",
    questionId: null,
    question: null,
    options: [],
    votes: [],
    submissions: 0,
    participants: 0,
    deadline: null,
  });

  const [savedName, setSavedName] = useState(() => sessionStorage.getItem(getNameKey()) || "");
  const [name, setName] = useState(() => savedName);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    const s = socketRef.current;
    const onUpdate = (next: PollState) => setState(next);
    const onKicked = () => setKicked(true);
    s.on("poll:update", onUpdate);
    s.on("system:kicked", onKicked);
    return () => {
      s.off("poll:update", onUpdate);
      s.off("system:kicked", onKicked);
    };
  }, []);

  useEffect(() => {
    if (savedName.trim()) {
      socketRef.current.emit("student:join", savedName.trim());
    }
  }, [savedName]);

  useEffect(() => {
    // reset submission flag when question changes
    if (state.questionId && state.questionId !== submittedFor) {
      setSubmittedFor(null);
    }
  }, [state.questionId]);

  const remainingMs = Math.max(0, (state.deadline ?? 0) - Date.now());
  const remaining = Math.ceil(remainingMs / 1000);

  const canAnswer = useMemo(() => state.phase === "active" && !!name.trim() && submittedFor == null, [state.phase, name, submittedFor]);

  const submit = (idx: number) => {
    if (!canAnswer) return;
    socketRef.current.emit("student:submit", { optionIndex: idx });
    if (state.questionId) setSubmittedFor(state.questionId);
  };

  const confirmName = () => {
    const v = name.trim();
    if (!v) return;
    sessionStorage.setItem(getNameKey(), v);
    setSavedName(v);
  };

  if (kicked) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>
          <h1 className="text-2xl font-bold">You’ve been Kicked out !</h1>
          <p className="text-muted-foreground">Looks like the teacher had removed you from the poll system .</p>
          <p className="text-muted-foreground">Please Try again sometime.</p>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  if (!savedName.trim()) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>
          <h1 className="text-3xl font-bold">Let's Get Started</h1>
          <p className="text-muted-foreground">Enter your Name</p>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={confirmName}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium"
          >
            Continue
          </button>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, {savedName}</h1>
          {state.phase === "active" && (
            <div className="rounded-md border px-3 py-1 text-sm">Time left: <span className="font-mono">{remaining}s</span></div>
          )}
        </div>

        <div className="rounded-md border p-4 space-y-4">
          <div className="font-medium">
            {state.question ? state.question : "Wait for the teacher to ask questions.."}
          </div>
          {state.phase === "active" && submittedFor == null && (
            <div className="grid gap-2">
              {state.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => submit(i)}
                  className="w-full text-left rounded-md border px-4 py-2 hover:bg-accent"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {(state.phase === "results" || submittedFor != null) && (
            <div className="space-y-3">
              {state.options.map((opt, i) => {
                const total = Math.max(1, state.votes.reduce((a, b) => a + b, 0));
                const pct = Math.round(((state.votes[i] || 0) / total) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{opt}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="text-xs text-muted-foreground">Wait for the teacher to ask a new question...</div>
            </div>
          )}
        </div>
      </div>
      <ChatWidget role="student" />
    </AppLayout>
  );
}
