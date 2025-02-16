import type { NotificationSocketEventPayloads } from "./notifications";
import type { WorkoutSocketEventPayloads } from "./workout";
import type { UserSocketEventPayloads } from "./user";

export type SocketEventPayloads = NotificationSocketEventPayloads & WorkoutSocketEventPayloads & UserSocketEventPayloads;

export interface SocketEvent<T extends keyof SocketEventPayloads> {
  type: T
  recipients?: string[] | string
  payload: SocketEventPayloads[T]
}