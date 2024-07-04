import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function redirectIfNoSession () {
  const session = await auth()
  if (!session) redirect('/signin')
}
