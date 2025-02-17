"use client"

import { Badge } from "@/components/ui/badge"
import type { WorkoutActiveSessionOutput } from "@/server/api/types/output"
import { api } from "@/trpc/react"
import { useMemo } from "react"

interface CompletedSet {
  logs: Map<
    NonNullable<WorkoutActiveSessionOutput>["workout"]["workoutSets"][number]["workoutSetCollections"][number]["id"],
    NonNullable<WorkoutActiveSessionOutput>["workoutSessionLogs"][number]
  >
  set: NonNullable<WorkoutActiveSessionOutput>["workout"]["workoutSets"][number]
}

type RemainingSets = NonNullable<WorkoutActiveSessionOutput>["workout"]["workoutSets"][number]

type ActiveSet = CompletedSet

interface CurrentSetSplit {
  completedSets: Array<CompletedSet>
  activeSets: Array<ActiveSet>
  remainingSets: Array<RemainingSets>
}

export default function ActiveWorkoutDisplay () {
  const { data: activeWorkoutSession } = api.workout.getActiveWorkoutSession.useQuery()

  const setSplit: CurrentSetSplit = useMemo(() => {
    if (!activeWorkoutSession) {
      return { completedSets: [], remainingSets: [], activeSets: [] };
    }
  
    const { workout, workoutSessionLogs } = activeWorkoutSession;
  
    const completedSets = new Set<string>();
    const remainingSets = new Set<string>();
    const activeSets = new Set<string>()

    workout.workoutSets.forEach(set => {
      const isCompleted = set.workoutSetCollections.every(setCollection => {
        return workoutSessionLogs.some(sessionLog => (
          sessionLog.workoutSetCollectionId === setCollection.id &&
          !!sessionLog.endedAt
        ))
      })
      const hasActiveLog = set.workoutSetCollections.some(setCollection => {
        return workoutSessionLogs.some(sessionLog => sessionLog.workoutSetCollectionId === setCollection.id)
      })

      if (isCompleted) {
        completedSets.add(set.id)
      } else if (hasActiveLog) {
        activeSets.add(set.id)
      } else {
        remainingSets.add(set.id)
      }
    })

    const getLogsForSet = (set: NonNullable<WorkoutActiveSessionOutput>["workout"]["workoutSets"][number]) => {
      const m = new Map<
        NonNullable<WorkoutActiveSessionOutput>["workout"]["workoutSets"][number]["workoutSetCollections"][number]["id"],
        NonNullable<WorkoutActiveSessionOutput>["workoutSessionLogs"][number]
      >()

      for (const setCollection of set.workoutSetCollections) {
        const sessionLog = workoutSessionLogs.find(sessionLog => sessionLog.workoutSetCollectionId === setCollection.id)
        if (sessionLog) {
          m.set(setCollection.id, sessionLog)
        }
      }
      
      return m
    }
  
    return {
      activeSets: [...activeSets].map(setId => ({
        set: workout.workoutSets.find(set => set.id === setId)!,
        logs: getLogsForSet(workout.workoutSets.find(set => set.id === setId)!)
      })),
      completedSets: [...completedSets].map(setId => ({
        set: workout.workoutSets.find(set => set.id === setId)!,
        logs: getLogsForSet(workout.workoutSets.find(set => set.id === setId)!)
      })),
      remainingSets: [...remainingSets].map(setId => 
        workout.workoutSets.find(set => set.id === setId)!
      )
    };
  }, [activeWorkoutSession]);
  

  return (
    <div className="w-full space-y-2 mt-6 px-2">
      <CompletedSetsComponent sets={setSplit.completedSets} />
      <ActiveSetComponent activeSets={setSplit.activeSets} />
      <RemainingSetsComponent sets={setSplit.remainingSets} />
    </div>
  )
}

function CompletedSetsComponent ({ sets }: { sets: CurrentSetSplit["completedSets"] }) {
  if (sets.length === 0) return null

  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="outline" className="border-primary">Completed Sets</Badge>
      <div className="p-2 flex gap-2 flex-col">
        {sets.map(({ logs, set }) => (
          <div className="border px-3 py-2 rounded-md bg-secondary/30" key={set.id}>
            {set.workoutSetCollections.map(setCollection => {
              const log = logs.get(setCollection.id)
              if (!log) return null

              const reps = log.workoutSessionLogFragments.map(f => f.reps)
              const duration = log.workoutSessionLogFragments.map(f => f.duration)
              const weight = log.workoutSessionLogFragments.map(f => f.weight)

              return (
                <div key={setCollection.id} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p>{setCollection.exercise.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Reps</p>
                    {createArrayComponent(reps)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Weight</p>
                    {createArrayComponent(weight, "kg")}
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Duration</p>
                    {createArrayComponent(duration, "s")}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActiveSetComponent ({ activeSets }: { activeSets: CurrentSetSplit["activeSets"] }) {
  if (activeSets.length === 0) return null


  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="default">Active Set</Badge>
      <div className="p-4">
        {activeSets.map(activeSet => {
          const { logs, set } = activeSet

          return (
            <div className="" key={set.id}>
              {set.workoutSetCollections.map(setCollection => {
                const log = logs.get(setCollection.id)
                if (!log) return null

                const completedFragments = log.workoutSessionLogFragments.filter(f => !!f.endedAt)
                const reps = completedFragments.map(f => f.reps)
                const duration = completedFragments.map(f => f.duration)
                const weight = completedFragments.map(f => f.weight)

                return (
                  <div key={setCollection.id} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Name</p>
                      {setCollection.exercise.name}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Reps</p>
                      {createArrayComponent(reps)}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      {createArrayComponent(weight, "kg")}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Duration</p>
                      {createArrayComponent(duration, "s")}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RemainingSetsComponent ({ sets }: { sets: CurrentSetSplit["remainingSets"] }) {
  if (sets.length === 0) return null

  return (
    <div className="bg-card p-2 rounded-md border">
      <Badge variant="secondary">Remaining Sets</Badge>
      <div className="p-4">
        {sets.map(set => (
          <div className="flex gap-2 items-baseline" key={set.id}>
            <p className="text-xs text-muted-foreground">{set.workoutSetCollections.at(0)?.reps.length}x</p>
            <p>{set.workoutSetCollections.at(0)?.exercise.name}</p>
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