"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useLayoutEffect } from "react"

export default function RedirectNonAdminClientSide () {
  const { data: session, status } = useSession()
  const role = session?.user.role

  useLayoutEffect(() => {
    if (status === "authenticated" && (!role || !["admin", "superAdmin"].includes(role))) {
      redirect("/user")
    }
  }, [role, status])

  return null
}
