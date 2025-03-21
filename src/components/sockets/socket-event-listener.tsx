"use client";

import type { SocketEventPayloads } from "@/socket/types";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useNotificationSocketEventHandlers } from "./event-handlers/notifications";
import { useUserSocketEventHandlers } from "./event-handlers/user";
import { useWorkoutSocketEventHandlers } from "./event-handlers/workout";
import type { WorkoutSocketEventPayloads } from "@/socket/types/workout";

export default function SocketEventListener() {
  const { data: sessionData } = useSession();
  const myUserId = sessionData?.user.id;

  // Memoize the handlers so they don't change on every render
  const { userNotificationFunctionsMap, workoutNotificationFunctionsMap } =
    useNotificationSocketEventHandlers();
  const { userFunctionsMap } = useUserSocketEventHandlers();
  const { workoutFunctionsMap } = useWorkoutSocketEventHandlers()

  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!myUserId) return;

    // Only create the socket if it hasn't been created yet
    if (!socketRef.current) {
      socketRef.current = io({
        auth: { userId: myUserId },
      });
    }

    const socket = socketRef.current;

    // Define event handlers
    const handleConnect = () => {
      console.log("Connected to socket");
    };

    const handleAny = <E extends keyof SocketEventPayloads>(
      event: E, 
      args: SocketEventPayloads[E]
    ) => {
      if (event in userNotificationFunctionsMap) {
        void userNotificationFunctionsMap[event as keyof typeof userNotificationFunctionsMap]?.();
      } else if (event in workoutNotificationFunctionsMap) {
        void workoutNotificationFunctionsMap[event as keyof typeof workoutNotificationFunctionsMap]?.();
      } else if (event in userFunctionsMap) {
        void userFunctionsMap[event as keyof typeof userFunctionsMap]?.();
      } else if (event in workoutFunctionsMap) {
        const workoutEvent = event as keyof WorkoutSocketEventPayloads
        const data = args as WorkoutSocketEventPayloads[typeof workoutEvent]
        void (workoutFunctionsMap[workoutEvent] as (data: WorkoutSocketEventPayloads[typeof workoutEvent]) => void)(data);      }
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.onAny(handleAny);

    // Cleanup function to remove listeners
    return () => {
      socket.off("connect", handleConnect);
      socket.offAny(handleAny);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId]); // Only depend on myUserId

  return null;
}
