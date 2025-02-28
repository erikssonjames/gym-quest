"use client"

import { useContainerRef } from "@/app/user/@main/_components/container-ref-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Timer from "@/components/ui/timer"
import { cn } from "@/lib/utils"
import { ChevronDown, Loader2 } from "lucide-react"
import { useState, useMemo, type ReactNode} from "react"
import { createPortal } from "react-dom"
import { useWorkoutStepController } from "./hooks/use-workout-step-controller"
import type { Action } from "./hooks/use-workout-actions-builder"

type BasePageProps = {
  isCollapsed: boolean,
  toggleCollapse: () => void,
  incrementStep: (completedStep: Action) => void,
  isPending: boolean
}

type PageProps<T> = BasePageProps & {
  action: Extract<Action, { type: T }>
}

export default function WorkoutController () {
  const { activeStep, incrementStep, isPending } = useWorkoutStepController()

  const [collapsed, setCollapsed] = useState(false)
  const ref = useContainerRef()

  const currentPage = useMemo<{ maxH: string; h: string; component: ReactNode } | null>(() => {
    if (!activeStep) return null;
  
    const partialProps: BasePageProps = {
      isCollapsed: collapsed,
      toggleCollapse: () => setCollapsed((prev) => !prev),
      incrementStep,
      isPending
    }

    switch (activeStep.type) {
    case "end_fragment":
      return {
        component: <FragmentInput {...partialProps} action={activeStep} />,
        maxH: "max-h-72",
        h: "h-72",
      };
  
    case "start_workout":
      return {
        component: <StartWorkout {...partialProps} action={activeStep} />,
        maxH: "max-h-32",
        h: "h-32",
      };
  
    case "start_exercise":
      return {
        component: <StartExercise {...partialProps} action={activeStep} />,
        maxH: "max-h-48",
        h: "h-48",
      };
  
    case "start_next_set":
      return {
        component: <GoToNextSet {...partialProps} action={activeStep} />,
        maxH: "max-h-44",
        h: "h-44",
      };
  
    case "end_workout":
      return {
        component: <WorkoutCompleted {...partialProps} action={activeStep} />,
        maxH: "max-h-10",
        h: "h-10",
      };
  
    default:
      return null;
    }
  }, [activeStep, incrementStep, collapsed, isPending]);
  

  if (!ref.current || !currentPage) return null

  return (
    <>
      {createPortal(
        <div className="absolute left-0 right-0 bottom-0 md:px-10 md:pb-4 flex items-center z-10">
          <div className="w-full bg-background border-t md:border p-6 rounded-t-lg md:rounded-lg shadow-2xl max-w-6xl mx-auto max-2">
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
        <div className={!collapsed ? currentPage.h : "h-10"} />
      </div>
    </>
  )
}


function StartWorkout (
  { 
    isCollapsed,
    incrementStep,
    action,
    toggleCollapse,
    isPending
  }: PageProps<"start_workout">
) {
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

      <Button 
        className="w-full mt-2" 
        type="button" 
        onClick={() => incrementStep(action)}
        disabled={isPending}
      >
        Start
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </>
  )
}

function StartExercise (
  { isCollapsed, action, incrementStep, toggleCollapse, isPending }: PageProps<"start_exercise">
) {
  const { exercises, workoutSessionLogs } = action.data
  const latestExerciseEndedAt = workoutSessionLogs
    .map(log => log.endedAt)
    .filter(endedAt => endedAt !== null)
    .sort((a, b) => b.getTime() - a.getTime())
    .at(0)

  const onStartWorkout = () => {
    incrementStep(action)
  }

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
            Upcoming exercise{exercises.length > 1 && "s"}
          </p>
          {exercises.map(exercise => (
            <div key={exercise.id}>
              {exercise.name}
            </div>
          ))}
        </div>

        {latestExerciseEndedAt && (
          <div>
            <p className="text-xs text-muted-foreground">
              Time since last set
            </p>
            <Timer className="text-sm" startTime={latestExerciseEndedAt} />
          </div>
        )}
      </div>


      <Button 
        className="w-full mt-2" 
        type="button" 
        onClick={onStartWorkout} 
        disabled={isPending}
      >
        Start
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </>
  )
}

function FragmentInput (
  { action, incrementStep, toggleCollapse, isCollapsed, isPending }: PageProps<"end_fragment">
) {
  const { data } = action

  const [reps, setReps] = useState(data.fragment.reps)
  const [weight, setWeight] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  const onAddFragment = async () => {
    incrementStep({
      ...action,
      data: {
        ...data,
        fragment: {
          ...data.fragment,
          reps,
          weight,
          duration
        }
      }
    })
  }

  const { exercise, numberOfSets, setsCompleted, fragment } = data

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">{exercise.name}</p>
          <Timer className="text-sm" startTime={fragment.startedAt ?? new Date()} />
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
          <p>{setsCompleted}/{numberOfSets}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Target Reps</p>
          <p>{fragment.reps}</p>
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

      <Button 
        className="w-full mt-8" 
        type="button" 
        onClick={onAddFragment}
        disabled={isPending}
      >
        Complete Set
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </>
  )
}

function GoToNextSet (
  { action, incrementStep, isCollapsed, toggleCollapse, isPending }: PageProps<"start_next_set">
) {
  const onStartNextSet = async () => {
    incrementStep(action)
  }

  const { workoutSessionLogs } = action.data
  const latestExerciseEndedAt = workoutSessionLogs
    .flatMap(log => log.workoutSessionLogFragments.map(fragment => fragment.endedAt))
    .filter(endedAt => endedAt !== null)
    .sort((a, b) => b.getTime() - a.getTime())
    .at(0)

  console.log(workoutSessionLogs)

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <p className="font-semibold">Start Next Set</p>
          <Timer className="text-sm" startTime={latestExerciseEndedAt} />
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
          {workoutSessionLogs.map(col => (
            <div key={col.id}>
              {col.exercise.name}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sets Remaining</p>
          <p>0</p>
        </div>
      </div>

      <Button 
        className="w-full mt-8" 
        type="button" 
        onClick={onStartNextSet}
        disabled={isPending}
      >
        Start
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </>
  )
}

function WorkoutCompleted ({ action, incrementStep, isPending }: PageProps<"end_workout">) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Button onClick={() => incrementStep(action)} disabled={isPending}>
        End Workout
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </div>
  )
}
