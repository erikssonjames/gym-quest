"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useLayoutEffect } from "react"

export default function RedirectNonAdminClientSide () {
  const session = useSession()

  if (session.data?.user.role !== "admin") {

  }

  useLayoutEffect(() => {
    if (session.data?.user.role !== "admin") {
      redirect("/user")
    }
  }, [session])

  return null
}