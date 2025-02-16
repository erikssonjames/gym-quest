"use client"

import { useContainerRef } from "@/app/user/@main/_components/container-ref-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Timer from "@/components/ui/timer"
import { cn } from "@/lib/utils"
import {
  getActiveSessionLog,
  getActiveSessionLogFragment,
  getIndexForFragment,
  getLastActiveSessionLogFragment,
  getMostRecentEndedSessionLog,
  getNextExercise,
  getNextWorkoutSet,
  getNextWorkoutSetCollection,
  getSessionLogBySetCollection,
  getSessionLogWithFewestFragments,
  getStartedSessionLog,
  getWorkoutSetBySessionLog,
  getWorkoutSetCollectionByFragment,
  hasEqualNumberOfFragments,
  hasStartedSessionLog,
  hasStartedSessionLogFragment,
  hasUnfinishedExercise,
  isSuperSet
} from "@/lib/workout/sessionUtils"
import type { WorkoutActiveSessionOutput } from "@/server/api/types/output"
import { api } from "@/trpc/react"
import { ChevronDown, Loader2 } from "lucide-react"
import { useState, useMemo, type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useSessionHealthCheck } from "./hooks/use-session-health-check"

type WorkoutControllerState = "start_workout" | "start_exercise" | "start_set" | "active_set" | "unknown" | "workout_completed" | "loading"
type PageProps = {
  isCollapsed: boolean,
  toggleCollapse: () => void,
  session: NonNullable<WorkoutActiveSessionOutput>
}

export default function WorkoutController () {
  const { data: session } = api.workout.getActiveWorkoutSession.useQuery()
  const { mutate: createFragment, isPending } = api.workout.addWorkoutSessionLogFragment.useMutation()
  const [collapsed, setCollapsed] = useState(false)
  const ref = useContainerRef()

  const healthCheck = useSessionHealthCheck()
  const [isHealthCheckPending, setIsHealthCheckPending] = useState(false);
  const [isSessionHealthy, setIsSessionHealthy] = useState(false);

  useEffect(() => {
    if (!session) return;

    let isMounted = true; // Prevent state update if unmounted
    setIsHealthCheckPending(true);

    healthCheck.performHealthCheck(session).then(() => {
      if (isMounted) {
        setIsSessionHealthy(true);
      }
    }).catch(() => {
      if (isMounted) {
        setIsSessionHealthy(false);
      }
    }).finally(() => {
      setIsHealthCheckPending(false);
    });

    return () => { isMounted = false };
  }, [session, healthCheck]);

  const [currentState, setCurrentState] = useState<WorkoutControllerState>("loading")

  useEffect(() => {
    if (!session || isPending) {
      setCurrentState("loading")
      return
    }

    if (!isSessionHealthy || isHealthCheckPending) {
      return
    }

    if (!hasUnfinishedExercise(session)) {
      setCurrentState("workout_completed")
      return
    }

    if (!hasStartedSessionLog(session)) {
      setCurrentState("start_exercise")
      return
    }

    const activeSessionLog = getStartedSessionLog(session)
    if (!activeSessionLog) {
      setCurrentState("unknown")
      return
    }
    const activeSet = getWorkoutSetBySessionLog(session, activeSessionLog)
    if (!activeSet) {
      setCurrentState("unknown")
      return
    }

    if (hasStartedSessionLogFragment(activeSessionLog)) {
      setCurrentState("active_set")
      return
    }

    if (!isSuperSet(activeSet) || hasEqualNumberOfFragments(session, activeSet)) {
      setCurrentState("start_set")
      return
    }

    const shouldStartFragmentForThisCollection = getSessionLogWithFewestFragments(session, activeSet)
    createFragment({
      fragment: {
        startedAt: new Date(),
        workoutSessionLogId: shouldStartFragmentForThisCollection.id,
        
      },
      sessionId: session.id
    })
  }, [session, createFragment, isPending, isHealthCheckPending, isSessionHealthy])

  const currentPage = useMemo<{ maxH: string, h: string, component: ReactNode } | null>(() => {
    if (!session) return null

    const props: PageProps = {
      isCollapsed: collapsed,
      toggleCollapse: () => setCollapsed(prev => !prev),
      session
    }

    switch (currentState) {
    case "active_set":
      return { component: <FragmentInput {...props} />, maxH: 'max-h-72', h: 'h-72' }
    case "start_workout":
      return { component: <StartWorkout {...props} />, maxH: 'max-h-32', h: 'h-32' }
    case "start_exercise":
      return { component: <StartExercise {...props} />, maxH: "max-h-48", h: 'h-48' }
    case "start_set":
      return { component: <GoToNextSet {...props} />, maxH: "max-h-44", h: 'h-44' }
    case "workout_completed":
      return { component: "Workout completed", maxH: "max-h-40", h: 'h-40' }
    case "unknown":
      return { component: "Unknown", maxH: "max-h-40", h: 'h-40' }
    case "loading": 
      return { component: <Loading />, maxH: "max-h-10", h: 'h-10' }
    }
  }, [currentState, session, collapsed])

  if (!session || !ref.current || !currentPage) return null

  

  return (
    <>
      {createPortal(
        <div className="absolute left-0 right-0 bottom-0 md:px-10 md:pb-4 flex items-center z-10 p-2">
          <div className="w-full bg-background border p-6 rounded-lg shadow-2xl max-w-6xl mx-auto max-2">
            <div 
              className={cn(
                "max-w-96 mx-auto overflow-hidden transition-all h-44",
                collapsed ? "max-h-10" : currentPage.maxH,
                currentPage.h
              )}
            >
              {currentPage.component}
            </div>
          </div>
        </div>,
        ref.current
      )}

      <div className="pt-6 pb-10">
        <div className={currentPage.h} />
      </div>
    </>
  )
}


function StartWorkout ({ isCollapsed, session, toggleCollapse }: PageProps) {
  const set = getNextWorkoutSet(session)

  const utils = api.useUtils()
  const { mutateAsync } = api.workout.addWorkoutSessionLog.useMutation({
    onSuccess: async () => {
      await utils.workout.getActiveWorkoutSession.invalidate()
    }
  })

  const onStartWorkout = async () => {
    if (!set) return
    const setCollection = getNextWorkoutSetCollection(set)
    if (!setCollection) return

    await mutateAsync({
      exerciseId: setCollection.exerciseId,
      workoutSessionId: session.id,
      workoutSetCollectionId: setCollection.id
    })
  }

  if (!set) return null

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">Start Workout</p>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleCollapse} type="button">
          <ChevronDown 
            className={cn(
              "transition-all",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <Button className="w-full mt-2" type="button" onClick={onStartWorkout}>Start</Button>
    </>
  )
}

function StartExercise ({ isCollapsed, session, toggleCollapse }: PageProps) {
  const exercise = getNextExercise(session)
  const mostRecentSessionLog = getMostRecentEndedSessionLog(session)

  const utils = api.useUtils()
  const { mutateAsync: startSessionLogs } = api.workout.startWorkoutSessionLogs.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
    }
  })

  const onStartWorkout = async () => {
    if (!exercise) return
    await startSessionLogs(
      exercise.workoutSetCollections.map(col => ({
        exerciseId: col.exerciseId,
        workoutSessionId: session.id,
        workoutSetCollectionId: col.id
      }))
    )
  }

  if (!exercise) return null

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">Start Next Exercise</p>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleCollapse} type="button">
          <ChevronDown 
            className={cn(
              "transition-all",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="flex gap-8 mb-7">
        <div className="">
          <p className="text-xs text-muted-foreground">
            Upcoming exercise{exercise.workoutSetCollections.length > 1 && "s"}
          </p>
          {exercise.workoutSetCollections.map(col => (
            <div key={col.id}>
              {col.exercise.name}
            </div>
          ))}
        </div>

        {mostRecentSessionLog?.endedAt && (
          <div>
            <p className="text-xs text-muted-foreground">
              Time since last set
            </p>
            <Timer className="text-sm" startTime={mostRecentSessionLog.endedAt} />
          </div>
        )}
      </div>


      <Button className="w-full mt-2" type="button" onClick={onStartWorkout}>Start</Button>
    </>
  )
}

function FragmentInput ({ session, toggleCollapse, isCollapsed }: PageProps) {
  const activeFragment = getActiveSessionLogFragment({ session })

  const utils = api.useUtils()
  const { mutateAsync: endFragment } = api.workout.endWorkoutSessionLogFragment.useMutation({
    onSuccess: async () => {
      await utils.workout.getActiveWorkoutSession.invalidate()
    }
  })

  const index = activeFragment ? getIndexForFragment(session, activeFragment) : 0
  const activeSetCollection = activeFragment ? getWorkoutSetCollectionByFragment(session, activeFragment) : undefined
  const target = activeSetCollection?.target.at(index)
  const targetReps = activeSetCollection?.reps.at(index)
  const sessionLog = activeSetCollection ? getSessionLogBySetCollection(session, activeSetCollection) : undefined

  const [reps, setReps] = useState(targetReps ?? 0)
  const [weight, setWeight] = useState<number>(target?.targetWeight ?? 0)
  const [duration, setDuration] = useState<number>(target?.targetDuration ?? 0)

  const onAddFragment = async () => {
    if (!activeFragment || !sessionLog || !activeSetCollection) return

    await endFragment({
      sessionId: session.id,
      fragment: {
        workoutSessionLogId: activeFragment.workoutSessionLogId,
        id: activeFragment.id,
        reps,
        weight,
        duration,
        skipped: false
      }
    })
  }

  if (!activeFragment || !activeSetCollection || !sessionLog) return null

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">{activeSetCollection.exercise.name}</p>
          <Timer className="text-sm" startTime={activeFragment.startedAt} />
        </div>

        <Button variant="ghost" size="icon" onClick={toggleCollapse} type="button">
          <ChevronDown 
            className={cn(
              "transition-all",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="grid grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Sets</p>
          <p>{sessionLog.workoutSessionLogFragments.length}/{activeSetCollection.reps.length}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Target Reps</p>
          <p>{targetReps ?? 0}</p>
        </div>
      </div>

      <div className="flex mt-6 gap-4 px-1">
        <div className="space-y-2">
          <p className="text-xs">Duration (s)</p>
          <Input value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="!text-3xl h-16" />
        </div>
        <div className="space-y-2">
          <p className="text-xs">Weight (kg)</p>
          <Input value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="!text-3xl h-16 w-20" />
        </div>
        <div className="space-y-2">
          <p className="text-xs">Reps</p>
          <Input value={reps} onChange={(e) => setReps(Number(e.target.value))} className="!text-3xl h-16 w-20" />
        </div>
      </div>

      <Button className="w-full mt-8" type="button" onClick={onAddFragment}>Complete Set</Button>
    </>
  )
}

function GoToNextSet ({ session, isCollapsed, toggleCollapse }: PageProps) {
  const nextSet = getNextWorkoutSet(session)
  const lastActiveSessionLog = getActiveSessionLog(session)
  const lastActiveSessionLogFragment = nextSet ? getLastActiveSessionLogFragment(session, nextSet) : undefined

  const utils = api.useUtils()
  const { mutateAsync: startNewFragment } = api.workout.addWorkoutSessionLogFragment.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
    }
  })

  const onStartNextSet = async () => {
    if (!nextSet) return
    const startFragmentFor = nextSet.workoutSetCollections.sort((a, b) => a.order - b.order).at(0)
    if (!startFragmentFor) return
    const setCollection = getSessionLogBySetCollection(session, startFragmentFor)
    if (!setCollection) return

    await startNewFragment({
      sessionId: session.id,
      fragment: {
        startedAt: new Date(),
        workoutSessionLogId: setCollection.id
      }
    })
  }

  if (!nextSet || !lastActiveSessionLogFragment || !lastActiveSessionLog) return null

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">Start Next Set</p>
          <Timer className="text-sm" startTime={lastActiveSessionLogFragment.endedAt} />
        </div>

        <Button variant="ghost" size="icon" onClick={toggleCollapse} type="button">
          <ChevronDown 
            className={cn(
              "transition-all",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="flex items-baseline gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Exercise</p>
          {nextSet.workoutSetCollections.map(col => (
            <div key={col.id}>
              {col.exercise.name}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sets Remaing</p>
          <p>{(nextSet.workoutSetCollections.at(0)?.reps.length ?? 0) - lastActiveSessionLog.workoutSessionLogFragments.length}</p>
        </div>
      </div>

      <Button className="w-full mt-8" type="button" onClick={onStartNextSet}>Start</Button>
    </>
  )
}

function Loading () {
  return (
    <div className="flex gap-2 items-center justify-center h-full">
      <p>Loading...</p>
      <Loader2 className="animate-spin" />
    </div>
  )
}