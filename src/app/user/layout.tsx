import { auth } from "@/auth";
import { redirectIfNoSession } from "@/lib/serverUtils";
import { api } from "@/trpc/server";
import { SessionProvider } from "next-auth/react";

export default async function Layout({
  create,
  main
}: {
  create: React.ReactNode,
  main: React.ReactNode
}) {
  await redirectIfNoSession()
  const user = await api.user.getMe()
  const session = await auth()

  return (
    <SessionProvider session={session}>
      {user.username ? main : create}
    </SessionProvider>
  );
}
