"use client"

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Moon } from "lucide-react";
import Link from "next/link";

export default function ActiveWorkouts() {
  const { data: activeWorkout, isPending } = api.workout.getActiveWorkoutSession.useQuery()

  if (isPending) {
    return (
      <Skeleton className="h-96 w-full" />
    )
  }

  return (
    <div className="bg-card px-10 py-5 rounded-md w-full min-h-96 flex">
      {!activeWorkout && (
        <div className="w-full flex flex-col items-center justify-center gap-6 flex-grow">
          <div className="flex gap-4 text-muted-foreground">
            <p>No active workout</p>
            <Moon />
          </div>

          <Button asChild>
            <Link href="/user/workouts/active/create">
              Start new Workout
            </Link>
          </Button>
        </div>
      )}
      {activeWorkout && (
        <div>
          <p className="text-muted-foreground text-xs">Active workout</p>
          <p>{activeWorkout.workout.name}</p>
          <Button asChild>
            <Link href="/user/workouts/active">
              Continue Workout
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
