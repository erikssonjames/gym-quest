// global-socket-client.ts
import { env } from "@/env";
import type { SocketEventPayloads, SocketEvent } from "@/socket/types";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      auth: {
        serverSocketKey: env.SERVER_SOCKET_KEY,
      },
    });
    socket.on("connect", () => {
      console.log("Global socket connected:", socket?.id);
    });
  }
  return socket;
}

export function emitSocketEvent<T extends keyof SocketEventPayloads>(socketEvent: SocketEvent<T>) {
  const socket = getSocket()
  const { payload, type, recipients } = socketEvent
  console.log('outgoing event', type, recipients, payload)
  socket.emit(type, { recipients, ...payload });
}
