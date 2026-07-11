"use client"

import type { WorkoutActiveSessionOutput } from "@/server/api/types/output"
import { api } from "@/trpc/react"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDot,
  Grip,
  Link2,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  SquareStack,
  Trash,
  X
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CSS } from "@dnd-kit/utilities"
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import SelectExercise from "../../manage/create/_components/select-exercise"
import { useExerciseName } from "@/hooks/use-exercise-name"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Session = NonNullable<WorkoutActiveSessionOutput> 
type SessionLog = Session["workoutSessionLogs"][number]
type Fragment = SessionLog["workoutSessionLogFragments"][number]

interface PlanGroup {
  id: string
  order: number
  sessionLogs: SessionLog[]
  status: "completed" | "active" | "future"
}

function groupByOrder(logs: SessionLog[]): PlanGroup[] {
  const map = new Map<number, SessionLog[]>()

  for (const log of logs) {
    if (!map.has(log.order)) {
      map.set(log.order, [])
    }
    map.get(log.order)!.push(log)
  }

  return Array.from(map.entries())
    .sort(([orderA], [orderB]) => orderA - orderB)
    .map(([order, sessionLogs]) => {
      const sortedLogs = sessionLogs
        .map(log => ({
          ...log,
          workoutSessionLogFragments: [...log.workoutSessionLogFragments].sort((a, b) => a.order - b.order)
        }))
        .sort((a, b) => a.exercise.name.localeCompare(b.exercise.name))
      const fragments = sortedLogs.flatMap(log => log.workoutSessionLogFragments)
      const isCompleted = fragments.length > 0 && fragments.every(fragment => fragment.endedAt !== null)
      const isActive = !isCompleted && fragments.some(fragment => (
        fragment.startedAt !== null || fragment.endedAt !== null
      ))

      return {
        id: sortedLogs.map(log => log.id).join("-"),
        order,
        sessionLogs: sortedLogs,
        status: isCompleted ? "completed" : isActive ? "active" : "future"
      }
    })
}

export default function ActiveWorkoutDisplay () {
  const { data: activeWorkoutSession } = api.workout.getActiveWorkoutSession.useQuery()
  const [planOpen, setPlanOpen] = useState(false)

  const planGroups = useMemo(() => {
    if (!activeWorkoutSession) return []

    return groupByOrder(activeWorkoutSession.workoutSessionLogs)
  }, [activeWorkoutSession])

  useEffect(() => {
    if (activeWorkoutSession?.workoutSessionLogs.length === 0) setPlanOpen(true)
  }, [activeWorkoutSession?.workoutSessionLogs.length])

  if (!activeWorkoutSession) return null

  const remainingSetCount = activeWorkoutSession.workoutSessionLogs.reduce((count, log) => {
    return count + log.workoutSessionLogFragments.filter(fragment => fragment.endedAt === null).length
  }, 0)

  return (
    <Collapsible className="mt-4 w-full pb-8" onOpenChange={setPlanOpen} open={planOpen}>
      <div className="flex items-center justify-between gap-3 border-y py-3">
        <CollapsibleTrigger asChild>
          <Button className="h-auto min-w-0 justify-start px-2 py-1" variant="ghost">
            <ListChecks className="size-4 flex-shrink-0" />
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold">Session plan</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {remainingSetCount} remaining · {planGroups.length} group{planGroups.length === 1 ? "" : "s"}
              </span>
            </span>
            <ChevronDown className={cn("size-4 flex-shrink-0 transition-transform", planOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <AddSetDialog
          sessionId={activeWorkoutSession.id}
          startingOrder={
            activeWorkoutSession.workoutSessionLogs.reduce<number>((acc, curr) => {
              return acc > curr.order ? acc : curr.order
            }, -1) + 1
          }
        />
      </div>

      <CollapsibleContent>
        <div className="pt-3">
          {planGroups.length === 0
            ? (
              <div className="rounded-md border border-dashed p-5">
                <div className="max-w-lg">
                  <p className="font-medium">This workout is empty.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add an exercise to build the session as you train.
                  </p>
                </div>
              </div>
            )
            : <PlanGroupList sessionId={activeWorkoutSession.id} groups={planGroups} />}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function PlanGroupList ({ sessionId, groups }: { sessionId: string, groups: PlanGroup[] }) {
  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.swapSessionLogPositions.useMutation({
    onSuccess: () => utils.workout.getActiveWorkoutSession.invalidate()
  })
  const [futureGroups, setFutureGroups] = useState(groups.filter(group => group.status === "future"))

  useEffect(() => {
    setFutureGroups(groups.filter(group => group.status === "future"))
  }, [groups])

  const lockedGroups = groups.filter(group => group.status !== "future")

  return (
    <div className="space-y-3 pb-16">
      {lockedGroups.map(group => (
        <PlanGroupCard key={group.id} group={group} isMovingPending={false} />
      ))}

      {futureGroups.length > 0 && (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext
            items={futureGroups.map(group => group.id)}
            strategy={verticalListSortingStrategy}
          >
            {futureGroups.map(group => (
              <SortablePlanGroupCard
                key={group.id}
                group={group}
                isMovingPending={isPending}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )

  function handleDragEnd (event: DragEndEvent) {
    if (isPending) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFutureGroups(prev => {
        const fromIndex = prev.findIndex(group => group.id === active.id)
        const toIndex = prev.findIndex(group => group.id === over.id)
        const movedArray = arrayMove(prev, fromIndex, toIndex)
        const firstFutureOrder = futureGroups.at(0)?.order ?? lockedGroups.length
        const newOrder = movedArray.flatMap((group, index) => (
          group.sessionLogs.map(log => ({
            id: log.id,
            order: firstFutureOrder + index
          }))
        ))

        mutate({
          fragments: newOrder,
          sessionId
        })

        return movedArray.map((group, index) => ({
          ...group,
          order: firstFutureOrder + index
        }))
      })
    }
  }
}

function SortablePlanGroupCard (
  { group, isMovingPending }:  { group: PlanGroup, isMovingPending: boolean }
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setDraggableNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: group.id,
    disabled: isMovingPending
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div style={style} {...attributes} ref={setNodeRef}>
      <PlanGroupCard
        group={group}
        isMovingPending={isMovingPending}
        isDragging={isDragging}
        dragHandleRef={setDraggableNodeRef}
        dragListeners={listeners}
      />
    </div>
  )
}

function PlanGroupCard ({
  group,
  isMovingPending,
  isDragging,
  dragHandleRef,
  dragListeners
}: {
  group: PlanGroup,
  isMovingPending: boolean,
  isDragging?: boolean,
  dragHandleRef?: (element: HTMLElement | null) => void,
  dragListeners?: ReturnType<typeof useSortable>["listeners"]
}) {
  const setCount = group.sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0
  const canEdit = group.status === "future"

  return (
    <div className={cn(
      "rounded-md border bg-card/20 p-3",
      group.status === "active" && "border-primary/60 bg-primary/5",
      group.status === "completed" && "border-primary/40 bg-primary/5",
      isDragging && "outline outline-primary/20"
    )}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {canEdit && dragHandleRef ? (
            <button
              className={cn(
                "mt-1 text-muted-foreground",
                isMovingPending
                  ? "cursor-wait"
                  : isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
              )}
              {...dragListeners}
              disabled={isMovingPending}
              ref={dragHandleRef}
              type="button"
            >
              {isMovingPending ? <Loader2 className="animate-spin" size={16} /> : <Grip size={16} />}
            </button>
          ) : (
            <StatusIcon status={group.status} />
          )}
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="font-semibold">{group.sessionLogs.map(log => log.exercise.name).join(", ")}</p>
              <p className="text-xs text-muted-foreground">{setCount} set{setCount === 1 ? "" : "s"}</p>
            </div>
            <p className="text-xs capitalize text-muted-foreground">{group.status}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <EditRemainingSetDialog sessionLogs={group.sessionLogs} />
            <DeleteRemainingSetDialog sessionLogs={group.sessionLogs} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {group.sessionLogs.map(log => (
          <div key={log.id} className="rounded-sm border bg-background/30 p-2">
            <p className="mb-2 text-sm font-medium">{log.exercise.name}</p>
            <div className="space-y-1">
              {log.workoutSessionLogFragments.map(fragment => (
                <SetFragmentRow key={fragment.id} fragment={fragment} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusIcon ({ status }: { status: PlanGroup["status"] }) {
  if (status === "completed") return <CircleCheck className="mt-1 size-5 flex-shrink-0 text-primary" />
  if (status === "active") return <CircleDot className="mt-1 size-5 flex-shrink-0 text-primary" />
  return <Circle className="mt-1 size-5 flex-shrink-0" />
}

function SetFragmentRow ({ fragment }: { fragment: Fragment }) {
  let status: "Skipped" | "Done" | "Active" | "Planned" = "Planned"
  if (fragment.startedAt) status = "Active"
  if (fragment.startedAt && fragment.endedAt) status = "Done"
  if (!fragment.startedAt && fragment.endedAt) status = "Skipped"

  return (
    <div className="grid grid-cols-[auto,1fr] gap-2 rounded-sm px-2 py-1 text-sm md:grid-cols-[auto,1fr,1fr]">
      <p className="text-xs font-medium text-muted-foreground">#{fragment.order + 1}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <Metric label="Reps" value={fragment.reps} />
        <Metric label="Weight" value={`${fragment.weight}kg`} />
        <Metric label="Duration" value={`${fragment.duration}s`} />
        <Metric label="Rest" value={`${fragment.restTime}s`} />
      </div>
      <p className={cn(
        "text-xs font-medium md:text-right",
        status === "Done" && "text-primary",
        status === "Skipped" && "text-muted-foreground",
        status === "Active" && "text-primary",
        status === "Planned" && "text-muted-foreground"
      )}>
        {status}
      </p>
    </div>
  )
}

function Metric ({ label, value }: { label: string, value: string | number }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-xs text-muted-foreground">{label}: </span>
      <span>{value}</span>
    </span>
  )
}

type EditedSessionLogs = Array<
  Omit<SessionLog, "workoutSessionLogFragments"> &
  { 
    workoutSessionLogFragments: Array<
      Omit<SessionLog["workoutSessionLogFragments"][number], "id"> &
      { id?: string }
    >
  }
>

function EditRemainingSetDialog ({ sessionLogs }: { sessionLogs: Array<SessionLog> }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.editSessionLogs.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
      setDialogOpen(false)
      toast.success("Successfully updated the set.")
    }
  })

  const [editedLogs, setEditedLogs] = useState<EditedSessionLogs>(sessionLogs)
  const [numberOfSets, setNumberOfSets] = useState(
    sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0
  )

  useEffect(() => {
    setEditedLogs(sessionLogs)
    setNumberOfSets(sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0)
  }, [sessionLogs])

  const onSaveChanges = () => {
    const newLogs = {
      previousLogs: sessionLogs.map(log => {
        const { workoutSessionLogFragments, ...sessionLog } = log
        return {
          sessionLog,
          fragments: workoutSessionLogFragments
        }
      }),
      newLogs: editedLogs.map(log => {
        const { workoutSessionLogFragments, ...sessionLog } = log
        return {
          sessionLog,
          fragments: workoutSessionLogFragments
        }
      })
    }

    mutate(newLogs)
  }

  const onReset = () => {
    setEditedLogs(sessionLogs)
    setNumberOfSets(sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0)
  }
  
  useEffect(() => {
    setEditedLogs(prev => (
      prev.map(log => ({
        ...log,
        workoutSessionLogFragments: resizeFragments(log.workoutSessionLogFragments, numberOfSets, log.id)
      }))
    ))
  }, [numberOfSets])

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setEditedLogs(sessionLogs)
            setNumberOfSets(sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0)
          }, 300)
        }
        setDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="size-7" size="icon" variant="outline">
          <Pencil size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Edit {sessionLogs.length > 1 ? "superset" : "set"}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        
        <SessionLogsEditor
          logs={editedLogs}
          numberOfSets={numberOfSets}
          setNumberOfSets={setNumberOfSets}
          setLogs={setEditedLogs}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
          <Button 
            type="button" 
            onClick={onSaveChanges}
            disabled={isPending || editedLogs.length === 0 || numberOfSets === 0}
          >
            Save changes
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type EditableLogs = Array<{
  id?: string
  exerciseId: string
  order: number
  startedAt: Date | null
  endedAt: Date | null
  workoutSessionId: string
  workoutSessionLogFragments: Array<{
    id?: string
    workoutSessionLogId?: string
    order: number
    reps: number
    weight: number
    duration: number
    restTime: number
    startedAt: Date | null
    endedAt: Date | null
  }>
}>

function SessionLogsEditor<T extends EditableLogs> ({
  logs,
  numberOfSets,
  setNumberOfSets,
  setLogs
}: {
  logs: T,
  numberOfSets: number,
  setNumberOfSets: (sets: number) => void,
  setLogs: (updater: (prev: T) => T) => void
}) {
  const { getExerciseName } = useExerciseName()

  return (
    <div className="max-h-[65vh] space-y-4 overflow-auto pr-1">
      {logs.map((log, logIndex) => (
        <div key={log.id ?? `${log.exerciseId}-${logIndex}`} className="relative rounded-md border bg-card/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <div className="w-full md:w-fit md:min-w-60">
                <p className="text-xs text-muted-foreground">Exercise</p>

                <SelectExercise
                  onSelectExercise={(newExerciseId) => {
                    setLogs(prev => {
                      const copy = [...prev] as T
                      const oldLog = copy[logIndex]
                      if (!oldLog) return prev
                      copy[logIndex] = {
                        ...oldLog,
                        exerciseId: newExerciseId
                      }
                      return copy
                    })
                  }}
                  button={({ onClick }) => (
                    <Button onClick={onClick} type="button" variant="ghost" className="ps-0 text-xl">
                      {getExerciseName(log.exerciseId)}
                      <ChevronDown />
                    </Button>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Sets</p>
                  <Input
                    value={numberOfSets}
                    onChange={(e) => setNumberOfSets(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
                    className="w-12"
                  />
                </div>

                <IntegerSelectArray
                  label="Reps"
                  onSetValues={(reps) => updateFragmentValues(setLogs, logIndex, "reps", reps)}
                  numberOfSets={numberOfSets}
                  initialValues={log.workoutSessionLogFragments.map(f => f.reps)}
                />

                <IntegerSelectArray
                  label="Weight (kg)"
                  onSetValues={(weight) => updateFragmentValues(setLogs, logIndex, "weight", weight)}
                  numberOfSets={numberOfSets}
                  initialValues={log.workoutSessionLogFragments.map(f => f.weight)}
                />

                <IntegerSelectArray
                  label="Duration (s)"
                  onSetValues={(duration) => updateFragmentValues(setLogs, logIndex, "duration", duration)}
                  numberOfSets={numberOfSets}
                  initialValues={log.workoutSessionLogFragments.map(f => f.duration)}
                />

                <IntegerSelectArray
                  label="Rest (s)"
                  onSetValues={(restTime) => updateFragmentValues(setLogs, logIndex, "restTime", restTime)}
                  numberOfSets={numberOfSets}
                  initialValues={log.workoutSessionLogFragments.map(f => f.restTime)}
                />
              </div>
            </div>

            {logs.length > 1 && (
              <Button
                type="button"
                onClick={() => {
                  setLogs(prev => prev.filter((_, index) => index !== logIndex) as T)
                }}
                size="icon"
                variant="ghost"
                className="size-7"
              >
                <X />
              </Button>
            )}
          </div>

          {logIndex !== logs.length - 1 && logs.length > 0 && (
            <div className="absolute -bottom-4 left-2 flex items-center justify-center">
              <button
                className="group relative m-0 p-0"
                type="button"
                onClick={() => {
                  setLogs(prev => (
                    prev.map((prevLog, index) => ({
                      ...prevLog,
                      order: index <= logIndex ? prevLog.order : prevLog.order + 1
                    })) as T
                  ))
                }}
              >
                <Link2 className="rotate-90 text-primary opacity-100 transition-all group-hover:opacity-0" />
                <X className="absolute inset-0 text-primary opacity-0 transition-all group-hover:opacity-100" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function updateFragmentValues<T extends EditableLogs>(
  setLogs: (updater: (prev: T) => T) => void,
  logIndex: number,
  key: "reps" | "weight" | "duration" | "restTime",
  values: Array<number>
) {
  setLogs(prev => {
    const copy = [...prev] as T
    const oldLog = copy[logIndex]
    if (!oldLog) return prev
    copy[logIndex] = {
      ...oldLog,
      workoutSessionLogFragments: oldLog.workoutSessionLogFragments
        .map((fragment, index) => ({
          ...fragment,
          [key]: values.at(index) ?? 0
        }))
    }
    return copy
  })
}

function resizeFragments<T extends EditableLogs[number]["workoutSessionLogFragments"]>(
  fragments: T,
  numberOfSets: number,
  workoutSessionLogId?: string
): T {
  if (fragments.length < numberOfSets) {
    const newFragments = [...fragments]
    for (let i = 0; i < (numberOfSets - fragments.length); i++) {
      newFragments.push({
        weight: 0,
        reps: 0,
        workoutSessionLogId,
        order: fragments.length + i,
        duration: 0,
        restTime: 0,
        endedAt: null,
        startedAt: null
      })
    }
    return newFragments as T
  }

  return fragments.slice(0, numberOfSets) as T
}

function IntegerSelectArray(
  { label, onSetValues, numberOfSets, initialValues }: 
  { label: string, onSetValues: (values: Array<number>) => void, numberOfSets: number, initialValues: Array<number> }
) {
  const [splitValues, setSplitValues] = useState(false)
  const [internalValues, setInternalValues] = useState(initialValues)

  const onSetValuesCallback = useCallback((arr: number[]) => {
    onSetValues(arr)
  }, [onSetValues])

  const onInputChange = useCallback((val: string, index: number) => {
    let copyValues = []
    if (numberOfSets > internalValues.length) {
      copyValues = [
        ...internalValues,
        ...Array.from({ length: Math.max(1, numberOfSets - internalValues.length) }).map(() => Number(internalValues[internalValues.length - 1]) ?? 0)
      ]
    } else {
      copyValues = internalValues.slice(0, Math.max(1, numberOfSets))
    }

    if (splitValues) {
      copyValues[index] = isNaN(Number(val)) ? 0 : Number(val)
    } else {
      copyValues = copyValues.map(() => isNaN(Number(val)) ? 0 : Number(val))
    }

    setInternalValues(copyValues)
    onSetValuesCallback(copyValues)
  }, [onSetValuesCallback, internalValues, numberOfSets, splitValues])

  useEffect(() => {
    setInternalValues((prev) => {
      if (numberOfSets === 0) return [prev.at(0) ?? 0]

      if (numberOfSets > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: Math.max(1, numberOfSets - prev.length) }).map(() => Number(prev[prev.length - 1]) ?? 0)
        ]
      } else {
        return prev.slice(0, numberOfSets)
      }
    })
  }, [numberOfSets, splitValues])

  useEffect(() => {
    setInternalValues((previousValues) => {
      if (
        previousValues.length === initialValues.length &&
        previousValues.every((value, index) => value === initialValues[index])
      ) {
        return previousValues
      }

      return initialValues
    })
  }, [initialValues])

  useEffect(() => {
    if (numberOfSets <= 1 || numberOfSets > 10) setSplitValues(false)
  }, [numberOfSets])

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={cn(
        "relative",
        splitValues && numberOfSets > 0 && "rounded-sm border border-dashed border-accent-foreground/40 p-1"
      )}>
        {splitValues && numberOfSets > 0 ? (
          <div className="flex gap-2 pe-10">
            {Array.from({ length: numberOfSets }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  value={internalValues.at(index) ?? 0} 
                  onChange={(e) => onInputChange(e.target.value, index)} 
                  className="h-8 w-12" />
                {index < numberOfSets - 1 && <ChevronRight size={12} />}
              </div>
            ))}
          </div>
        ) : (
          <Input value={internalValues[0] ?? 0} onChange={(e) => onInputChange(e.target.value, 0)} className="w-20 pe-10" />
        )}
        {numberOfSets > 1 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant={splitValues ? "ghost" : "secondary"}
                  size="icon" 
                  className={cn(
                    "absolute bottom-0 top-0 m-2 size-6",
                    splitValues && numberOfSets > 0 ? "-right-0" : "right-0 m-2 size-6"
                  )}
                  disabled={numberOfSets > 10}
                  onClick={() => setSplitValues(!splitValues)}
                >
                  {splitValues && numberOfSets > 0 ? <X /> : <SquareStack />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {splitValues && numberOfSets <= 10 ? `Assign same ${label} for each set` : `Assign specific ${label} for each set`}
                {numberOfSets > 10 && "You can assign specific values for sets this large"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

function DeleteRemainingSetDialog ({ sessionLogs }: { sessionLogs: Array<SessionLog> }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.deleteSessionLogs.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
      setDialogOpen(false)
      toast.success("Successfully deleted the set.")
    }
  })

  const deleteSessionLogs = () => {
    mutate(
      sessionLogs.map(log => ({
        sessionId: log.workoutSessionId,
        sessionLogId: log.id
      }))
    )
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => setDialogOpen(open)}
    >
      <DialogTrigger asChild>
        <Button 
          className="size-7"
          size="icon"
          variant="destructive"
        >
          <Trash size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Delete {sessionLogs.length > 1 ? "superset" : "set"}</DialogTitle>
          <DialogDescription>Please confirm you want to delete this set.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={deleteSessionLogs}
            disabled={isPending}
          >
            Delete set
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AddedSessionLogs = Array<
  Omit<SessionLog, "workoutSessionLogFragments" | "exercise" | "id"> &
  { 
    workoutSessionLogFragments: Array<
      Omit<SessionLog["workoutSessionLogFragments"][number], "id" | "workoutSessionLogId"> &
      { id?: string }
    >
  }
>

function AddSetDialog ({ sessionId, startingOrder }: { sessionId: string, startingOrder: number }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.addSessionLogs.useMutation({
    onSuccess: () => {
      void utils.workout.getActiveWorkoutSession.invalidate()
      setDialogOpen(false)
      setAddedLogs([])
      setNumberOfSets(0)
      toast.success("Successfully added the set.")
    }
  })

  const [addedLogs, setAddedLogs] = useState<AddedSessionLogs>([])
  const [numberOfSets, setNumberOfSets] = useState(0)

  useEffect(() => {
    setAddedLogs(prev => (
      prev.map(log => ({
        ...log,
        workoutSessionLogFragments: resizeFragments(log.workoutSessionLogFragments, numberOfSets)
      }))
    ))
  }, [numberOfSets])

  const addSessionLogs = () => {
    mutate(addedLogs.map(log => {
      const { workoutSessionLogFragments, ...sessionLog } = log
      return {
        sessionLog,
        fragments: workoutSessionLogFragments
      }
    }))
  }

  const addExercise = (exerciseId: string) => {
    const newSessionLog: AddedSessionLogs[number] = {
      exerciseId,
      order: startingOrder,
      endedAt: null,
      startedAt: null,
      workoutSessionId: sessionId,
      workoutSessionLogFragments: resizeFragments([], Math.max(numberOfSets, 1))
    }
    setNumberOfSets(prev => Math.max(prev, 1))
    setAddedLogs(prev => [...prev, newSessionLog])
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setAddedLogs([])
          setNumberOfSets(0)
        }
        setDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          Add Exercise
          <Plus size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Add set</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {addedLogs.length === 0 ? (
            <SelectExercise
              onSelectExercise={addExercise}
              button={({ onClick }) => (
                <Button onClick={onClick} type="button" variant="ghost" className="text-xl">
                  Select exercise
                  <ChevronDown />
                </Button>
              )}
            />
          ) : (
            <>
              <SessionLogsEditor
                logs={addedLogs}
                numberOfSets={numberOfSets}
                setNumberOfSets={setNumberOfSets}
                setLogs={setAddedLogs}
              />

              <SelectExercise
                onSelectExercise={addExercise}
                button={({ onClick }) => (
                  <Button onClick={onClick} type="button" variant="secondary" size="sm">
                    Add Exercise
                    <Plus size={14} />
                  </Button>
                )}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            type="button" 
            onClick={addSessionLogs}
            disabled={isPending || addedLogs.length === 0 || numberOfSets === 0}
          >
            Add set
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
