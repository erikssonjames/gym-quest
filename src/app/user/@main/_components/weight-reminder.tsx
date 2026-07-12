"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Scale } from "lucide-react"

import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"

export default function WeightReminder() {
  const [localDate, setLocalDate] = useState(() => format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLocalDate(format(new Date(), "yyyy-MM-dd"))
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  const { data } = api.weight.getReminderStatus.useQuery({ localDate })
  if (!data?.shouldRemind) return null

  return (
    <Button asChild>
      <Link href="/user/progress/weight" aria-label="Log weight">
        <Scale data-icon="inline-start" />
        <span className="hidden sm:inline">Log weight</span>
      </Link>
    </Button>
  )
}
