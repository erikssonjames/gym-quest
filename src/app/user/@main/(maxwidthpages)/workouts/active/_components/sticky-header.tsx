"use client"

import { H3 } from "@/components/typography/h3";
import EndWorkoutButton from "./end-workout-button";
import { api } from "@/trpc/react";
import { useDisplayTimer } from "@/hooks/use-display-timer";
import { useCheckIfScrolled } from "@/app/user/@main/_components/scroll-provider";

export default function StickyHeader () {
  const { data: activeSession } = api.workout.getActiveWorkoutSession.useQuery()
  const elapsedTime = useDisplayTimer(activeSession?.startedAt)
  const isScrolled = useCheckIfScrolled()

  return (
    <div className="sticky top-0">
      {isScrolled.isScrolled ? (
        <div className="w-full flex justify-end pe-2 pt-2">
          <div className="bg-background border px-2 py-1 rounded-md">
            <p className="text-sm">Time: {elapsedTime}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center">
            <div className="rounded-md">
              <p className="text-sm">{elapsedTime}</p>
            </div>
            <H3 text="Active Workout" />
          </div>
          {activeSession && <EndWorkoutButton workoutSessionId={activeSession.id} />}
        </div>
      )}
    </div>
  )
}