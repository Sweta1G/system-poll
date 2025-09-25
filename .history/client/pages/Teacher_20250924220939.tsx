import AppLayout from "../components/AppLayout";
import ChatWidget from "../components/ChatWidget";
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

  // Reset form when poll ends (transitions from active to non-active)
  useEffect(() => {
    if (state.phase === "idle" || state.phase === "results") {
      // Check if we just transitioned from an active poll
      const shouldReset = state.questionId !== null;
      if (shouldReset) {
        // Reset the question form for a new poll
        setQuestion("");
        setOptions(["", ""]);
        setDuration(60);
        setCorrectAnswers([false, false]);
      }
    }
  }, [state.phase, state.questionId]);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([false, false]);

  const canStart = useMemo(() => {
    const filled = options.map((o) => o.trim()).filter(Boolean);
    const filledIndexes = options.map((o, index) => o.trim() ? index : -1).filter(i => i >= 0);
    const hasAtLeastOneCorrectAnswer = filledIndexes.some(index => correctAnswers[index] === true);
    
    return question.trim().length > 0 && 
           filled.length >= 2 && 
           state.phase !== "active" &&
           hasAtLeastOneCorrectAnswer;
  }, [question, options, state.phase, correctAnswers]);

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

  // Check if all participants have answered or poll has ended
  const allAnswered = state.participants > 0 && state.submissions >= state.participants;
  const pollEnded = state.phase === "results";
  const canAskNewQuestion = pollEnded || allAnswered;

  const startNewQuestion = () => {
    // End current poll and go back to creation form
    socketRef.current.emit("teacher:end");
    
    // Force reset the form immediately
    setQuestion("");
    setOptions(["", ""]);
    setDuration(60);
    setCorrectAnswers([false, false]);
  };

  // Show results page when poll is active or in results phase
  if (state.phase === "active" || state.phase === "results") {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">Intervue Poll</div>
            <a href="/history" className="inline-flex items-center gap-2 rounded-full bg-primary/90 text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
              👁 View Poll history
            </a>
          </div>

          {/* Question Results Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
            {/* Question Header */}
            <div className="bg-gray-800 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Question</h2>
                {state.phase === "active" && (
                  <div className="text-red-400 font-mono">
                    ⏱ {remaining}s
                  </div>
                )}
              </div>
              <p className="text-gray-300 mt-2">{state.question}</p>
            </div>

            {/* Results */}
            <div className="p-6 space-y-4">
              {state.options.map((opt, i) => {
                const total = Math.max(1, state.votes.reduce((a, b) => a + b, 0));
                const votes = state.votes[i] || 0;
                const pct = Math.round((votes / total) * 100);
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </div>
                      <span className="text-lg font-bold">{pct}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-sm text-muted-foreground">
              {state.submissions} of {state.participants} participants answered
              <span className="text-green-600 ml-2">✓ Should be Ready</span>
            </div>
            <button
              onClick={startNewQuestion}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
            >
              + Ask a new question
            </button>
            <div className="text-xs text-gray-400">
              Forced enabled for testing - Check console for debug info
            </div>
          </div>
        </div>
        <ChatWidget role="teacher" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">Intervue Poll</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Let's Get Started</h1>
          <p className="text-muted-foreground">You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enter your question</label>
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
                      <label className={`inline-flex items-center gap-2 ${opt.trim() && state.phase !== "active" ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input 
                          type="radio" 
                          name={`opt-${idx}`} 
                          checked={correctAnswers[idx] === true}
                          onChange={() => setCorrectAnswer(idx, true)}
                          disabled={state.phase === "active" || !opt.trim()}
                          className="w-4 h-4 radio-primary disabled:opacity-50"
                        /> 
                        <span className={correctAnswers[idx] === true ? "text-primary font-medium" : opt.trim() ? "" : "text-muted-foreground/50"}>Yes</span>
                      </label>
                      <label className={`inline-flex items-center gap-2 ${opt.trim() && state.phase !== "active" ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input 
                          type="radio" 
                          name={`opt-${idx}`} 
                          checked={correctAnswers[idx] === false}
                          onChange={() => setCorrectAnswer(idx, false)}
                          disabled={state.phase === "active" || !opt.trim()}
                          className="w-4 h-4 radio-primary disabled:opacity-50"
                        /> 
                        <span className={correctAnswers[idx] === false ? "text-primary font-medium" : opt.trim() ? "" : "text-muted-foreground/50"}>No</span>
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
            <div className="flex justify-end">
              <a href="/history" className="inline-flex items-center gap-2 rounded-full bg-primary/90 text-primary-foreground px-4 py-2 text-sm hover:opacity-90">View Poll history</a>
            </div>
          </div>
        </section>
      </div>
      <ChatWidget role="teacher" />
    </AppLayout>
  );
}
