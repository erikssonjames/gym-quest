"use client"

import { memo, useEffect, useId, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { ChevronDown, Layers3, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useExerciseName } from "@/hooks/use-exercise-name"
import type { CreateWorkoutInput } from "@/server/db/schema/workout"
import SelectExercise from "./select-exercise"

interface CreateSetFormProps {
  setIndex: number
  setCollectionsIndex: number
  remove: () => void
  numCollections: number
  numberOfSets: number
  setNumberOfSets: (value: number) => void
}

function CreateSetCollectionsForm({
  setCollectionsIndex,
  setIndex,
  remove,
  numCollections,
  numberOfSets,
  setNumberOfSets,
}: CreateSetFormProps) {
  const { control, getValues } = useFormContext<CreateWorkoutInput>()
  const { getExerciseName } = useExerciseName()
  const setCountId = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const { duration, reps, weight, restTime } = getValues(
      `workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}`,
    )
    setNumberOfSets(Math.max(1, duration.length, reps.length, weight.length, restTime.length))
  }, [getValues, setIndex, setCollectionsIndex, setNumberOfSets])

  const collection = getValues(
    `workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}`,
  )
  const reps = collection.reps[0] ?? 0
  const duration = collection.duration[0] ?? 0
  const rest = collection.restTime[0] ?? 0
  const hasVariedReps = new Set(collection.reps).size > 1
  const hasVariedDuration = new Set(collection.duration).size > 1
  const workSummary = reps > 0
    ? hasVariedReps ? "Varied reps" : `${reps} reps`
    : hasVariedDuration ? "Varied duration" : `${duration}s work`

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-w-0 flex-1 justify-start p-2 text-left"
          onClick={() => setOpen(true)}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-medium">{getExerciseName(collection.exerciseId)}</span>
            <span className="truncate text-xs text-muted-foreground">
              {numberOfSets} set{numberOfSets === 1 ? "" : "s"} · {workSummary} · {rest}s rest
            </span>
          </div>
          <SlidersHorizontal data-icon="inline-end" />
        </Button>
        {numCollections > 1 && (
          <Button type="button" onClick={remove} size="icon" variant="ghost" aria-label="Remove exercise from superset">
            <X />
          </Button>
        )}
      </div>

      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="flex flex-col gap-2 border-b p-5 pr-12 text-left">
          <SheetTitle>{getExerciseName(collection.exerciseId)}</SheetTitle>
          <SheetDescription>Configure the exercise without expanding the workout list.</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-5">
          <Controller
            control={control}
            name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.exerciseId`}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label>Exercise</Label>
                <SelectExercise
                  onSelectExercise={field.onChange}
                  button={({ onClick }) => (
                    <Button type="button" variant="outline" onClick={onClick} className="justify-between">
                      <span className="truncate">{getExerciseName(field.value)}</span>
                      <ChevronDown data-icon="inline-end" />
                    </Button>
                  )}
                />
              </div>
            )}
          />

          <div className="flex max-w-32 flex-col gap-2">
            <Label htmlFor={setCountId}>Sets</Label>
            <Input
              id={setCountId}
              type="number"
              min={1}
              max={50}
              value={numberOfSets}
              onChange={(event) => {
                const value = Number(event.target.value)
                setNumberOfSets(Number.isFinite(value) ? Math.max(1, Math.min(50, value)) : 1)
              }}
            />
          </div>

          <section className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium">Work target</h4>
              <p className="text-xs leading-5 text-muted-foreground">Leave weight at zero for bodyweight work.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.reps`}
                render={({ field }) => (
                  <IntegerSelectArray label="Reps" onSetValues={field.onChange} numberOfSets={numberOfSets} initialValues={field.value} />
                )}
              />
              <Controller
                control={control}
                name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.weight`}
                render={({ field }) => (
                  <IntegerSelectArray label="Weight (kg)" onSetValues={field.onChange} numberOfSets={numberOfSets} initialValues={field.value} />
                )}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium">Timing</h4>
              <p className="text-xs leading-5 text-muted-foreground">Use duration for holds or timed movements.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.restTime`}
                render={({ field }) => (
                  <IntegerSelectArray label="Rest (seconds)" onSetValues={field.onChange} numberOfSets={numberOfSets} initialValues={field.value} />
                )}
              />
              <Controller
                control={control}
                name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.duration`}
                render={({ field }) => (
                  <IntegerSelectArray label="Duration (seconds)" onSetValues={field.onChange} numberOfSets={numberOfSets} initialValues={field.value} />
                )}
              />
            </div>
          </section>
        </div>

        <SheetFooter className="border-t p-3">
          <SheetClose asChild>
            <Button type="button">Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function IntegerSelectArray({
  label,
  onSetValues,
  numberOfSets,
  initialValues,
}: {
  label: string
  onSetValues: (values: number[]) => void
  numberOfSets: number
  initialValues: number[]
}) {
  const [splitValues, setSplitValues] = useState(false)
  const [internalValues, setInternalValues] = useState(initialValues)
  const onSetValuesRef = useRef(onSetValues)
  const inputId = useId()

  useEffect(() => {
    onSetValuesRef.current = onSetValues
  }, [onSetValues])

  useEffect(() => {
    setInternalValues((previousValues) => {
      const fallbackValue = previousValues.at(-1) ?? 0
      const nextValues =
        numberOfSets > previousValues.length
          ? [
              ...previousValues,
              ...Array.from({ length: numberOfSets - previousValues.length }, () => fallbackValue),
            ]
          : previousValues.slice(0, numberOfSets)

      onSetValuesRef.current(nextValues)
      return nextValues
    })
  }, [numberOfSets])

  useEffect(() => {
    if (numberOfSets <= 1 || numberOfSets > 10) setSplitValues(false)
  }, [numberOfSets])

  const onInputChange = (value: string, index: number) => {
    const parsedValue = Number(value)
    const nextValue = Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0
    const nextValues = [...internalValues]

    if (splitValues) {
      nextValues[index] = nextValue
    } else {
      nextValues.fill(nextValue)
    }

    setInternalValues(nextValues)
    onSetValuesRef.current(nextValues)
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex flex-wrap items-start gap-2">
        {splitValues ? (
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {Array.from({ length: numberOfSets }).map((_, index) => (
              <Input
                key={index}
                id={index === 0 ? inputId : undefined}
                type="number"
                min={0}
                value={internalValues.at(index) ?? 0}
                onChange={(event) => onInputChange(event.target.value, index)}
                aria-label={`${label}, set ${index + 1}`}
                className="w-20"
              />
            ))}
          </div>
        ) : (
          <Input
            id={inputId}
            type="number"
            min={0}
            value={internalValues[0] ?? 0}
            onChange={(event) => onInputChange(event.target.value, 0)}
            className="min-w-20 flex-1"
          />
        )}

        {numberOfSets > 1 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={splitValues ? "secondary" : "outline"}
                  size="icon"
                  disabled={numberOfSets > 10}
                  onClick={() => setSplitValues((currentValue) => !currentValue)}
                  aria-label={splitValues ? `Use one ${label} value for every set` : `Set ${label} for each set`}
                >
                  <Layers3 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {numberOfSets > 10
                  ? "Per-set values are available for up to 10 sets."
                  : splitValues
                    ? `Use the same ${label.toLowerCase()} for every set.`
                    : `Set a different ${label.toLowerCase()} for each set.`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

export default memo(CreateSetCollectionsForm)
