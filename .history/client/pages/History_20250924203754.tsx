import AppLayout from "@/components/AppLayout";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

interface HistoryItem { id: string; question: string; options: string[]; votes: number[]; at: number }

export default function HistoryPage() {
  const socketRef = useRef(getSocket());
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const s = socketRef.current;
    const onHistory = (hist: HistoryItem[]) => setItems(hist || []);
    s.emit("teacher:history", (hist: HistoryItem[]) => setItems(hist || []));
    s.on("poll:history", onHistory);
    return () => { s.off("poll:history", onHistory); };
  }, []);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a 
            href="/teacher"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Teacher
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight">View <span className="text-primary">Poll History</span></h1>
        </div>
        {items.length === 0 && <div className="text-muted-foreground">No history yet. Ask a question to see results here.</div>}
        <div className="space-y-8">
          {items.map((it, idx) => (
            <div key={it.id} className="space-y-3">
              <div className="font-medium">Question {items.length - idx}</div>
              <div className="rounded-md border p-4 space-y-3">
                <div className="font-medium">{it.question}</div>
                {it.options.map((opt, i) => {
                  const total = Math.max(1, it.votes.reduce((a, b) => a + b, 0));
                  const pct = Math.round(((it.votes[i] || 0) / total) * 100);
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
