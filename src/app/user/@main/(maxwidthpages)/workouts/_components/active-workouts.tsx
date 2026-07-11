"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { ArrowRight, Moon, Play } from "lucide-react";
import Link from "next/link";

export default function ActiveWorkouts() {
  const { data: activeWorkout, isPending } = api.workout.getActiveWorkoutSession.useQuery()

  if (isPending) {
    return (
      <Skeleton className="h-36 w-full rounded-xl" />
    )
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
      <CardContent className="flex min-h-36 items-center p-6">
      {!activeWorkout && (
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Moon className="size-5" /></div>
            <div><p className="font-semibold">No active workout</p><p className="text-sm text-muted-foreground">Choose a plan and make today’s training easy to begin.</p></div>
          </div>
          <Button asChild>
            <Link href="/user/workouts/active/create">
              <Play />Start a workout
            </Link>
          </Button>
        </div>
      )}
      {activeWorkout && (
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Active now</p><p className="mt-1 text-xl font-semibold">{activeWorkout.workout?.name ?? "Open workout"}</p><p className="mt-1 text-sm text-muted-foreground">Your session is waiting for the next useful set.</p></div>
          <Button asChild>
            <Link href="/user/workouts/active">
              Continue workout<ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      )}
      </CardContent>
    </Card>
  )
}
