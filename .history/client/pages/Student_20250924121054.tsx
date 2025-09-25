import AppLayout from "@/components/AppLayout";import AppLayout from "@/components/AppLayout";

import ChatWidget from "@/components/ChatWidget";import ChatWidget from "@/compone  if (kicked) {

import { useEffect, useMemo, useRef, useState } from "react";    return (

import { getSocket, PollState } from "@/lib/socket";      <AppLayout>

        <div className="min-h-[60vh] flex items-center justify-center">

function getNameKey() {          <div className="max-w-md mx-auto text-center space-y-6 p-8">

  // unique per tab (using a random tabId stored in sessionStorage)            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">

  const tabId = (sessionStorage.getItem("tabId") || (() => {              <span className="w-2 h-2 bg-red-500 rounded-full"></span>

    const v = Math.random().toString(36).slice(2);              Intervue Poll

    sessionStorage.setItem("tabId", v);            </div>

    return v;            

  })());            <div className="space-y-3">

  return `studentName:${tabId}`;              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">

}                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />

export default function StudentPage() {                </svg>

  const socketRef = useRef(getSocket());              </div>

  const [state, setState] = useState<PollState>({              

    phase: "idle",              <h1 className="text-3xl font-bold text-gray-900">You've been removed</h1>

    questionId: null,              <div className="space-y-2">

    question: null,                <p className="text-gray-600 text-lg">The teacher has removed you from this poll session.</p>

    options: [],                <p className="text-sm text-gray-500">You can try joining a new session when available.</p>

    votes: [],              </div>

    submissions: 0,            </div>

    participants: 0,            

    deadline: null,            <div className="pt-4">

  });              <button

                onClick={() => window.location.reload()}

  const [savedName, setSavedName] = useState(() => sessionStorage.getItem(getNameKey()) || "");                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-6 py-3 text-white font-medium transition-colors"

  const [name, setName] = useState(() => savedName);              >

  const [submittedFor, setSubmittedFor] = useState<string | null>(null);                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

  const [kicked, setKicked] = useState(false);                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />

                </svg>

  useEffect(() => {                Refresh Page

    const s = socketRef.current;              </button>

    const onUpdate = (next: PollState) => setState(next);            </div>

    const onKicked = () => {          </div>

      setKicked(true);        </div>

      // Disconnect the socket and prevent reconnection        <ChatWidget role="student" />

      s.disconnect();      </AppLayout>

      // Clear any saved name to prevent automatic rejoining    );

      sessionStorage.removeItem(getNameKey());  }t";

    };import { useEffect, useMemo, useRef, useState } from "react";

    s.on("poll:update", onUpdate);import { getSocket, PollState } from "@/lib/socket";

    s.on("system:kicked", onKicked);

    return () => {function getNameKey() {

      s.off("poll:update", onUpdate);  // unique per tab (using a random tabId stored in sessionStorage)

      s.off("system:kicked", onKicked);  const tabId = (sessionStorage.getItem("tabId") || (() => {

    };    const v = Math.random().toString(36).slice(2);

  }, []);    sessionStorage.setItem("tabId", v);

    return v;

  useEffect(() => {  })());

    if (savedName.trim() && !kicked) {  return `studentName:${tabId}`;

      socketRef.current.emit("student:join", savedName.trim());}

    }

  }, [savedName, kicked]);export default function StudentPage() {

  const socketRef = useRef(getSocket());

  useEffect(() => {  const [state, setState] = useState<PollState>({

    // reset submission flag when question changes    phase: "idle",

    if (state.questionId && state.questionId !== submittedFor) {    questionId: null,

      setSubmittedFor(null);    question: null,

    }    options: [],

  }, [state.questionId]);    votes: [],

    submissions: 0,

  const remainingMs = Math.max(0, (state.deadline ?? 0) - Date.now());    participants: 0,

  const remaining = Math.ceil(remainingMs / 1000);    deadline: null,

  });

  const canAnswer = useMemo(() => state.phase === "active" && !!name.trim() && submittedFor == null, [state.phase, name, submittedFor]);

  const [savedName, setSavedName] = useState(() => sessionStorage.getItem(getNameKey()) || "");

  const submit = (idx: number) => {  const [name, setName] = useState(() => savedName);

    if (!canAnswer) return;  const [submittedFor, setSubmittedFor] = useState<string | null>(null);

    socketRef.current.emit("student:submit", { optionIndex: idx });  const [kicked, setKicked] = useState(false);

    if (state.questionId) setSubmittedFor(state.questionId);

  };  useEffect(() => {

    const s = socketRef.current;

  const confirmName = () => {    const onUpdate = (next: PollState) => setState(next);

    const v = name.trim();    const onKicked = () => {

    if (!v) return;      setKicked(true);

    sessionStorage.setItem(getNameKey(), v);      // Disconnect the socket and prevent reconnection

    setSavedName(v);      s.disconnect();

  };      // Clear any saved name to prevent automatic rejoining

      sessionStorage.removeItem(getNameKey());

  if (kicked) {    };

    return (    s.on("poll:update", onUpdate);

      <AppLayout>    s.on("system:kicked", onKicked);

        <div className="min-h-[60vh] flex items-center justify-center">    return () => {

          <div className="max-w-md mx-auto text-center space-y-6 p-8">      s.off("poll:update", onUpdate);

            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">      s.off("system:kicked", onKicked);

              <span className="w-2 h-2 bg-red-500 rounded-full"></span>    };

              Intervue Poll  }, []);

            </div>

              useEffect(() => {

            <div className="space-y-3">    if (savedName.trim() && !kicked) {

              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">      socketRef.current.emit("student:join", savedName.trim());

                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">    }

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />  }, [savedName, kicked]);

                </svg>

              </div>  useEffect(() => {

                  // reset submission flag when question changes

              <h1 className="text-3xl font-bold text-gray-900">You've been removed</h1>    if (state.questionId && state.questionId !== submittedFor) {

              <div className="space-y-2">      setSubmittedFor(null);

                <p className="text-gray-600 text-lg">The teacher has removed you from this poll session.</p>    }

                <p className="text-sm text-gray-500">You can try joining a new session when available.</p>  }, [state.questionId]);

              </div>

            </div>  const remainingMs = Math.max(0, (state.deadline ?? 0) - Date.now());

              const remaining = Math.ceil(remainingMs / 1000);

            <div className="pt-4">

              <button  const canAnswer = useMemo(() => state.phase === "active" && !!name.trim() && submittedFor == null, [state.phase, name, submittedFor]);

                onClick={() => window.location.reload()}

                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-6 py-3 text-white font-medium transition-colors"  const submit = (idx: number) => {

              >    if (!canAnswer) return;

                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">    socketRef.current.emit("student:submit", { optionIndex: idx });

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />    if (state.questionId) setSubmittedFor(state.questionId);

                </svg>  };

                Refresh Page

              </button>  const confirmName = () => {

            </div>    const v = name.trim();

          </div>    if (!v) return;

        </div>    sessionStorage.setItem(getNameKey(), v);

        <ChatWidget role="student" />    setSavedName(v);

      </AppLayout>  };

    );

  }  if (kicked) {

    return (

  if (!savedName.trim()) {      <AppLayout>

    return (        <div className="max-w-md mx-auto text-center space-y-4">

      <AppLayout>          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>

        <div className="max-w-md mx-auto space-y-6">          <h1 className="text-2xl font-bold">You’ve been Kicked out !</h1>

          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>          <p className="text-muted-foreground">Looks like the teacher had removed you from the poll system .</p>

          <h1 className="text-3xl font-bold">Let's Get Started</h1>          <p className="text-muted-foreground">Please Try again sometime.</p>

          <p className="text-muted-foreground">Enter your Name</p>        </div>

          <input        <ChatWidget role="student" />

            className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"      </AppLayout>

            placeholder="Your name"    );

            value={name}  }

            onChange={(e) => setName(e.target.value)}

          />  if (!savedName.trim()) {

          <button    return (

            onClick={confirmName}      <AppLayout>

            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium"        <div className="max-w-md mx-auto space-y-6">

          >          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>

            Continue          <h1 className="text-3xl font-bold">Let's Get Started</h1>

          </button>          <p className="text-muted-foreground">Enter your Name</p>

        </div>          <input

        <ChatWidget role="student" />            className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"

      </AppLayout>            placeholder="Your name"

    );            value={name}

  }            onChange={(e) => setName(e.target.value)}

          />

  if (state.phase === "idle") {          <button

    return (            onClick={confirmName}

      <AppLayout>            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium"

        <div className="max-w-md mx-auto text-center space-y-4">          >

          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>            Continue

          <h1 className="text-2xl font-bold">Welcome {savedName}!</h1>          </button>

          <p className="text-muted-foreground">Waiting for the teacher to ask a new question</p>        </div>

          <div className="text-sm text-muted-foreground">        <ChatWidget role="student" />

            {state.participants} participants connected      </AppLayout>

          </div>    );

        </div>  }

        <ChatWidget role="student" />

      </AppLayout>  return (

    );    <AppLayout>

  }      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">

  if (state.phase === "active") {          <h1 className="text-2xl font-bold">Welcome, {savedName}</h1>

    const hasSubmitted = submittedFor === state.questionId;          {state.phase === "active" && (

    return (            <div className="rounded-md border px-3 py-1 text-sm">Time left: <span className="font-mono">{remaining}s</span></div>

      <AppLayout>          )}

        <div className="max-w-2xl mx-auto space-y-6">        </div>

          <div className="space-y-4">

            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>        <div className="rounded-md border p-4 space-y-4">

            <div className="text-center space-y-2">          <div className="font-medium">

              <h1 className="text-3xl font-bold">{state.question}</h1>            {state.question ? state.question : "Wait for the teacher to ask questions.."}

              <p className="text-muted-foreground">          </div>

                {hasSubmitted ? "Thanks for voting!" : `Time remaining: ${remaining}s`}          {state.phase === "active" && submittedFor == null && (

              </p>            <div className="grid gap-2">

            </div>              {state.options.map((opt, i) => (

          </div>                <button

                  key={i}

          {hasSubmitted && (                  onClick={() => submit(i)}

            <div className="text-center text-primary font-medium">                  className="w-full text-left rounded-md border px-4 py-2 hover:bg-accent"

              ✓ Your answer has been submitted                >

            </div>                  {opt}

          )}                </button>

              ))}

          <div className="space-y-3">            </div>

            {state.options.map((option, idx) => (          )}

              <button          {(state.phase === "results" || submittedFor != null) && (

                key={idx}            <div className="space-y-3">

                onClick={() => submit(idx)}              {state.options.map((opt, i) => {

                disabled={!canAnswer}                const total = Math.max(1, state.votes.reduce((a, b) => a + b, 0));

                className={`w-full rounded-lg border p-4 text-left transition-colors ${                const pct = Math.round(((state.votes[i] || 0) / total) * 100);

                  canAnswer                 return (

                    ? "border-muted hover:border-primary hover:bg-primary/5"                   <div key={i}>

                    : "border-muted-foreground/20 bg-muted/50 opacity-50 cursor-not-allowed"                    <div className="flex justify-between text-sm mb-1">

                }`}                      <span>{opt}</span>

              >                      <span className="text-muted-foreground">{pct}%</span>

                <div className="flex items-center gap-3">                    </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">

                    canAnswer ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />

                  }`}>                    </div>

                    {String.fromCharCode(65 + idx)}                  </div>

                  </div>                );

                  <span className="flex-1">{option}</span>              })}

                </div>              <div className="text-xs text-muted-foreground">Wait for the teacher to ask a new question...</div>

              </button>            </div>

            ))}          )}

          </div>        </div>

      </div>

          <div className="text-center text-sm text-muted-foreground">      <ChatWidget role="student" />

            {state.submissions} / {state.participants} participants have answered    </AppLayout>

          </div>  );

        </div>}

        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  if (state.phase === "results") {
    const totalVotes = state.votes.reduce((a, b) => a + b, 0);
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">Intervue Poll</div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">{state.question}</h1>
              <p className="text-muted-foreground">Results</p>
            </div>
          </div>

          <div className="space-y-3">
            {state.options.map((option, idx) => {
              const votes = state.votes[idx] || 0;
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
              const isCorrect = state.correctAnswers?.[idx] === true;
              
              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${
                    isCorrect ? "border-green-300 bg-green-50" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      isCorrect ? "border-green-500 bg-green-500 text-white" : "border-primary text-primary"
                    }`}>
                      {isCorrect ? "✓" : String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{option}</span>
                    <span className="text-sm font-medium">{votes} votes ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCorrect ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Total votes: {totalVotes}
          </div>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  return null;
}