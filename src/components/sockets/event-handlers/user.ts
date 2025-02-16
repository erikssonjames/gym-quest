import { UserEvents } from "@/socket/enums/user";
import { api } from "@/trpc/react";

type SocketEventHandlerFunction = () => Promise<void> | void;

export function useUserSocketEventHandlers() {
  const utils = api.useUtils();

  const userFunctionsMap: Record<UserEvents, SocketEventHandlerFunction> = {
    [UserEvents.REMOVED_USER_AS_FRIEND]: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
    },
  };

  return { userFunctionsMap };
}
