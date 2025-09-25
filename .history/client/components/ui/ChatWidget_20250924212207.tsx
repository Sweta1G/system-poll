import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Message { id: string; from: string; text: string; at: number }
interface Participant { id: string; name: string }

export default function ChatWidget({ role = "student" }: { role?: "teacher" | "student" }) {
  const socketRef = useRef(getSocket());
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "participants">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const s = socketRef.current;
    const onNew = (m: Message) => setMessages((prev) => [...prev, m]);
    const onHistory = (hist: Message[]) => setMessages(hist);
    const onParticipants = (list: Participant[]) => setParticipants(list);
    s.emit("chat:history", (hist: Message[]) => setMessages(hist || []));
    s.emit("teacher:participants", (list: Participant[]) => setParticipants(list || []));
    s.on("chat:new", onNew);
    s.on("chat:history", onHistory);
    s.on("participants:update", onParticipants);
    return () => {
      s.off("chat:new", onNew);
      s.off("chat:history", onHistory);
      s.off("participants:update", onParticipants);
    };
  }, []);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    socketRef.current.emit("chat:send", v);
    setText("");
  };

  const kick = (id: string) => socketRef.current.emit("teacher:kick", id);

  const badge = useMemo(() => (messages.length ? "" + messages.length : null), [messages.length]);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
      >
        {badge ? (
          <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-destructive px-1 text-xs">{badge}</span>
        ) : null}
        <span className="sr-only">Chat</span>
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-[340px] max-h-[60vh] rounded-lg border bg-background shadow-xl flex flex-col">
          <div className="flex items-center border-b">
            <button className={`flex-1 px-4 py-2 text-sm ${tab === "chat" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`} onClick={() => setTab("chat")}>Chat</button>
            <button className={`flex-1 px-4 py-2 text-sm ${tab === "participants" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`} onClick={() => setTab("participants")}>Participants</button>
          </div>
          {tab === "chat" ? (
            <div className="flex flex-col flex-1">
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="max-w-[80%] rounded-md bg-muted px-3 py-2">
                    <div className="text-xs text-muted-foreground">{m.from}</div>
                    <div className="text-sm">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="border-t p-2 flex gap-2">
                <input
                  className="flex-1 rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type a message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button onClick={send} className="rounded-md bg-primary text-primary-foreground px-3">Send</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>{p.name}</div>
                  {role === "teacher" && (
                    <button className="text-primary hover:underline" onClick={() => kick(p.id)}>Kick out</button>
                  )}
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center text-muted-foreground">No participants</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
