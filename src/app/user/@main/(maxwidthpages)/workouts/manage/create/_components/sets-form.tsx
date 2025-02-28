"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { type CreateWorkoutInput } from "@/server/db/schema/workout";
import { ChevronDown, Grip, Link2, RotateCcw, Trash, X } from "lucide-react";
import CreateSetCollectionsForm from "./set-collections-form";
import { Separator } from "@/components/ui/separator";
import SelectExercise from "./select-exercise";
import { memo, useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils";

interface CreateSetFormProps {
    setIndex: number
    remove: () => void
    onSeperateCollections: (setIndex: number, setCollectionIndex: number) => void
    id: string
}

function CreateSetForm({ setIndex, remove, onSeperateCollections, id }: CreateSetFormProps) {
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    setDraggableNodeRef,
    isDragging
  } = useSortable({ 
    id,
    animateLayoutChanges: () => false
  })

  const [moreActionsOpen, setMoreActionsOpen] = useState(false)
  const { control } = useFormContext<CreateWorkoutInput>()
  const { fields, append, remove: removeCollection, update } = useFieldArray({
    control,
    name: `workoutSets.${setIndex}.workoutSetCollections`
  })

  const [numberOfSets, setNumberOfSets] = useState(0)
  const setNumberOfSetsMemoized = useCallback((n: number) => setNumberOfSets(n), [])

  const onAddSetCollection = (exerciseId: string) => {
    append({
      duration: [0],
      exerciseId,
      reps: [0],
      restTime: [0],
      weight: [0]
    })
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onReset = () => {
    fields.forEach((field, index) => {
      update(index, {
        duration: [0],
        exerciseId: field.exerciseId,
        reps: [0],
        restTime: [0],
        weight: [0]
      })
    })
  }

  return (
    <div
      style={style}
      ref={setNodeRef}
      className="flex"
    >
      <div className="relative flex-grow rounded-md pe-1 md:pe-0">
        <button 
          className="absolute right-full top-0 bg-secondary/30 border p-2 rounded-l-sm flex items-center gap-2 cursor-grab hover:bg-secondary/60 active:bg-primary/40"
          type="button"
          ref={setDraggableNodeRef}
          {...listeners}
        >
          <Grip size={14} />
        </button>

        <div className={cn(
          "space-y-2",
          isDragging && "outline outline-primary/20 rounded-md"
        )}>
          {fields.map((field, setCollectionIndex) => (
            <div key={field.id} className="relative">
              <CreateSetCollectionsForm
                setNumberOfSets={setNumberOfSetsMemoized}
                numberOfSets={numberOfSets}
                remove={() => removeCollection(setCollectionIndex)}
                setIndex={setIndex} 
                setCollectionsIndex={setCollectionIndex}
                numCollections={fields.length}
              />

              {setCollectionIndex !== fields.length - 1 && fields.length > 0 && (
                <div className="absolute -bottom-4 left-2 flex justify-center items-center">
                  <button className="group relative p-0 m-0" type="button" onClick={() => onSeperateCollections(setIndex, setCollectionIndex)}>
                    <Link2 className="rotate-90 text-primary opacity-100 group-hover:opacity-0 transition-all" />
                    <X className="group-hover:opacity-100 opacity-0 absolute inset-0 transition-all text-primary" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!moreActionsOpen ? (
          <div className="w-full flex justify-center">
            <Button 
              size="sm" 
              type="button" 
              variant="ghost" 
              className="pt-0 pb-2 w-40 text-center group relative hover:bg-transparent"
              onClick={() => setMoreActionsOpen(true)}
            >
              <ChevronDown className="group-hover:hidden" />
              <p className="opacity-0 absolute inset-0 mx-4 text-center group-hover:opacity-100 transition-all pt-2 bg-secondary/20 rounded-b-md">More Actions</p>
            </Button>
          </div>
        ) : (
          <div className="w-full bg-background/20 rounded-b-md flex justify-between items-center px-4 pb-2">
            <SelectExercise 
              onSelectExercise={(id) => {
                setMoreActionsOpen(false)
                onAddSetCollection(id)
              }}
              button={({ onClick }) => (
                <Button 
                  type="button" 
                  onClick={onClick} 
                  size="sm" 
                  className="h-7">
                  {fields.length <= 1 ? "Create Superset" : "Add Exercise"}
                </Button>
              )}
            />

            <Button onClick={() => setMoreActionsOpen(false)} variant="ghost" size="icon">
              <X />
            </Button>
          </div>
        )}
      </div>
      <div className="bg-background/20 flex-col gap-2 h-fit p-2 ms-2 rounded-md hidden md:flex">
        <Button size="icon" className="size-7" onClick={() => onReset()} type="button">
          <RotateCcw />
        </Button>

        <Separator />

        <Button size="icon" className="size-7" variant="destructive" onClick={remove} type="button">
          <Trash /> 
        </Button>
      </div>
    </div>
  );
}

export default memo(CreateSetForm)