import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export function useUserId () {
  const session = useSession()
  const params = useParams<{ userId: string }>()
  return params.userId === "%40me"
    ? session.data?.user.id ?? ""
    : params.userId
}