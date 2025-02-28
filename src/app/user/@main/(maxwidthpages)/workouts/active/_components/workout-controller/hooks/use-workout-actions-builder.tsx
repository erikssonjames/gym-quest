import type { WorkoutActiveSessionOutput } from "@/server/api/types/output"
import type { Exercise } from "@/server/db/schema/exercise"
import { api } from "@/trpc/react"
import { useMemo } from "react"

type Session = NonNullable<WorkoutActiveSessionOutput>
type SessionLog = Session["workoutSessionLogs"][number]
type Fragment = SessionLog["workoutSessionLogFragments"][number]

export type ActionType = 
  "start_workout" | 
  "start_exercise" | 
  "end_fragment" | 
  "start_next_set" | 
  "end_workout"

export interface ActionData {
  start_workout: { sessionId: string }
  start_exercise: { exercises: Array<Exercise>, workoutSessionLogs: Array<SessionLog> }
  start_next_set: { 
    workoutSessionLogs: Array<SessionLog>,
    fragmentToBeStarted: Fragment,
    sessionId: string,
  }
  end_fragment: { 
    sessionId: string,
    fragment: Fragment,
    exercise: Exercise,
    numberOfSets: number,
    setsCompleted: number,
    sessionLogId: string
  }
  end_workout: { sessionId: string }
}

export type Action = {
  [K in ActionType]: {
    type: K
    data: ActionData[K]
  }
}[ActionType]

export function useWorkoutActionsBuilder () {
  const { data: activeWorkoutSession } = api.workout.getActiveWorkoutSession.useQuery()

  const actionLogs: Action[] | undefined = useMemo(() => {
    if (!activeWorkoutSession) return undefined

    const logs: Action[] = []

    if (!getHasWorkoutStarted(activeWorkoutSession)) {
      logs.push({
        type: "start_workout",
        data: { sessionId: activeWorkoutSession.id }
      })
    }

    const nonCompletedSessionLogs = getNonCompletedWorkoutSessionLogs(activeWorkoutSession)
    const orderedAndBundledLogs = orderAndBundleWorkoutSessionLogs(nonCompletedSessionLogs)

    orderedAndBundledLogs.forEach(bundledLogs => {
      const exercises = bundledLogs
        .map(log => log.exercise)
      
      if (!getHasExercisesStarted(bundledLogs)) {
        logs.push({
          type: "start_exercise",
          data: { exercises: exercises, workoutSessionLogs: bundledLogs }
        })
      }

      const numSets = bundledLogs[0]?.workoutSessionLogFragments.length ?? 0
      for (let i = 0; i < numSets; i++) {
        bundledLogs.forEach((log, logIndex) => {
          const orderedFragments = bundledLogs[logIndex]?.workoutSessionLogFragments
            .sort((a, b) => a.order - b.order)
          const fragment = orderedFragments?.at(i)
          const nextFragment = orderedFragments?.at(i + 1)
          if (!fragment) return

          if (fragment.endedAt === null) {
            logs.push({
              type: "end_fragment",
              data: { 
                fragment: fragment,
                sessionId: activeWorkoutSession.id,
                exercise: log.exercise,
                setsCompleted: i + 1,
                numberOfSets: numSets,
                sessionLogId: log.id
              }
            })
          }

          if (nextFragment && nextFragment.startedAt === null) {
            logs.push({
              type: "start_next_set",
              data: { 
                workoutSessionLogs: bundledLogs,
                fragmentToBeStarted: nextFragment,
                sessionId: activeWorkoutSession.id
              }
            })
          }
        })
      }
    })

    logs.push({
      type: "end_workout",
      data: { sessionId: activeWorkoutSession.id }
    })

    return logs
  }, [activeWorkoutSession])

  return actionLogs
}

const getHasWorkoutStarted = (session: NonNullable<WorkoutActiveSessionOutput>) => {
  return session.startedAt !== null
}

const getHasExercisesStarted = (sessionLogs: Array<SessionLog>) => {
  return sessionLogs.every(log => log.startedAt !== null)
}

const getNonCompletedWorkoutSessionLogs = (session: NonNullable<WorkoutActiveSessionOutput>) => {
  return session.workoutSessionLogs.filter(log => {
    return log.endedAt === null
  })
}

const orderAndBundleWorkoutSessionLogs = (
  sessionLogs: NonNullable<WorkoutActiveSessionOutput>["workoutSessionLogs"]
) => {
  const mappedOrderLogs = new Map<
    NonNullable<WorkoutActiveSessionOutput>["workoutSessionLogs"][number]["order"],
    Array<NonNullable<WorkoutActiveSessionOutput>["workoutSessionLogs"][number]>
  >()

  sessionLogs.forEach(log => {
    if (!mappedOrderLogs.has(log.order)) {
      mappedOrderLogs.set(log.order, [])
    }
    mappedOrderLogs.get(log.order)!.push(log)
  })

  return [...mappedOrderLogs]
    .map(([_, logs]) => logs)
    .sort((a, b) => {
      return a[0]!.order - b[0]!.order
    })
}