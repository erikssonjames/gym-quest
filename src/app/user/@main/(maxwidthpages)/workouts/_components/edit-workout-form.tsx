"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import { api } from "@/trpc/react";
import { 
  type WorkoutInput,
  WorkoutInputZod,
} from "@/server/db/schema/workout";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParamsFn } from "@/hooks/use-search-params-fn";
import { SearchParam } from "@/variables/url";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import ScrollContainerFadingEdges from "@/components/ui/scroll-container-fading-edges";
import { toast } from "sonner";
import SelectExercise from "@/app/user/@main/(maxwidthpages)/workouts/manage/create/_components/select-exercise"
import CreateSetForm from "@/app/user/@main/(maxwidthpages)/workouts/manage/create/_components/sets-form"

export default function EditWorkoutForm({ workout, close }: { workout: WorkoutInput, close: () => void }) {
  const utils = api.useUtils()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const searchParamsFunctions = useSearchParamsFn()

  const { mutateAsync, isPending } = api.workout.updateWorkout.useMutation({
    onSuccess: () => {
      // Handle success
      void utils.workout.invalidate()
      toast.success("Workout succesfully edited!")
      searchParamsFunctions.get(SearchParam.RETURN_URL)?.()
      close()
    },
    onError: (error) => {
      console.error("Error editing workout:", error);
    },
  });

  const form = useForm<WorkoutInput>({
    resolver: zodResolver(WorkoutInputZod),
    defaultValues: workout
  });

  const { append, fields, remove, insert, update, move } = useFieldArray({
    control: form.control,
    name: "workoutSets"
  })


  const onSubmitWorkout = async (values: WorkoutInput) => {
    await mutateAsync(values);
  };

  const onAddSetCollection = (exerciseId: string) => {
    append({
      workoutId: workout.id,
      workoutSetCollections: [
        {
          exerciseId,
          duration: [0],
          reps: [0],
          restTime: [0],
          weight: [0]
        }
      ]
    })
  }

  const onSeperateCollections = (setIndex: number, setCollectionIndex: number) => {
    const setCollections = form.getValues(`workoutSets.${setIndex}.workoutSetCollections`)

    const above = setCollections.slice(0, setCollectionIndex + 1)
    const below = setCollections.slice(setCollectionIndex + 1)

    update(setIndex, { workoutSetCollections: above, workoutId: workout.id })
    insert(setIndex + 1, { workoutSetCollections: below, workoutId: workout.id })
  }

  const onSwapSetCollection = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id)
      const newIndex = fields.findIndex(f => f.id === over.id)
      move(oldIndex, newIndex)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWorkout)} className="md:gap-6 gap-3 flex flex-col min-h-0 flex-grow">
        <div className="flex gap-6 items-center md:px-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <FloatingLabelInput text="Workout Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Make workout public
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:px-8">
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div 
          className="w-full md:px-8 flex-shrink-0" 
          style={{ minHeight: 'inherit' }}
        >
          <SelectExercise onSelectExercise={onAddSetCollection} />
        </div>

        <div className="space-y-2 min-h-0 flex flex-col">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={onSwapSetCollection}
          >
            <SortableContext items={fields.map(f => f.id)}>
              <ScrollContainerFadingEdges className="ps-8 md:pe-8 min-h-0 flex-grow py-1">
                {fields.map((field, setIndex) => (
                  <CreateSetForm
                    key={field.id} 
                    id={field.id}
                    setIndex={setIndex} 
                    remove={() => remove(setIndex)}
                    onSeperateCollections={onSeperateCollections}
                  />
                ))}
              </ScrollContainerFadingEdges>
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-auto flex-none md:px-8">
          <Button type="submit" className="w-full">
            {isPending ? <Loader2Icon className="size-6 animate-spin" /> : <>Edit Workout</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
