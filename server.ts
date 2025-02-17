import next from "next";
import { Server as SocketServer, type Socket } from "socket.io";
import express from "express"
import http from "http"

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

declare global {
  // eslint-disable-next-line no-var
  var socketServer: SocketServer | undefined
}

async function startServer () {
  await app.prepare()

  const expressApp = express();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = http.createServer(expressApp); // Create an HTTP server

  // Initialize Socket.io on the HTTP server
  if (!globalThis.socketServer) {
    globalThis.socketServer = new SocketServer(server, {
      cors: {
        origin: ["http://localhost:3000", "https://your-production-url.com"],
        methods: ["GET", "POST"],
      },
    });
  
    // Socket.io connection event
    globalThis.socketServer.on("connection", (socket: Socket) => {
      console.log("✅ Socket connected:", socket.id);
  
      socket.onAny((event, args) => {
        console.log(`Event: ${event}, args: ${JSON.stringify(args)}`)
      })
  
      socket.on("disconnect", () => {
        console.log("⚠️ Socket disconnected:", socket.id);
      });
    });
  }


  // Next.js request handler
  expressApp.all("*", (req, res) => {
    return handler(req, res);
  });

  // Start the server
  server.listen(port, () => {
    console.log(`🚀 Next.js server with WebSocket running on http://localhost:${port}`);
  });
}

startServer().catch((error) => console.error("Server error:", error))
