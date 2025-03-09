"use client"

import { useContainerRef } from "@/app/user/@main/_components/container-ref-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TimerComponent, { TimerSeconds } from "@/components/ui/timer"
import { cn } from "@/lib/utils"
import { ChevronDown, Info, Loader2, Pause, Play, RotateCcw, Timer, X } from "lucide-react"
import { useState, useMemo, type ReactNode, useRef, useEffect} from "react"
import { useWorkoutStepController } from "./hooks/use-workout-step-controller"
import type { Action } from "./hooks/use-workout-actions-builder"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

  const currentPage = useMemo<{ component: ReactNode, header: ReactNode } | null>(() => {
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
        header: <FragmentInputHeader {...partialProps} action={activeStep} />
      };
  
    case "start_workout":
      return {
        component: <StartWorkout {...partialProps} action={activeStep} />,
        header: <StartWorkoutHeader {...partialProps} action={activeStep} />
      };
  
    case "start_exercise":
      return {
        component: <StartExercise {...partialProps} action={activeStep} />,
        header: <StartExerciseHeader {...partialProps} action={activeStep} />
      };
  
    case "start_next_set":
      return {
        component: <GoToNextSet {...partialProps} action={activeStep} />,
        header: <GoToNextSetHeader {...partialProps} action={activeStep} />
      };
  
    case "end_workout":
      return {
        component: <WorkoutCompleted {...partialProps} action={activeStep} />,
        header: <WorkoutCompletedHeader {...partialProps} action={activeStep} />
      };
  
    default:
      return null;
    }
  }, [activeStep, incrementStep, collapsed, isPending]);
  
  if (!ref.current || !currentPage) return null

  return (
    <div className="w-full pb-4">
      <Collapsible className="border rounded-t-lg md:rounded-lg shadow-2xl overflow-hidden">
        <CollapsibleTrigger className="group w-full p-2">
          <div className="w-full px-6 py-4 hover:bg-accent/20 rounded-lg">
            <div className="max-w-96 mx-auto flex justify-between items-center px-6">
              {currentPage.header}
              <ChevronDown className="transition-all text-muted-foreground group-data-[state=open]:rotate-180"/>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent
          className="overflow-hidden data-[state=open]:animate-collapsible-slide-down data-[state=closed]:animate-collapsible-slide-up"
        >
          <div className="px-6 pb-6 pt-2 max-w-96 mx-auto">
            {currentPage.component}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function StartWorkoutHeader ({}: PageProps<"start_workout">) {
  return (
    <div className="flex gap-4 items-center">
      <p className="font-semibold">Start Workout</p>
    </div>
  )
}
function StartWorkout ({ incrementStep, action, isPending}: PageProps<"start_workout">) {
  return (
    <Button 
      className="w-full mt-2" 
      type="button" 
      onClick={() => incrementStep(action)}
      disabled={isPending}
    >
      Start
      {isPending && <Loader2 className="animate-spin" />}
    </Button>
  )
}

function StartExerciseHeader ({}: PageProps<"start_exercise">) {
  return (
    <div className="flex gap-4 items-center">
      <p className="font-semibold">Start Next Exercise</p>
    </div>
  )
}
function StartExercise ({ action, incrementStep, isPending }: PageProps<"start_exercise">) {
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
            <TimerComponent className="text-sm" startTime={latestExerciseEndedAt} />
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

function FragmentInputHeader ({ action }: PageProps<"end_fragment">) {
  const { exercise, fragment } = action.data

  return (
    <div className="flex gap-4 items-center">
      <p className="font-semibold">{exercise.name}</p>
      <TimerComponent className="text-sm" startTime={fragment.startedAt ?? new Date()} />
    </div>
  )
}
function FragmentInput (
  { action, incrementStep, isPending }: PageProps<"end_fragment">
) {
  const { data } = action

  const [openPrevInfo, setOpenPrevInfo] = useState(false)
  const [durationInputType, setDurationInputType] = useState<"timer" | "custom">("timer")

  const [reps, setReps] = useState(data.fragment.reps)
  const [weight, setWeight] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const durationTimerRef = useRef(0)

  const onAddFragment = () => {
    const d = durationInputType === "timer"
      ? durationTimerRef.current
      : duration

    incrementStep({
      ...action,
      data: {
        ...data,
        fragment: {
          ...data.fragment,
          reps,
          weight,
          duration: d
        }
      }
    })
  }

  const { numberOfSets, setsCompleted, fragment, previousData, exercise } = data

  const lastReps = previousData?.orderToReps[fragment.order]
  const lastValues = previousData?.repsToValues[reps]

  return (
    <>
      <div className="grid grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Sets</p>
          <p>{setsCompleted}/{numberOfSets}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Target Reps</p>
          <p>{fragment.reps}</p>
        </div>

        {lastReps && lastValues && (
          <div className="flex items-center justify-end">
            <button 
              className={cn(
                "hover:bg-accent/60 rounded-lg h-10 border flex items-center justify-center px-3 gap-2",
                openPrevInfo && "bg-accent/60"
              )}
              onClick={() => setOpenPrevInfo(!openPrevInfo)}
            >
              <span className="text-sm font-semibold">Set Info</span>
              <Info size={20} />
            </button>
          </div>
        )}
      </div>

      <Collapsible className="overflow-hidden" open={openPrevInfo}>
        <CollapsibleContent
          className="overflow-hidden data-[state=open]:animate-collapsible-slide-down data-[state=closed]:animate-collapsible-slide-up"
        >
          {/* <div className="border p-4 rounded-lg mt-4">
            <div>
              <p>Reps last time doing {exercise.name}</p>
              <p>{lastReps}</p>
            </div>
            <div>
              {lastValues?.lastSet.weight !== undefined && (
                <>
                  <p>Weight last time doing {exercise.name}</p>
                  <p>{lastValues?.lastSet.weight}</p>
                </>
              )}
              {lastValues?.lastSet.duration !== undefined && (
                <>
                  <p>Duration last time doing {exercise.name}</p>
                  <p>{lastValues?.lastSet.duration}</p>
                </>
              )}
              {lastValues?.lastFiveAverage?.weight  !== undefined && (
                <>
                  <p>Weight last 5 sets of {exercise.name}</p>
                  <p>{lastValues?.lastFiveAverage?.weight}</p>
                </>
              )}
              {lastValues?.lastFiveAverage?.weight !== undefined && (
                <>
                  <p>Duration last 5 sets of {exercise.name}</p>
                  <p>{lastValues?.lastFiveAverage?.weight}</p>
                </>
              )}
            </div>
          </div> */}
          <div className="p-4 border rounded-lg mt-4">
            <ExerciseStatsDisplay
              lastReps={lastReps}
              lastValues={lastValues}
              setNumber={fragment.order + 1}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex mt-6 gap-4 px-1">
        <div className="space-y-2 flex-grow">
          <p className="text-xs">Duration (s)</p>
          <div className="h-16 text-3xl border rounded-md flex">
            <div className="h-full flex-grow">
              {durationInputType === "timer" ? (
                <DurationTimer
                  onDurationChange={(duration) => durationTimerRef.current = duration}
                />
              ) : (
                <input 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-transparent h-full ps-3"
                />
              )}
            </div>
            <button
              onClick={() => durationInputType === "timer" ? setDurationInputType("custom") : setDurationInputType("timer")}
              className="h-full hover:bg-accent w-10 flex-shrink-0 flex items-center justify-center border-l"
            >
              {durationInputType === "timer" ? (
                <X size={16} />
              ) : (
                <Timer size={16} />
              )}
            </button>
          </div>
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
function DurationTimer ({ onDurationChange }: { onDurationChange: (duration: number) => void }) {
  const [timestamps, setTimestamps] = useState<Array<{ start: Date, end?: Date }>>([])

  const timeInfo = useMemo(() => {
    const timePassed = Math.floor(timestamps
      .filter(t => t.end !== undefined)
      .reduce<number>((acc, curr) => {
        return acc + ((curr.end!.getTime() - curr.start.getTime()) / 1000)
      }, 0))
    const lastStartedDate  = timestamps.find(t => t.end === undefined)?.start

    return {
      timePassed,
      lastStartedDate
    }
  }, [timestamps])

  useEffect(() => {
    const duration = (
      timeInfo.timePassed + 
      (
        timeInfo.lastStartedDate
          ? (timeInfo.lastStartedDate.getTime() - Date.now()) / 1000
          : 0
      )
    )
    onDurationChange(duration)
  }, [timeInfo])

  const isActive = timestamps.some(t => t.end === undefined)

  const onPause = () => {
    setTimestamps(prev => {
      return prev.map(t => ({
        start: t.start,
        end: t.end ? t.end : new Date()
      }))
    })
  }

  const onPlay = () => {
    setTimestamps(prev => {
      if (prev.some(t => t.end === undefined)) return prev

      return [
        ...prev,
        { start: new Date() }
      ]
    })
  }

  const onReset = () => {
    setTimestamps([])
  }

  return (
    <div className="flex p-2 h-full items-center">
      {timestamps.length === 0 ? (
        <Button
          className="w-full h-full bg-green-600"
          size="icon"
          variant="ghost"
          onClick={() => {
            setTimestamps(prev => {
              return [
                ...prev,
                { start: new Date() }
              ]
            })
          }}
        >
          <Play />
        </Button>    
      ): (
        <div className="flex items-center h-full w-full">
          <div className="flex-grow rounded-r-none rounded-l-md border h-full flex items-center">
            <TimerSeconds
              paused={!isActive}
              className="ps-2 text-xl flex-grow"
              initialSeconds={timeInfo.timePassed} 
              startTime={timeInfo.lastStartedDate}
            />
          </div>
          <div className="flex flex-col h-full w-6">
            <Button 
              size="icon" 
              variant="ghost"
              className="size-4 flex-grow w-full rounded-b-none rounded-tl-none bg-red-700"
              onClick={onReset}
            >
              <RotateCcw />
            </Button>
            <Button 
              size="icon"
              variant="ghost"
              className={cn(
                "size-4 flex-grow min-w-full rounded-t-none rounded-bl-none",
                isActive ? "bg-blue-400" : "bg-green-600"
              )}
              onClick={() => isActive ? onPause() : onPlay()}
            >
              {isActive ? <Pause /> : <Play />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
interface StatValues {
  weight?: number;
  duration?: number;
}
interface LastValues {
  lastSet?: StatValues;
  lastFiveAverage?: StatValues;
}
interface Props {
  lastReps?: number;            // an integer or undefined
  lastValues?: LastValues;      // object with lastSet, lastFiveAverage
  setNumber: number
}
function ExerciseStatsDisplay({ lastReps, lastValues, setNumber }: Props) {
  // If there's no data at all, don't render anything
  if (!lastReps && !lastValues) {
    return null;
  }

  return (
    <div className="space-y-4">
      {lastReps !== undefined && (
        <p className="text-xs">
          Last time, you finished <span className="font-bold">{lastReps}</span> reps 
          for set <span className="font-bold">#{setNumber}</span>. Let&apos;s see if you can match or beat that!
        </p>
      )}
      {lastValues && (
        <StatsTable lastSet={lastValues.lastSet} lastFiveAverage={lastValues.lastFiveAverage} />
      )}
    </div>
  );
}
function StatsTable({
  lastSet,
  lastFiveAverage,
}: {
  lastSet?: StatValues;
  lastFiveAverage?: StatValues;
}) {
  // Check if there's any data to display for each row
  const hasLastSet = lastSet && (lastSet.weight ?? lastSet.duration);
  const hasLastFive = lastFiveAverage && (lastFiveAverage.weight ?? lastFiveAverage.duration);

  // If no data at all, return null
  if (!hasLastSet && !hasLastFive) return null;

  return (
    <table className="w-full max-w-sm text-left text-sm">
      <thead>
        <tr>
          <th className="font-normal"></th>
          <th className="font-normal">Weight</th>
          <th className="font-normal">Duration</th>
        </tr>
      </thead>
      <tbody>
        {/* Last Set row */}
        {hasLastSet && lastSet && (
          <tr>
            <td className="pr-2 font-medium">Last Set</td>
            <td>{lastSet.weight ?? "—"}</td>
            <td>{lastSet.duration ?? "—"}</td>
          </tr>
        )}
        {/* Last 5 Average row */}
        {hasLastFive && lastFiveAverage && (
          <tr>
            <td className="pr-2 font-medium">Last 5 Avg</td>
            <td>{lastFiveAverage.weight ?? "—"}</td>
            <td>{lastFiveAverage.duration ?? "—"}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}


function GoToNextSetHeader ({ action }: PageProps<"start_next_set">) {
  const { workoutSessionLogs } = action.data
  const latestExerciseEndedAt = workoutSessionLogs
    .flatMap(log => log.workoutSessionLogFragments.map(fragment => fragment.endedAt))
    .filter(endedAt => endedAt !== null)
    .sort((a, b) => b.getTime() - a.getTime())
    .at(0)

  return (
    <div className="flex gap-4 items-center">
      <p className="font-semibold">Start Next Set</p>
      <TimerComponent className="text-sm" startTime={latestExerciseEndedAt} />
    </div>
  )
}
function GoToNextSet ({ action, incrementStep, isPending }: PageProps<"start_next_set">) {
  const onStartNextSet = async () => {
    incrementStep(action)
  }

  const { workoutSessionLogs } = action.data
  const nonCompleted = workoutSessionLogs
    .flatMap(log => log.workoutSessionLogFragments)
    .filter(fragment => fragment.endedAt === null).length

  return (
    <>
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
          <p>{nonCompleted}</p>
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

function WorkoutCompletedHeader ({}: PageProps<"end_workout">) {
  return (
    <div className="w-full h-full flex">
      <p>End of workout</p>
    </div>
  )
}
function WorkoutCompleted ({ isPending, incrementStep, action }: PageProps<"end_workout">) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Button onClick={() => incrementStep(action)} disabled={isPending}>
        End Workout
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </div>
  )
}
