"use client"

import { useRouter } from "next/navigation"
import { Loader2, Play } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"

export default function StartWorkoutButton ({ workoutId }: { workoutId: string }) {
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.createWorkoutSession.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
      router.push("/user/workouts/active")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Button type="button" onClick={() => mutate({ workoutId })} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Play />}
      Start workout
    </Button>
  )
}
