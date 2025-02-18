import next from "next";
import { Server } from "socket.io";
import { createServer } from "http"
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, port });
const handler = app.getRequestHandler();

interface ServerToClientEvents {
  noArg: () => void;
  [event: string]: (...args: unknown[]) => void;
  }

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string
}

declare global {
  // eslint-disable-next-line no-var
  var socketServer: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | undefined
}

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '', true)
    void handler(req, res, parsedUrl)
  })

  if (global.socketServer) {
    await global.socketServer.close()
  }

  global.socketServer = new Server(server, {
    cors: {
      origin: ["http://localhost:4000", "https://gymquest.com", "gym-quest.onrender.com", "www.qymquest.net" ],
      methods: ["GET", "POST"],
    }
  })

  global.socketServer.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    const { userId } = socket.handshake.auth as {
      userId?: string;
    };

    if (userId) {
      socket.data
      socket.data.userId = userId;
      void socket.join(userId);
      console.log(`Socket ${socket.id} joined room: ${userId}`);
    } else {
      console.log("User ID not provided, disconnecting socket.");
      socket.disconnect();
      return;
    }

    socket.onAny((event, args) => {
      if (dev) console.log(`Event: ${event}, args: ${JSON.stringify(args)}`)
    })

    socket.on("disconnect", (reason) => {
      console.log(`⚠️ Socket ${socket.id} disconnected due to: ${reason}`);
      socket.removeAllListeners()
    });
  });

  server.listen(port, () => {
    console.log(`> Listening on PORT: ${port}`)
  })
}).catch((error) => {
  console.error("❌ Server startup error:", error);

})