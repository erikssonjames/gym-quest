import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Action, useWorkoutActionsBuilder } from "./use-workout-actions-builder";
import { api } from "@/trpc/react";
import { type WorkoutActiveSessionOutput } from "@/server/api/types/output";

type Session = NonNullable<WorkoutActiveSessionOutput>
type SessionLog = Session["workoutSessionLogs"][number]

export function useWorkoutStepController () {
  const utils = api.useUtils()
  const invalidateSession = useCallback(() => utils.workout.getActiveWorkoutSession.invalidate(), [utils])
  const { 
    mutate: startWorkoutTRPC,
    isPending: startWorkoutPending
  } = api.workout.startWorkoutSession.useMutation({ onSuccess: invalidateSession })
  const { 
    mutateAsync: startExercisesTRPCAsync,
    isPending: startExercisesPending
  } = api.workout.startWorkoutSessionLogs.useMutation()
  const { 
    mutateAsync: startFragmentTRPCAsync,
    isPending: startFragmentPending
  } = api.workout.startWorkoutSessionLogFragment.useMutation()
  const {
    mutateAsync: endSessionLogAsync,
    isPending: endSessionLogPending
  } = api.workout.endWorkoutSessionLog.useMutation()
  const {
    mutate: endWorkoutTRPC,
    isPending: endWorkoutPending
  } = api.workout.endWorkoutSession.useMutation({ onSuccess: invalidateSession })
  const { 
    mutateAsync: endFragmentTRPCAsync,
    isPending: endFragmentPending
  } = api.workout.endWorkoutSessionLogFragment.useMutation({ onSuccess: invalidateSession })

  const actionLogs = useWorkoutActionsBuilder()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [activeActionLogs, setActiveActionLogs] = useState<Action[]>()
  const prevActionLogs = useRef<Action[]>()

  const isPending = useMemo(() => {
    return (
      startWorkoutPending ||
      startExercisesPending ||
      startFragmentPending ||
      endWorkoutPending ||
      endFragmentPending ||
      endSessionLogPending
    )
  }, [
    startWorkoutPending,
    startExercisesPending,
    startFragmentPending,
    endWorkoutPending,
    endFragmentPending,
    endSessionLogPending
  ])

  useEffect(() => {
    if (!actionLogs) return

    if (
      actionLogs.length === prevActionLogs.current?.length &&
      JSON.stringify(actionLogs) === JSON.stringify(prevActionLogs.current)
    ) return

    prevActionLogs.current = actionLogs
    setActiveActionLogs(actionLogs)
    setCurrentStep(0)
  }, [actionLogs])

  const startWorkout = useCallback((
    data: Extract<Action, { type: "start_workout" }>["data"]
  ) => {
    startWorkoutTRPC(data.sessionId)
  }, [startWorkoutTRPC])

  const startExercise = useCallback(async (
    data: Extract<Action, { type: "start_exercise" }>["data"]
  ) => {
    const sessionLogs = data.workoutSessionLogs
    const nextFragment = getNextFragment(data.workoutSessionLogs)

    const fragmentId = nextFragment?.id
    const sessionId = sessionLogs.at(0)?.workoutSessionId

    if (!fragmentId || !sessionId) return

    try {
      await startExercisesTRPCAsync(
        sessionLogs.map(log => ({
          workoutSessionId: log.workoutSessionId,
          workoutSessionLogId: log.id
        }))
      )
      await startFragmentTRPCAsync({
        fragmentId,
        sessionId
      })
      await invalidateSession()
    } catch {}
  }, [startExercisesTRPCAsync, startFragmentTRPCAsync, invalidateSession])

  const endActiveFragment = useCallback(async (
    data: Extract<Action, { type: "end_fragment" }>["data"]
  ) => {
    try {
      await endFragmentTRPCAsync({
        sessionId: data.sessionId,
        fragment: data.fragment
      })

      if (data.setsCompleted === data.numberOfSets) {
        await endSessionLogAsync({
          sessionId: data.sessionId,
          sessionLogId: data.sessionLogId
        })
      }

      await invalidateSession()
    } catch {}
  }, [endFragmentTRPCAsync, endSessionLogAsync, invalidateSession])

  const startNextSet = useCallback(async (
    data: Extract<Action, { type: "start_next_set" }>["data"]
  ) => {
    const { fragmentToBeStarted, sessionId } = data

    try {
      await startFragmentTRPCAsync({
        sessionId,
        fragmentId: fragmentToBeStarted.id
      })
      await invalidateSession()
    } catch {}
  }, [startFragmentTRPCAsync, invalidateSession])

  const endWorkout = useCallback((
    data: Extract<Action, { type: "end_workout" }>["data"]
  ) => {
    endWorkoutTRPC(data.sessionId)
  }, [endWorkoutTRPC])

  const incrementStep = useCallback((activeStep: Action,) => {
    if (isPending) return

    switch (activeStep.type) {
    case "start_workout":
      startWorkout(activeStep.data); break;
    case "start_exercise":
      void startExercise(activeStep.data); break;
    case "end_fragment":
      void endActiveFragment(activeStep.data); break;
    case "start_next_set":
      void startNextSet(activeStep.data); break;
    case "end_workout":
      endWorkout(activeStep.data); break;
    }

    setCurrentStep(prev => {
      return Math.min(prev + 1, activeActionLogs?.length ?? 0)
    })
  }, [
    startWorkout,
    startExercise,
    endActiveFragment,
    startNextSet,
    endWorkout,
    activeActionLogs,
    isPending
  ])

  return {
    incrementStep,
    actionLogs: activeActionLogs,
    activeStep: activeActionLogs?.at(currentStep),
    isPending
  }
}

function getNextFragment (logs: SessionLog[]) {
  const nextFragments = logs
    .sort((a, b) => a.order - b.order)
    .flatMap(log => {
      return log.workoutSessionLogFragments
        .map(f => ({ ...f, sessionId: log.workoutSessionId }))
        .filter(fragment => {
          return fragment.endedAt === null
        })
    }).sort((a, b) => a.order - b.order)

  return nextFragments.at(0)
}