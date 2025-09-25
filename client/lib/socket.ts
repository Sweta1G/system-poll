import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Force polling-only for production to avoid WebSocket issues on Render
    const isDevelopment = window.location.hostname === 'localhost';
    
    socket = io("/", {
      path: "/socket.io",
      // Use polling for production, websocket for development
      transports: isDevelopment ? ["websocket", "polling"] : ["polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5, // Reduced from 10
      reconnectionDelay: 1000, // Reduced from 2000
      reconnectionDelayMax: 5000,
      timeout: 20000, // Reduced from 30000
      // Remove problematic settings that cause infinite loops
      upgrade: false, // Disable upgrade to prevent connection switching
      rememberUpgrade: false,
    });

    // Basic connection logging without aggressive handling
    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      // Don't force reconnect - let socket.io handle it automatically
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

// Add cleanup function to prevent memory leaks
export function cleanupSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
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
