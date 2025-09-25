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
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

const httpServer = createHttpServer(app);

import("socket.io").then(({ Server }) => {
  import("./routes/poll").then(({ PollManager }) => {
    const io = new Server(httpServer, {
      path: "/socket.io",
      cors: { origin: true, credentials: true },
    });
    const manager = new PollManager(io);
    manager.attach();
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