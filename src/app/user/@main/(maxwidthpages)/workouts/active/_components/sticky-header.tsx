"use client";

import { useDisplayTimer } from "@/hooks/use-display-timer";
import { api } from "@/trpc/react";
import { Clock3 } from "lucide-react";
import EndWorkoutButton from "./end-workout-button";

export default function StickyHeader() {
  const { data: activeSession } =
    api.workout.getActiveWorkoutSession.useQuery();
  const elapsedTime = useDisplayTimer(activeSession?.startedAt ?? undefined);
  const timerText = activeSession?.startedAt ? elapsedTime : "Not started";

  return (
    <header className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur md:-mx-10 md:px-10">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">
            {activeSession?.workout?.name ?? "Active workout"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="size-3.5" />
            <span className="tabular-nums">{timerText}</span>
          </div>
        </div>
        {activeSession && (
          <EndWorkoutButton workoutSessionId={activeSession.id} />
        )}
      </div>
    </header>
  );
}
