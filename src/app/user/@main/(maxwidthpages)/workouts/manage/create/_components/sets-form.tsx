"use client"

import { memo, useCallback, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, RotateCcw, Split, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CreateWorkoutInput } from "@/server/db/schema/workout"
import CreateSetCollectionsForm from "./set-collections-form"
import SelectExercise from "./select-exercise"

interface CreateSetFormProps {
  setIndex: number
  remove: () => void
  onSeperateCollections: (setIndex: number, setCollectionIndex: number) => void
  id: string
}

function CreateSetForm({
  setIndex,
  remove,
  onSeperateCollections,
  id,
}: CreateSetFormProps) {
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    setDraggableNodeRef,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
  })

  const { control } = useFormContext<CreateWorkoutInput>()
  const { fields, append, remove: removeCollection, update } = useFieldArray({
    control,
    name: `workoutSets.${setIndex}.workoutSetCollections`,
  })
  const [numberOfSets, setNumberOfSets] = useState(0)
  const setNumberOfSetsMemoized = useCallback((value: number) => setNumberOfSets(value), [])

  const onAddSetCollection = (exerciseId: string) => {
    append({
      duration: [0],
      exerciseId,
      reps: [0],
      restTime: [0],
      weight: [0],
    })
  }

  const onReset = () => {
    fields.forEach((field, index) => {
      update(index, {
        duration: [0],
        exerciseId: field.exerciseId,
        reps: [0],
        restTime: [0],
        weight: [0],
      })
    })
    setNumberOfSets(1)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Card className={cn("shadow-none", isDragging && "ring-2 ring-ring")}>
        <CardHeader className="p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <Button
                ref={setDraggableNodeRef}
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Reorder training group ${setIndex + 1}`}
                className="cursor-grab active:cursor-grabbing"
                {...listeners}
              >
                <GripVertical />
              </Button>
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <CardTitle className="truncate text-sm">Group {setIndex + 1}</CardTitle>
                  {fields.length > 1 && <Badge variant="secondary">Superset</Badge>}
                </div>
                <CardDescription>
                  {fields.length} exercise{fields.length === 1 ? "" : "s"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={onReset} aria-label="Reset training group">
                <RotateCcw />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={remove} aria-label="Delete training group">
                <Trash2 />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 p-2 pt-0">
          {fields.map((field, setCollectionIndex) => (
            <div key={field.id} className="flex flex-col gap-2">
              <CreateSetCollectionsForm
                setNumberOfSets={setNumberOfSetsMemoized}
                numberOfSets={numberOfSets}
                remove={() => removeCollection(setCollectionIndex)}
                setIndex={setIndex}
                setCollectionsIndex={setCollectionIndex}
                numCollections={fields.length}
              />

              {setCollectionIndex < fields.length - 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="self-center"
                  onClick={() => onSeperateCollections(setIndex, setCollectionIndex)}
                >
                  <Split data-icon="inline-start" />
                  Split group here
                </Button>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="border-t bg-muted/20 p-2">
          <SelectExercise
            onSelectExercise={onAddSetCollection}
            button={({ onClick }) => (
              <Button type="button" variant="ghost" size="sm" onClick={onClick}>
                <Plus data-icon="inline-start" />
                {fields.length === 1 ? "Create a superset" : "Add to superset"}
              </Button>
            )}
          />
        </CardFooter>
      </Card>
    </div>
  )
}

export default memo(CreateSetForm)
