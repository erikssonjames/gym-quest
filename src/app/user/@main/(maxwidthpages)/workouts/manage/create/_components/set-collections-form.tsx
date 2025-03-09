"use client";


import { Controller, useFormContext } from "react-hook-form";
import type { CreateWorkoutInput } from "@/server/db/schema/workout";
import SelectExercise from "./select-exercise";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, SquareStack, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { memo, useCallback, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useExerciseName } from "@/hooks/use-exercise-name";

interface CreateSetFormProps {
    setIndex: number
    setCollectionsIndex: number
    remove: () => void
    numCollections: number,
    numberOfSets: number
    setNumberOfSets: (n: number) => void
}

function CreateSetCollectionsForm({ setCollectionsIndex, setIndex, remove, numCollections, numberOfSets, setNumberOfSets }: CreateSetFormProps) {
  const { control, getValues } = useFormContext<CreateWorkoutInput>()

  useEffect(() => {
    const { duration, reps, weight, restTime } = getValues(`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}`)
    const max = Math.max(
      duration.length,
      reps.length,
      weight.length,
      restTime.length
    )
    setNumberOfSets(max)
  }, [getValues, setIndex, setCollectionsIndex, setNumberOfSets])

  const { getExerciseName } = useExerciseName()

  return (
    <div 
      className={cn(
        "relative p-4 bg-card/20 rounded-md border",
        setCollectionsIndex === 0 && "rounded-tl-none"
      )}
    >
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Controller
            control={control}
            name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.exerciseId`}
            render={({field}) => (
              <div className="md:space-y-2 w-full md:w-fit md:min-w-60">
                <p className="text-xs text-muted-foreground">Exercise</p>

                <SelectExercise
                  onSelectExercise={(id) => field.onChange(id)} // Sync with react-hook-form
                  button={({ onClick }) => (
                    <Button onClick={onClick} type="button" variant="ghost" className="text-xl ps-0">
                      {getExerciseName(field.value)}
                      <ChevronDown />
                    </Button>
                  )}
                />
              </div>
            )}
          />

          <div className="flex gap-2 flex-wrap">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Sets</p>
              <Input 
                value={numberOfSets} 
                onChange={(e) => setNumberOfSets(isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))}
                className="w-12"  
              />
            </div>

            <Controller
              control={control}
              name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.reps`}
              render={({field}) => (
                <IntegerSelectArray
                  label="Reps"
                  onSetValues={field.onChange}
                  numberOfSets={numberOfSets}
                  initialValues={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.weight`}
              render={({field}) => (
                <IntegerSelectArray
                  label="Weight (kg)"
                  onSetValues={field.onChange}
                  numberOfSets={numberOfSets}
                  initialValues={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.restTime`}
              render={({field}) => (
                <IntegerSelectArray
                  label="Rest Time (s)"
                  onSetValues={field.onChange}
                  numberOfSets={numberOfSets}
                  initialValues={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name={`workoutSets.${setIndex}.workoutSetCollections.${setCollectionsIndex}.duration`}
              render={({field}) => (
                <IntegerSelectArray
                  label="Set Duration (s)"
                  onSetValues={field.onChange}
                  numberOfSets={numberOfSets}
                  initialValues={field.value}
                />
              )}
            />
          </div>
        </div>

        {numCollections > 1 && (
          <Button type="button" onClick={remove} size="icon" variant="ghost" className="size-7">
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

function IntegerSelectArray(
  { label, onSetValues, numberOfSets, initialValues }: 
  { label: string, onSetValues: (values: Array<number>) => void, numberOfSets: number, initialValues: Array<number> }
) {
  const [splitValues, setSplitValues] = useState(false)
  const [internalValues, setInternvalValues] = useState(initialValues)

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

    setInternvalValues(copyValues)
    onSetValuesCallback(copyValues)
  }, [onSetValuesCallback, internalValues, numberOfSets, splitValues])

  useEffect(() => {
    setInternvalValues((prev) => {
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

export default memo(CreateSetCollectionsForm)
