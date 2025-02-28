"use client"

import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RedirectIfNoActiveSession () {
  const router = useRouter()
  const { data: activeSession, isFetched } = api.workout.getActiveWorkoutSession.useQuery()

  useEffect(() => {
    if (!isFetched) return

    if (!activeSession) router.push("/user/workouts")
  }, [activeSession, isFetched, router])

  return null
}