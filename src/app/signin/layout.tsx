import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ErrorIndicator from "./_components/error-indicator";

export default async function Layout({
  children,
}: {
    children: React.ReactNode;
  }) {
  const session = await auth()
  if (session?.user) redirect('/user')

  return (
    <>
      {children}
      <ErrorIndicator />
    </>
  )
}