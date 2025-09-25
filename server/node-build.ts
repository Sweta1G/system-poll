import path from "path";
import { createServer } from "./routes/index";
import * as express from "express";
import { createServer as createHttpServer } from "http";

const app = createServer();
const port = Number(process.env.PORT || 8083);

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(distPath, "index.html"));
});

const httpServer = createHttpServer(app);

import("socket.io").then(({ Server }) => {
  import("./routes/poll").then(({ PollManager }) => {
    const io = new Server(httpServer, {
      path: "/socket.io",
      cors: { 
        origin: true, 
        credentials: true,
        methods: ["GET", "POST"]
      },
      // Use polling only for production stability
      transports: ["polling"],
      allowEIO3: true,
      // Reasonable timeouts to prevent connection issues
      pingTimeout: 60000,   // 1 minute (reduced from 2 minutes)
      pingInterval: 25000,  // 25 seconds (reduced from 30)
      upgradeTimeout: 10000, // 10 seconds (reduced from 30)
      // Disable upgrades to prevent connection fluctuations
      allowUpgrades: false,
    });
    
    // Basic connection logging (removed custom ID generator)
    io.on('connection', (socket) => {
      console.log(`🟢 Client connected: ${socket.id} via ${socket.conn.transport.name} from ${socket.handshake.address}`);
      
      socket.on('disconnect', (reason) => {
        console.log(`🔴 Client disconnected: ${socket.id}, reason: ${reason}`);
      });
      
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
    
    const manager = new PollManager(io);
    manager.attach();
    
    console.log('🚀 Socket.IO server initialized with polling-only transport');
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Live Polling System running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});