import type { SocketEventPayloads } from "@/socket/types";
import type { ServerSocketEvent } from "./types";

export function emitServerSocketEvent<T extends keyof SocketEventPayloads>(serverSocketEvent: ServerSocketEvent<T>) {
  if (!socketServer) {
    console.log("Serversocket not connected.... abandoning emit...")
    return
  }
  const { payload, event, recipients } = serverSocketEvent
  
  if (recipients) {
    if (Array.isArray(recipients)) {
      recipients.forEach((userId: string) => {
        socketServer?.to(userId)
      })
      for (const userId of recipients) {
        socketServer.to(userId).emit(event, payload)
      }
    } else {
      socketServer.to(recipients).emit(event, payload)
    }
  } else {
    socketServer.emit(event, payload);
  }

}