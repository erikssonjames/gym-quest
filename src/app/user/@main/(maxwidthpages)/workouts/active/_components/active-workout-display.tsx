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

type Session = NonNullable<WorkoutActiveSessionOutput> 
type SessionLog = Session["workoutSessionLogs"][number]

interface CurrentSetSplit {
  completedSessionLogs: Array<Array<SessionLog>>
  activeSessionLogs: Array<Array<SessionLog>>
  remainingSessionLogs: Array<Array<SessionLog>>
}

function groupByOrder(logs: SessionLog[]): Array<Array<SessionLog>> {
  const map = new Map<number, SessionLog[]>();

  for (const log of logs) {
    if (!map.has(log.order)) {
      map.set(log.order, []);
    }
    map.get(log.order)!.push(log);
  }

  // Sort by the `order` key, then collect each group as an array
  return Array.from(map.entries())
    .sort(([orderA], [orderB]) => orderA - orderB)
    .map(([, group]) => group);
}

export default function ActiveWorkoutDisplay () {
  const { data: activeWorkoutSession } = api.workout.getActiveWorkoutSession.useQuery()

  const setSplit: CurrentSetSplit = useMemo(() => {
    if (!activeWorkoutSession) {
      return { completedSessionLogs: [], activeSessionLogs: [], remainingSessionLogs: [] };
    }

    const { workoutSessionLogs } = activeWorkoutSession;
  
    const completed: SessionLog[] = [];
    const active: SessionLog[] = [];
    const remaining: SessionLog[] = [];

    workoutSessionLogs.forEach(log => {
      const isCompleted = log.workoutSessionLogFragments.every((fragment) => fragment.endedAt !== null);
      const isActive = !isCompleted && log.workoutSessionLogFragments.some((f) => f.startedAt !== null);

      if (isCompleted) {
        completed.push(log);
      } else if (isActive) {
        active.push(log);
      } else {
        remaining.push(log);
      }
    });

    return {
      completedSessionLogs: groupByOrder(completed),
      activeSessionLogs: groupByOrder(active),
      remainingSessionLogs: groupByOrder(remaining),
    };
  }, [activeWorkoutSession]);

  if (!activeWorkoutSession) return null

  return (
    <div className="w-full space-y-2 mt-6 flex-grow overflow-auto">
      <CompletedSetsComponent sessionLogs={setSplit.completedSessionLogs} />
      <ActiveSetComponent sessionLogs={setSplit.activeSessionLogs} />
      <RemainingSetsComponent 
        sessionLogs={setSplit.remainingSessionLogs}
        sessionId={activeWorkoutSession.id}
      />
      <div className="h-14 flex items-end">
        <AddSetDialog
          sessionId={activeWorkoutSession.id}
          startingOrder={
            activeWorkoutSession.workoutSessionLogs.reduce<number>((acc, curr) => {
              return acc > curr.order ? acc : curr.order
            }, 0) + 1
          }
        />
      </div>
    </div>
  )
}

function CompletedSetsComponent ({ sessionLogs }: { sessionLogs: Array<Array<SessionLog>> }) {
  if (sessionLogs.length === 0) return null

  return sessionLogs.map(logs => (
    <div 
      key={logs.map(log => log.id).join("-")} 
      className="flex gap-4 items-center"
    >
      <CircleCheck className="size-5 text-green-400" />
      <div className="flex items-baseline gap-2">
        <p className="text-xs text-muted-foreground">
          {logs.at(0)?.workoutSessionLogFragments.length ?? 0}x
        </p>
        <p>{logs.map(log => log.exercise.name).join(", ")}</p>
      </div>
    </div>
  ))
}

function ActiveSetComponent ({ sessionLogs }: { sessionLogs: Array<Array<SessionLog>> }) {
  if (sessionLogs.length === 0) return null

  return sessionLogs.map(logs => (
    <div 
      key={logs.map(log => log.id).join("-")} 
      className="flex gap-4 items-center"
    >
      <CircleDot className="size-5 text-blue-600" />
      <div className="flex items-baseline gap-2">
        <p className="text-xs text-muted-foreground">
          {logs.at(0)?.workoutSessionLogFragments.length ?? 0}x
        </p>
        <p>{logs.map(log => log.exercise.name).join(", ")}</p>
      </div>
    </div>
  ))
  
}

function RemainingSetsComponent (
  { sessionLogs, sessionId }: { sessionLogs: Array<Array<SessionLog>>, sessionId: string }
) {
  const utils = api.useUtils()
  const { mutate, isPending } = api.workout.swapSessionLogPositions.useMutation({
    onSuccess: () => utils.workout.getActiveWorkoutSession.invalidate()
  })
  const [tempSessionLogs, setTempSessionLogs] = useState(
    sessionLogs.map(logs => ({
      id: logs.map(log => log.id).join("-"),
      sessionLogs: logs
    }))
  )

  useEffect(() => {
    setTempSessionLogs(
      sessionLogs.map(logs => ({
        id: logs.map(log => log.id).join("-"),
        sessionLogs: logs
      }))
    )
  }, [sessionLogs])

  if (sessionLogs.length === 0) return null

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={tempSessionLogs}
        strategy={verticalListSortingStrategy}
      >
        {tempSessionLogs.map(({ id, sessionLogs: logs }) => (
          <RemainingSetComponent 
            key={id} 
            sessionLogs={logs} 
            isMovingPending={isPending} 
          />
        ))}
      </SortableContext>
    </DndContext>
  )

  function handleDragEnd (event: DragEndEvent) {
    if (isPending) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTempSessionLogs(prev => {
        const fromIndex = prev.findIndex(log => log.id === active.id)
        const toIndex = prev.findIndex(log => log.id === over.id)

        const movedArray = arrayMove(prev, fromIndex, toIndex)
        const newOrder = movedArray.map((fragment, index) => ({
          id: fragment.id,
          order: index
        }))

        mutate({
          fragments: newOrder,
          sessionId
        })

        return movedArray
      })
    }
  }
}
function RemainingSetComponent (
  { sessionLogs, isMovingPending }:  { sessionLogs: Array<SessionLog>, isMovingPending: boolean }
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
    id: sessionLogs.map(log => log.id).join("-"),
    disabled: isMovingPending
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      className="flex gap-4 items-center justify-between cursor-default"
      style={style}
      {...attributes}
      ref={setNodeRef}
    >
      <div className="flex gap-4 items-center">
        <button 
          className={cn(
            "text-muted-foreground",
            isMovingPending 
              ? "cursor-wait" 
              : isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
          )}
          {...listeners}
          disabled={isMovingPending}
          ref={setDraggableNodeRef}
        >
          {isMovingPending ? <Loader2 className="animate-spin" size={16} /> : <Grip size={16} />}
        </button>
        <Circle className="size-5" />
        <div className="flex items-baseline gap-2">
          <p className="text-xs text-muted-foreground">
            {sessionLogs.at(0)?.workoutSessionLogFragments.length ?? 0}x
          </p>
          <p>{sessionLogs.map(log => log.exercise.name).join(", ")}</p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <EditRemainingSetDialog sessionLogs={sessionLogs} />
        <DeleteRemainingSetDialog sessionLogs={sessionLogs} />
      </div>
    </div>
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
  const { getExerciseName } = useExerciseName()

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
  }
  
  useEffect(() => {
    setEditedLogs(prev => {
      const copy = prev.map(p => {
        let newFragments = [...p.workoutSessionLogFragments]
        if (p.workoutSessionLogFragments.length < numberOfSets) {
          for (let i = 0; i < (numberOfSets - p.workoutSessionLogFragments.length); i++) {
            newFragments.push({
              weight: 0,
              reps: 0,
              workoutSessionLogId: p.id,
              order: p.workoutSessionLogFragments.length + i,
              duration: 0,
              endedAt: null,
              startedAt: null
            })
          }
        } else {
          newFragments = newFragments.slice(0, numberOfSets)
        }

        return {
          ...p,
          workoutSessionLogFragments: newFragments
        }
      })

      return copy
    })
  }, [numberOfSets])

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setEditedLogs(sessionLogs)
          }, 500)
        }
        setDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="size-7" size="icon" variant="outline">
          <Pencil size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Edit {sessionLogs.length > 1 ? "super set" : "set"}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {Object.values(editedLogs
            .reduce<Record<number, EditedSessionLogs>>((acc, curr) => {
              if (!(curr.order in acc)) {
                acc[curr.order] = []
              }
              acc[curr.order]!.push(curr)
              return acc
            }, {}))
            .map(logs => (
              <div 
                key={`${logs.map(l => l.id).join("~")}-edit-set`}
                className="space-y-2"
              >
                {logs.map((log, logIndex) => (
                  <div key={log.id} className="relative">
                    <div className="relative p-4 bg-card/20 rounded-md border">
                      <div className="w-full flex gap-2 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          <div className="w-full md:w-fit md:min-w-60">
                            <p className="text-xs text-muted-foreground">Select Exercise</p>
      
                            <SelectExercise
                              onSelectExercise={(newExerciseId) => {
                                setEditedLogs(prev => {
                                  const copy = [...prev]
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
                                <Button onClick={onClick} type="button" variant="ghost" className="text-xl ps-0">
                                  {getExerciseName(log.exerciseId)}
                                  <ChevronDown />
                                </Button>
                              )}
                            />
                          </div>
      
                          <div className="flex gap-2 flex-wrap">
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
                              onSetValues={(reps) => {
                                setEditedLogs(prev => {
                                  const copy = [...prev]
                                  const oldLog = copy[logIndex]
                                  if (!oldLog) return prev
                                  copy[logIndex] = {
                                    ...oldLog,
                                    workoutSessionLogFragments: oldLog.workoutSessionLogFragments
                                      .map((f, index) => ({
                                        ...f,
                                        reps: reps.at(index) ?? 0
                                      }))
                                  }
                                  return copy
                                })
                              }}
                              numberOfSets={numberOfSets}
                              initialValues={log.workoutSessionLogFragments.map(f => f.reps)}
                            />
                          </div>
                        </div>
      
                        {editedLogs.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => {
                              setEditedLogs(prev => {
                                const copy = [...prev]
                                return copy.filter(l => l.id !== log.id)
                              })
                            }}
                            size="icon" 
                            variant="ghost" 
                            className="size-7"
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    </div>

      
                    {logIndex !== logs.length - 1 && logs.length > 0 && (
                      <div className="absolute -bottom-4 left-2 flex justify-center items-center">
                        <button 
                          className="group relative p-0 m-0" type="button" 
                          onClick={() => {
                            const indexOfPressLog = editedLogs.findIndex(l => log.id === l.id)
                            console.log('indexOfPressLog', indexOfPressLog)
                            if (indexOfPressLog === -1) return
                            setEditedLogs(prev => {
                              const copy = [...prev]
                              return copy.map(log => {
                                const index = prev.findIndex(l => log.id === l.id)
                                return {
                                  ...log,
                                  order: index <= indexOfPressLog ? log.order : log.order + 1
                                }
                              })
                            })
                          }}
                        >
                          <Link2 className="rotate-90 text-primary opacity-100 group-hover:opacity-0 transition-all" />
                          <X className="group-hover:opacity-100 opacity-0 absolute inset-0 transition-all text-primary" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          }
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
          <Button 
            type="button" 
            onClick={onSaveChanges}
            disabled={isPending}
          >
            Save changes
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function IntegerSelectArray(
  { label, onSetValues, numberOfSets, initialValues }: 
  { label: string, onSetValues: (values: Array<number>) => void, numberOfSets: number, initialValues: Array<number> }
) {
  const [splitValues, setSplitValues] = useState(false)
  const [internalValues, setIntervalValues] = useState(initialValues)

  const onSetValuesCallback = useCallback((arr: number[]) => {
    onSetValues(arr);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // const copyValues = [...internalValues]
    
    if (splitValues) {
      copyValues[index] = isNaN(Number(val)) ? 0 : Number(val)
    } else {
      copyValues = copyValues.map(() => isNaN(Number(val)) ? 0 : Number(val))
    }

    setIntervalValues(copyValues)
    onSetValuesCallback(copyValues)
  }, [onSetValuesCallback, internalValues, numberOfSets, splitValues])

  useEffect(() => {
    setIntervalValues((prev) => {
      if (numberOfSets === 0) return [prev.at(0) ?? 0]

      if (numberOfSets > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: Math.max(1, numberOfSets - prev.length) }).map(() => Number(prev[prev.length - 1]) ?? 0)
        ]
      } else {
        return prev.slice(0, numberOfSets)
      }
    });
  }, [numberOfSets, splitValues]);

  useEffect(() => {
    if (numberOfSets <= 1 || numberOfSets > 10) setSplitValues(false)
  }, [numberOfSets])

  useEffect(() => {
    if (internalValues.length > 0) {
      onSetValuesCallback(internalValues);
    }
  }, [internalValues, onSetValuesCallback]);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className={cn(
        "relative",
        splitValues && numberOfSets > 0 && "border border-dashed border-accent-foreground/40 rounded-sm p-1"
      )}>
        {splitValues && numberOfSets > 0 ? (
          <div className="flex gap-2 pe-10">
            {Array.from({ length: numberOfSets }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  value={internalValues.at(index) ?? 0} 
                  onChange={(e) => onInputChange(e.target.value, index)} 
                  className="w-12 h-8" />
                {index < numberOfSets - 1 && <ChevronRight size={12} />}
              </div>
            ))}
          </div>
        ) : (
          <Input value={internalValues[0]} onChange={(e) => onInputChange(e.target.value, 0)} className="w-20 pe-10" type="" />
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
                    "absolute top-0 bottom-0 size-6 m-2",
                    splitValues && numberOfSets > 0 ? "-right-0" : "size-6 m-2 right-0"
                  )}
                  disabled={numberOfSets > 10}
                  onClick={() => setSplitValues(!splitValues)}
                >
                  {splitValues && numberOfSets > 0 ? <X /> : <SquareStack />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {splitValues && numberOfSets <= 10 ? `Assign same ${label} for each rep` : `Assign specific ${label} for each set`}
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
          <DialogTitle>Delete {sessionLogs.length > 1 ? "super set" : "set"}</DialogTitle>
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
      toast.success("Successfully deleted the set")
    }
  })

  const [addedLogs, setAddedLogs] = useState<AddedSessionLogs>([])
  const [numberOfSets, setNumberOfSets] = useState(0)

  useEffect(() => {
    setAddedLogs(prev => {
      const copy = prev.map(p => {
        let newFragments = [...p.workoutSessionLogFragments]
        if (p.workoutSessionLogFragments.length < numberOfSets) {
          for (let i = 0; i < (numberOfSets - p.workoutSessionLogFragments.length); i++) {
            newFragments.push({
              weight: 0,
              reps: 0,
              order: p.workoutSessionLogFragments.length + i,
              duration: 0,
              endedAt: null,
              startedAt: null
            })
          }
        } else {
          newFragments = newFragments.slice(0, numberOfSets)
        }

        return {
          ...p,
          workoutSessionLogFragments: newFragments
        }
      })

      return copy
    })
  }, [numberOfSets])

  const addSessionLogs = () => {
    console.log(addedLogs, startingOrder)
    mutate(addedLogs.map(log => {
      const { workoutSessionLogFragments, ...sessionLog } = log
      return {
        sessionLog,
        fragments: workoutSessionLogFragments
      }
    }))
  }

  const { getExerciseName } = useExerciseName()

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => setDialogOpen(open)}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          Add Exercise
          <Plus size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Add set</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {Object.keys(addedLogs).length === 0 && (
            <SelectExercise
              onSelectExercise={(newExerciseId) => {
                const newSessionLog: AddedSessionLogs[number] = {
                  exerciseId: newExerciseId,
                  order: startingOrder,
                  endedAt: null,
                  startedAt: null,
                  workoutSessionId: sessionId,
                  workoutSessionLogFragments: []
                }
                setAddedLogs([newSessionLog])
              }}
              button={({ onClick }) => (
                <Button onClick={onClick} type="button" variant="ghost" className="text-xl">
                  Select exercise
                  <ChevronDown />
                </Button>
              )}
            />
          )}

          {Object.values(addedLogs
            .reduce<Record<number, AddedSessionLogs>>((acc, curr) => {
              if (!(curr.order in acc)) {
                acc[curr.order] = []
              }
              acc[curr.order]!.push(curr)
              return acc
            }, {}))
            .map((logs, index) => (
              <div 
                key={`${index}-edit-set`}
                className="space-y-2"
              >
                {logs.map((log, logIndex) => (
                  <div key={`${index}-${logIndex}`} className="relative">
                    <div className="relative p-4 bg-card/20 rounded-md border">
                      <div className="w-full flex gap-2 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          <div className="w-full md:w-fit md:min-w-60 space-y-2">
                            <p className="text-xs text-muted-foreground">Select Exercise</p>
      
                            <SelectExercise
                              onSelectExercise={(newExerciseId) => {
                                setAddedLogs(prev => {
                                  const copy = [...prev]
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
                                <Button onClick={onClick} type="button" variant="ghost" className="text-xl">
                                  {getExerciseName(log.exerciseId)}
                                  <ChevronDown />
                                </Button>
                              )}
                            />
                          </div>
      
                          <div className="flex gap-2 flex-wrap">
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
                              onSetValues={(reps) => {
                                setAddedLogs(prev => {
                                  const copy = [...prev]
                                  const oldLog = copy[logIndex]
                                  if (!oldLog) return prev
                                  copy[logIndex] = {
                                    ...oldLog,
                                    workoutSessionLogFragments: oldLog.workoutSessionLogFragments
                                      .map((f, index) => ({
                                        ...f,
                                        reps: reps.at(index) ?? 0
                                      }))
                                  }
                                  return copy
                                })
                              }}
                              numberOfSets={numberOfSets}
                              initialValues={log.workoutSessionLogFragments.map(f => f.reps)}
                            />
                          </div>
                        </div>
      
                        {addedLogs.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => {
                              setAddedLogs(prev => {
                                const copy = [...prev]
                                copy.splice(logIndex, 1)
                                return copy
                              })
                            }}
                            size="icon" 
                            variant="ghost" 
                            className="size-7"
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    </div>

      
                    {logIndex !== logs.length - 1 && logs.length > 0 && (
                      <div className="absolute -bottom-4 left-2 flex justify-center items-center">
                        <button 
                          className="group relative p-0 m-0" type="button" 
                          onClick={() => {
                            setAddedLogs(prev => {
                              const copy = [...prev]
                              return copy.map((log, lIndex) => {
                                return {
                                  ...log,
                                  order: lIndex <= logIndex ? log.order : log.order + 1
                                }
                              })
                            })
                          }}
                        >
                          <Link2 className="rotate-90 text-primary opacity-100 group-hover:opacity-0 transition-all" />
                          <X className="group-hover:opacity-100 opacity-0 absolute inset-0 transition-all text-primary" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          }
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            type="button" 
            onClick={addSessionLogs}
            disabled={isPending}
          >
            Add set
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}