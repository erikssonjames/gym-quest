"use client"

import { Badge } from "@/components/ui/badge"
import type { WorkoutActiveSessionOutput } from "@/server/api/types/output"
import { api } from "@/trpc/react"
import { useMemo } from "react"

type Session = NonNullable<WorkoutActiveSessionOutput>
type SessionLog = Session["workoutSessionLogs"][number]

interface CurrentSetSplit {
  completedSessionLogs: Array<SessionLog>
  activeSessionLogs: Array<SessionLog>
  remainingSessionLogs: Array<SessionLog>
}

export default function ActiveWorkoutDisplay () {
  const { data: activeWorkoutSession } = api.workout.getActiveWorkoutSession.useQuery()

  const setSplit: CurrentSetSplit = useMemo(() => {
    if (!activeWorkoutSession) {
      return { completedSessionLogs: [], activeSessionLogs: [], remainingSessionLogs: [] };
    }
  
    const { workoutSessionLogs } = activeWorkoutSession;
  
    const completedSessionLogs: Array<SessionLog> = [];
    const activeSessionLogs: Array<SessionLog> = []
    const remainingSessionLogs: Array<SessionLog> = []

    workoutSessionLogs.forEach(log => {
      const isCompleted = log.workoutSessionLogFragments.every((fragment) => {
        return fragment.endedAt !== null
      })

      const active = !isCompleted && log.workoutSessionLogFragments.some(f => {
        return f.startedAt !== null
      })

      if (isCompleted) {
        completedSessionLogs.push(log)
      } else if (active) {
        activeSessionLogs.push(log)
      } else {
        remainingSessionLogs.push(log)
      }
    })

    return {
      completedSessionLogs: completedSessionLogs.sort((a, b) => a.order - b.order),
      activeSessionLogs: activeSessionLogs.sort((a, b) => a.order - b.order),
      remainingSessionLogs: remainingSessionLogs.sort((a, b) => a.order - b.order)
    };
  }, [activeWorkoutSession]);
  

  return (
    <div className="w-full space-y-2 mt-6 px-2">
      <CompletedSetsComponent sessionLogs={setSplit.completedSessionLogs} />
      <ActiveSetComponent sessionLogs={setSplit.activeSessionLogs} />
      <RemainingSetsComponent sessionLogs={setSplit.remainingSessionLogs} />
    </div>
  )
}

function CompletedSetsComponent ({ sessionLogs }: { sessionLogs: Array<SessionLog> }) {
  if (sessionLogs.length === 0) return null

  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="outline" className="border-primary">Completed Sets</Badge>
      <div className="px-4 pt-4 pb-2">
        {sessionLogs.map(sessionLog => (
          <div className="flex gap-2 items-baseline" key={sessionLog.id}>
            <p className="text-xs text-muted-foreground">{sessionLog.workoutSessionLogFragments.length}x</p>
            <p>{sessionLog.exercise.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActiveSetComponent ({ sessionLogs }: { sessionLogs: Array<SessionLog> }) {
  if (sessionLogs.length === 0) return null

  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="default">Active Set</Badge>
      <div className="px-3 pt-4 pb-2">
        {sessionLogs.map(({ exercise, workoutSessionLogFragments, id }) => (
          <div className="border px-3 py-2 rounded-md bg-secondary/30" key={id}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Name</p>
                <p>{exercise.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Reps</p>
                {createArrayComponent(
                  workoutSessionLogFragments
                    .filter(f => f.endedAt !== null)
                    .map(f => f.reps)
                ) ?? "-"}
              </div>
              {workoutSessionLogFragments.some(f => f.endedAt !== null && f.weight > 0) && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Weight</p>
                  {createArrayComponent(
                    workoutSessionLogFragments
                      .filter(f => f.endedAt !== null)
                      .map(f => f.weight), 
                    "kg"
                  ) ?? "-"}
                </div>
              )}
              {workoutSessionLogFragments.some(f => f.endedAt !== null && f.duration > 0) && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Duration</p>
                  {createArrayComponent(
                    workoutSessionLogFragments
                      .filter(f => f.endedAt !== null)
                      .map(f => f.duration), 
                    "s"
                  ) ?? "-"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RemainingSetsComponent ({ sessionLogs }: { sessionLogs: Array<SessionLog> }) {
  if (sessionLogs.length === 0) return null

  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="secondary">Remaining Sets</Badge>
      <div className="px-4 pt-4 pb-2">
        {sessionLogs.map(sessionLog => (
          <div className="flex gap-2 items-baseline" key={sessionLog.id}>
            <p className="text-xs text-muted-foreground">{sessionLog.workoutSessionLogFragments.length}x</p>
            <p>{sessionLog.exercise.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const createArrayComponent = (arr: Array<string | number | null>, value?: string) => {
  const allDuplicates = new Set(arr).size <= 1

  if (arr.length === 0) {
    return null
  }

  if (allDuplicates) {
    return (
      <div className="flex gap-1 items-baseline">
        <span className="text-xs">{arr.length}x</span>
        <p>{arr.at(0)}{value}</p>
      </div>
    )
  }

  return <p>{arr.join(" > ")}</p>
}