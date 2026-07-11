"use client"

import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { H3 } from "@/components/typography/h3"
import RedirectIfActiveSession from "./_components/redirect-if-active-workout"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Loader2, Play, Plus, Search } from "lucide-react"
import { toast } from "sonner"

export default function CreateWorkoutPage () {
  const utils = api.useUtils()
  const router = useRouter()

  const { data: workouts, isPending } = api.workout.getWorkouts.useQuery()
  // const { data: test } = api.workout.test.useQuery()
  const { mutate, isPending: isCreatingSession } = api.workout.createWorkoutSession.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
      router.push("/user/workouts/active")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [searchWorkouts, setSearchWorkouts] = useState("")

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`${index}-active-workout-skeleton`} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const filteredWorkouts = workouts?.filter(w => {
    const query = searchWorkouts.toLowerCase()
    return (
      w.name.toLowerCase().includes(query) ||
      w.description.toLowerCase().includes(query)
    )
  })
  const hasSavedWorkouts = (workouts?.length ?? 0) > 0
  const hasFilteredWorkouts = (filteredWorkouts?.length ?? 0) > 0

  return (
    <>
      <RedirectIfActiveSession />

      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Dumbbell className="size-4" />
                Workout session
              </div>
              <div>
                <H3 text="Start a workout" />
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Use a saved plan, or start with a blank session and add exercises as you go.
                </p>
              </div>
            </div>

            <Button
              className="w-full md:w-auto"
              onClick={() => mutate({ workoutId: null })}
              disabled={isCreatingSession}
            >
              {isCreatingSession ? <Loader2 className="animate-spin" /> : <Play />}
              Start empty workout
            </Button>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Saved workouts</p>
            <p className="text-xs text-muted-foreground">
              {hasSavedWorkouts
                ? `${workouts?.length ?? 0} saved workout${workouts?.length === 1 ? "" : "s"} available`
                : "No saved workouts yet"}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workouts"
              className="pl-9"
              value={searchWorkouts}
              onChange={(e) => setSearchWorkouts(e.target.value)}
              disabled={!hasSavedWorkouts}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="space-y-2">
          {!hasSavedWorkouts && (
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Build your first saved workout when you are ready.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saved workouts are reusable plans. For today, the empty workout above is ready to use.
                  </p>
                </div>
                <Button variant="secondary" asChild>
                  <Link href="/user/workouts/manage/create?r=./">
                    <Plus />
                    Create saved workout
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {hasSavedWorkouts && !hasFilteredWorkouts && (
            <Card>
              <CardContent className="p-5">
                <p className="font-medium">No saved workouts match that search.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Clear the search, choose an empty workout, or create a new saved plan.
                </p>
              </CardContent>
            </Card>
          )}

          {filteredWorkouts?.map(workout => (
            <div 
              className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm"
              key={workout.id}
            >
              <div className="min-w-0">
                <p className="font-semibold">{workout.name}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{workout.description}</p>
              </div>
              <Button
                onClick={() => mutate({ workoutId: workout.id })}
                size="sm"
                disabled={isCreatingSession}
              >
                {isCreatingSession ? <Loader2 className="animate-spin" /> : <Play />}
                Select
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* {test && <div>
        <pre>{JSON.stringify(test, null, 4)}</pre>
      </div>} */}
    </>
  )
}
