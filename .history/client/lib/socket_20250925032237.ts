import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Different configuration for production vs development
    const isDevelopment = window.location.hostname === 'localhost';
    
    socket = io("/", {
      path: "/socket.io",
      // Use polling first for better Render compatibility, then upgrade to websocket
      transports: isDevelopment ? ["websocket"] : ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      // Additional settings for production deployment
      timeout: 20000,
      forceNew: false,
      upgrade: true,
    });

    // Add connection debugging for production
    if (!isDevelopment) {
      socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
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
