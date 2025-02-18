import next from "next";
import { Server as SocketServer, type Socket } from "socket.io";
import express from "express"
import http from "http"

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

declare global {
  // eslint-disable-next-line no-var
  var socketServer: SocketServer | undefined
}

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  setTimeout(() => process.exit(1), 3000)
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

async function startServer () {
  try {
    await app.prepare()

    const expressApp = express();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(expressApp); // Create an HTTP server

    if (globalThis.socketServer) {
      await globalThis.socketServer.close()
    }

    // Initialize Socket.io on the HTTP server
    globalThis.socketServer = new SocketServer(server, {
      cors: {
        origin: ["http://localhost:3000", "https://gymquest.com"],
        methods: ["GET", "POST"],
      },
    });

    // Socket.io connection event
    globalThis.socketServer.on("connection", (socket: Socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.onAny((event, args) => {
        if (dev) console.log(`Event: ${event}, args: ${JSON.stringify(args)}`)
      })

      socket.on("disconnect", (reason) => {
        console.log(`⚠️ Socket ${socket.id} disconnected due to: ${reason}`);
        socket.removeAllListeners()
      });
    });


    // Next.js request handler
    expressApp.all("*", (req, res) => {
      return handler(req, res);
    });

    // Start the server
    server.listen(port, () => {
      console.log(`🚀 Next.js server with WebSocket running on http://localhost:${port} in ${dev ? "Dev mode" : "Procution mode"}`);
    });
  } catch (e) {
    console.error("❌ Server startup error:", e);
    process.exit(1); // Exit process if the server fails
  }
}

startServer().catch((error) => console.error("Server error:", error))
