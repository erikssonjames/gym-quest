import { getSetCollectionBySessionLog, getStartedSessionLogs, getWorkoutSetByFragment, getWorkoutSetBySessionLog } from "@/lib/workout/sessionUtils";
import type { WorkoutActiveSessionOutput } from "@/server/api/types/output";
import { api } from "@/trpc/react";
import { useCallback, useMemo } from "react";

export function useSessionHealthCheck () {
  const utils = api.useUtils()
  const { 
    mutateAsync: endSessionLog,
    isPending: endSessionLogPending
  } = api.workout.endWorkoutSessionLog.useMutation()
  const { 
    mutateAsync: endSessionLogFragment, 
    isPending: endSessionLogFragmentPending
  } = api.workout.endWorkoutSessionLogFragment.useMutation()

  const isPending = useMemo(() => {
    return endSessionLogFragmentPending ||endSessionLogPending
  }, [endSessionLogFragmentPending, endSessionLogPending])

  const performHealthCheck = useCallback(async (session: NonNullable<WorkoutActiveSessionOutput>) => {
    if (isPending) return false

    const activeSessionLogs = getStartedSessionLogs(session)

    let changes = false

    // If active session log, but set collection should be completed...
    for (const sessionLog of activeSessionLogs) {
      const setCollection = getSetCollectionBySessionLog(session, sessionLog)

      if (!setCollection) {
        // Hmm, an active session log for set collection that doesn't exist
        continue
      }

      if (
        sessionLog.workoutSessionLogFragments.length >= setCollection.reps.length &&
        sessionLog.workoutSessionLogFragments.every(log => !!log.endedAt)
      ) {
        await endSessionLog({
          sessionId: session.id,
          log: {
            id: sessionLog.id,
            workoutSessionId: session.id
          }
        })
        changes = true
      }
    }

    // If has 2 more active session logs and it they're not a part of the same set...
    if (activeSessionLogs.length > 1) {
      const workoutSets = new Set(
        activeSessionLogs
          .map(log => getWorkoutSetBySessionLog(session, log)?.id)
          .filter(set => set !== undefined)
      )

      if (workoutSets.size > 1) {
        // Terminate the oldest set...
        const oldestSessionlog = activeSessionLogs.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime()).at(0)!
        await endSessionLog({
          sessionId: session.id,
          log: {
            id: oldestSessionlog.id,
            workoutSessionId: session.id
          }
        })
        changes = true
      }
    }

    // If has 2 or more active fragments from set collections not a part of the same set
    const activeFragments = session.workoutSessionLogs.flatMap(log => {
      return log.workoutSessionLogFragments.filter(f => !f.endedAt)
    })

    if (activeFragments.length > 1) {
      const workoutSets = new Set(
        activeFragments.map(log => getWorkoutSetByFragment(session, log)).filter(set => set !== undefined).map(set => set?.id)
      )

      if (workoutSets.size > 1) {
        // Terminate the oldest fragment...
        const oldestSessionLogFragment = activeFragments.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime()).at(0)!
        await endSessionLogFragment({
          sessionId: session.id,
          fragment: oldestSessionLogFragment
        })
        changes = true
      }
    }

    if (changes) await utils.workout.getActiveWorkoutSession.invalidate()

    return true
  }, [endSessionLog, endSessionLogFragment, utils, isPending])

  return {
    performHealthCheck,
    isPending
  }

}