import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: ".",
  publicDir: "public",
  server: {
    host: "::",
    port: 8083,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    emptyOutDir: true,
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);

      // Attach Socket.IO to Vite's underlying HTTP server
      const httpServer = server.httpServer;
      if (httpServer) {
        const { Server } = await import("socket.io");
        const { PollManager } = await import("./server/poll");
        const io = new Server(httpServer, {
          path: "/socket.io",
          cors: { 
            origin: true, 
            credentials: true,
            methods: ["GET", "POST"]
          },
          // Same configuration as production for consistency
          transports: ["polling", "websocket"],
          allowEIO3: true,
          pingTimeout: 60000,
          pingInterval: 25000,
          upgradeTimeout: 30000,
          allowUpgrades: true,
        });
        
        // Add connection logging for development debugging
        io.on('connection', (socket) => {
          console.log(`DEV: Client connected: ${socket.id} via ${socket.conn.transport.name}`);
        });
        
        const manager = new PollManager(io);
        manager.attach();
      }
    },
  };
}
