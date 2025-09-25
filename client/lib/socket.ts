import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Force polling-only for production to avoid WebSocket issues on Render
    const isDevelopment = window.location.hostname === 'localhost';
    
    socket = io("/", {
      path: "/socket.io",
      // FORCE polling only for Render - no websocket upgrade
      transports: isDevelopment ? ["websocket"] : ["polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      // Aggressive settings for stable connection
      timeout: 30000,
      forceNew: true, // Force new connection each time
      upgrade: false, // Disable upgrade to prevent connection switching
      rememberUpgrade: false,
    });

    // Aggressive debugging and connection handling
    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      // Force reconnect on any disconnect
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
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
