"use client"

import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { H3 } from "@/components/typography/h3"
import RedirectIfActiveSession from "./_components/redirect-if-active-workout"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function CreateWorkoutPage () {
  const utils = api.useUtils()

  const { data: workouts, isPending } = api.workout.getWorkouts.useQuery()
  // const { mutate } = api.workout.addWorkoutSession.useMutation({
  //   onSuccess: () => {
  //     void utils.workout.getActiveWorkoutSession.invalidate()
  //   }
  // })
  

  const [workoutSessionId, setWorkoutSessionId] = useState<string>()
  // const { data: test } = api.workout.test.useQuery()
  const { mutate } = api.workout.createWorkoutSession.useMutation({
    onSuccess: (workoutSessionId) => {
      // void utils.workout.getActiveWorkoutSession.invalidate()
      void utils.workout.getActiveWorkoutSession.invalidate()
      setWorkoutSessionId(workoutSessionId)
    }
  })

  const [searchWorkouts, setSearchWorkouts] = useState("")

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="w-28 h-10" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`${index}-active-workout-skeleton`} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  const filteredWorkouts = workouts 
    ? workouts.filter(w => 
      w.name.toLowerCase().includes(searchWorkouts.toLowerCase())
    )
    : undefined

  return (
    <>
      <RedirectIfActiveSession />

      <div className="flex justify-between items-center w-full gap-4">
        <H3 text="Select Workout" className="flex-shrink-0" />

        <Input
          placeholder="Search..."
          className="w-40 md:w-fit"
          value={searchWorkouts}
          onChange={(e) => setSearchWorkouts(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <div className="space-y-2">
          {workouts && workouts.length === 0 && (
            <div className="w-full">
              <p>Looks like you haven&apos;t added any workouts yet.</p>
              <Button className="mt-4" asChild>
                <Link href="/user/workouts/manage/create?r=./">
                  Add workout
                </Link>
              </Button>
            </div>
          )}

          {filteredWorkouts?.map(workout => (
            <div 
              className="bg-secondary/40 rounded-sm flex justify-between p-4 items-center gap-4" 
              key={workout.id}
            >
              <div>
                <p className="font-semibold">{workout.name}</p>
                <p className="text-muted-foreground text-sm">{workout.description}</p>
              </div>
              <Button onClick={() => mutate({ workoutId: workout.id })} size="sm">Select</Button>
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