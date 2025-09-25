import AppLayout from "@/components/AppLayout";
import ChatWidget from "@/components/ChatWidget";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, PollState } from "@/lib/socket";

export default function TeacherPage() {
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
    correctAnswers: [],
  });

  useEffect(() => {
    const s = socketRef.current;
    const onUpdate = (next: PollState) => setState(next);
    s.on("poll:update", onUpdate);
    return () => {
      s.off("poll:update", onUpdate);
    };
  }, []);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([false, false]);

  const canStart = useMemo(() => {
    const filled = options.map((o) => o.trim()).filter(Boolean);
    return question.trim().length > 0 && filled.length >= 2 && state.phase !== "active";
  }, [question, options, state.phase]);

  const startPoll = () => {
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!canStart) return;
    
    // Filter correct answers to match the filtered options
    const filteredCorrectAnswers = correctAnswers.slice(0, opts.length);
    
    socketRef.current.emit("teacher:start", { 
      question: question.trim(), 
      options: opts, 
      duration,
      correctAnswers: filteredCorrectAnswers 
    });
  };

  const endPoll = () => socketRef.current.emit("teacher:end");

  const addOption = () => {
    if (options.length < 10) {
      setOptions((o) => [...o, ""]);
      setCorrectAnswers((c) => [...c, false]);
    }
  };
  const removeOption = (idx: number) => {
    setOptions((o) => o.filter((_, i) => i !== idx));
    setCorrectAnswers((c) => c.filter((_, i) => i !== idx));
  };
  const updateOption = (idx: number, val: string) => setOptions((o) => o.map((v, i) => (i === idx ? val : v)));
  const setCorrectAnswer = (idx: number, isCorrect: boolean) => {
    setCorrectAnswers((c) => c.map((_, i) => (i === idx ? isCorrect : _)));
  };

  const remainingMs = Math.max(0, (state.deadline ?? 0) - Date.now());
  const remaining = Math.ceil(remainingMs / 1000);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Let's Get Started</h1>
          <p className="text-muted-foreground">You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your question</label>
              <div className="flex items-center justify-end">
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={state.phase === "active"}
                >
                  {[15,30,45,60,90,120].map((s)=> (
                    <option key={s} value={s}>{s} seconds</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your question here"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={state.phase === "active"}
              />
              <div className="text-right text-xs text-muted-foreground">{Math.min(100, question.length)}/100</div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-sm font-medium">Edit Options</div>
                <div className="text-sm font-medium">Is it Correct?</div>
                <div className="text-sm font-medium">Actions</div>
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      disabled={state.phase === "active"}
                    />
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`opt-${idx}`} 
                          checked={correctAnswers[idx] === true}
                          onChange={() => setCorrectAnswer(idx, true)}
                          disabled={state.phase === "active"}
                          className="w-4 h-4 text-primary border-2 border-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
                        /> 
                        <span className={correctAnswers[idx] === true ? "text-primary font-medium" : ""}>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`opt-${idx}`} 
                          checked={correctAnswers[idx] === false}
                          onChange={() => setCorrectAnswer(idx, false)}
                          disabled={state.phase === "active"}
                          className="w-4 h-4 text-primary border-2 border-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
                        /> 
                        <span className={correctAnswers[idx] === false ? "text-primary font-medium" : ""}>No</span>
                      </label>
                    </div>
                    <div>
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(idx)}
                          disabled={state.phase === "active"}
                          className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addOption} className="rounded-full border px-3 py-1 text-sm hover:bg-accent" disabled={state.phase === "active" || options.length >= 10}>
                + Add More option
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={startPoll}
                disabled={!canStart}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium disabled:opacity-50"
              >
                Ask Question
              </button>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Live results</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Participants</div>
              <div className="text-2xl font-bold">{state.participants}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Submissions</div>
              <div className="text-2xl font-bold">{state.submissions}</div>
            </div>
          </div>
          {state.phase === "active" && (
            <div className="rounded-md border p-3 text-sm flex items-center justify-between">
              <div>Time remaining</div>
              <div className="font-mono">{remaining}s</div>
            </div>
          )}
          <div className="flex justify-end">
            <a href="/history" className="inline-flex items-center gap-2 rounded-full bg-primary/90 text-primary-foreground px-4 py-2 text-sm hover:opacity-90">View Poll history</a>
          </div>
          <div className="rounded-md border p-4 space-y-4 mt-2">
            <div className="font-medium">
              {state.question ? state.question : "No active question"}
            </div>
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
            </div>
          </div>
        </section>
      </div>
      <ChatWidget role="teacher" />
    </AppLayout>
  );
}
