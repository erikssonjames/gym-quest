import type { SocketEventPayloads } from "@/socket/types"

export interface ServerSocketEvent<T extends keyof SocketEventPayloads> {
  recipients?: string | Array<string>
  event: T
  payload: SocketEventPayloads[T] 
}