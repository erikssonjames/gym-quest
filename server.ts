import next from "next";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http"
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, port });
const handler = app.getRequestHandler();

declare global {
  // eslint-disable-next-line no-var
  var socketServer: SocketServer | undefined
}

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '', true)
    void handler(req, res, parsedUrl)
  })

  if (global.socketServer) {
    await global.socketServer.close()
  }

  global.socketServer = new SocketServer(server, {
    cors: {
      origin: ["http://localhost:3000", "https://gymquest.com", "gym-quest.onrender.com", "www.qymquest.net" ],
      methods: ["GET", "POST"],
    }
  })

  server.listen(port, () => {
    console.log(`> Listeing on PORT: ${port}`)
  })
}).catch((error) => {
  console.error("❌ Server startup error:", error);

})