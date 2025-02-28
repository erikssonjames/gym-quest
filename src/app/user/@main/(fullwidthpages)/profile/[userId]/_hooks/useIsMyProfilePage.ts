import { useSession } from "next-auth/react";
import { useUserId } from "./useUserId";

export function useIsMyProfilePage () {
  const session = useSession()
  const userId = useUserId()

  return session.data?.user.id
    ? session.data.user.id === userId
    : false
}