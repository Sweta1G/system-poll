import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const navigate = useNavigate();

  const continueTo = () => navigate(role === "student" ? "/student" : "/teacher");

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto text-center space-y-8 py-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">Intervue Poll</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Welcome to the <span className="text-primary">Live Polling System</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Please select the role that best describes you to begin using the live polling system</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <button onClick={() => setRole("student")} className={`rounded-xl border p-5 shadow-sm transition ${role === "student" ? "ring-2 ring-primary" : "hover:bg-accent"}`}>
            <div className="font-semibold">I'm a Student</div>
            <div className="text-sm text-muted-foreground mt-2">Submit answers and view live poll results in real-time.</div>
          </button>
          <button onClick={() => setRole("teacher")} className={`rounded-xl border p-5 shadow-sm transition ${role === "teacher" ? "ring-2 ring-primary" : "hover:bg-accent"}`}>
            <div className="font-semibold">I'm a Teacher</div>
            <div className="text-sm text-muted-foreground mt-2">Create polls, ask questions and monitor responses.</div>
          </button>
        </div>

        <button onClick={continueTo} className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-primary-foreground font-medium">Continue</button>
      </div>
    </AppLayout>
  );
}
