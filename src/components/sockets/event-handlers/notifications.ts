import { UserNotifications, WorkoutNotifications } from "@/socket/enums/notifications";
import { api } from "@/trpc/react";

type SocketEventHandlerFunction = () => Promise<void> | void;

export function useNotificationSocketEventHandlers() {
  const utils = api.useUtils();

  const userNotificationFunctionsMap: Record<UserNotifications, SocketEventHandlerFunction> = {
    [UserNotifications.ACCEPTED_FRIEND_REQUEST]: () => {
      void utils.user.getFriends.invalidate();
      void utils.user.getFriendRequests.invalidate();
      void utils.user.getUsers.invalidate();
      void utils.notification.invalidate();
    },
    [UserNotifications.DENIED_FRIEND_REQUEST]: () => {
      void utils.user.getFriendRequests.invalidate();
      void utils.notification.invalidate();
    },
    [UserNotifications.OUTGOING_FRIEND_REQUEST]: async () => {
      void utils.user.getFriendRequests.invalidate();
      void utils.notification.invalidate();
    },
  };

  const workoutNotificationFunctionsMap: Record<WorkoutNotifications, SocketEventHandlerFunction> = {
    [WorkoutNotifications.NEW_WORKOUT_REVIEW]: () => {
      console.log("New workout review handled");
    },
  };

  return { userNotificationFunctionsMap, workoutNotificationFunctionsMap };
}
