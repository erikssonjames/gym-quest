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
  type CreateWorkoutInput,
  CreateWorkoutInputZod,
} from "@/server/db/schema/workout";
import { Checkbox } from "@/components/ui/checkbox";
import CreateSetForm from "./sets-form";
import { useSearchParamsFn } from "@/hooks/use-search-params-fn";
import { SearchParam } from "@/variables/url";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import SelectExercise from "./select-exercise";
import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { useEffect } from "react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import ScrollContainerFadingEdges from "@/components/ui/scroll-container-fading-edges";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ListChecks, Sparkles } from "lucide-react";
import AiWorkoutChat from "./ai-workout-chat";

export default function CreateWorkoutForm() {
  const [builderMode, setBuilderMode] = useState<"manual" | "ai">("manual")
  const utils = api.useUtils()
  const router = useRouter()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const [storedForm, saveStoredForm] = useLocalStorage<Partial<CreateWorkoutInput>>("createWorkoutForm", null)

  const searchParamsFunctions = useSearchParamsFn()

  const { mutate, isPending, isSuccess } = api.workout.createWorkout.useMutation({
    onSuccess: () => {
      // Handle success
      saveStoredForm(null)
      void utils.workout.invalidate()
      toast.success("Workout successfully created!")
      const returnFn = searchParamsFunctions.get(SearchParam.RETURN_URL)
      if (returnFn) {
        returnFn()
      } else {
        router.replace("/user/workouts/manage")
      }
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
    },
  });

  const form = useForm<CreateWorkoutInput>({
    resolver: zodResolver(CreateWorkoutInputZod),
    defaultValues: storedForm ?? {
      name: "",
      description: "",
      category: "",
      isPublic: false,
      workoutSets: [],
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      saveStoredForm(isSuccess ? null : {
        category: value.category ?? "",
        description: value.description ?? "",
        isPublic: value.isPublic ?? false,
        name: value.name ?? "",
        workoutSets: value.workoutSets?.map(set => ({
          id: set?.id ?? undefined, // Optional ID
          workoutSetCollections: set?.workoutSetCollections?.map(col => ({
            id: col?.id ?? undefined, // Optional ID
            exerciseId: col?.exerciseId ?? "", // Default to empty string
            reps: (col?.reps ?? [0]).filter((rep): rep is number => rep !== undefined), // ✅ Remove `undefined`
            restTime: (col?.restTime ?? [0]).filter((time): time is number => time !== undefined), // ✅ Remove `undefined`
            duration: (col?.duration ?? [0]).filter((dur): dur is number => dur !== undefined), // ✅ Remove `undefined`
            weight: (col?.weight ?? [0]).filter((dur): dur is number => dur !== undefined), // ✅ Remove `undefined`
          })) ?? [], // Ensure it's always an array
        })) ?? [], // Ensure it's always an array
      });
    });

    // Cleanup: Unsubscribe the watch when the component unmounts
    return () => subscription.unsubscribe();
  }, [form, saveStoredForm, isSuccess]);

  const { append, fields, remove, insert, update, move } = useFieldArray({
    control: form.control,
    name: "workoutSets"
  })

  const onSubmitWorkout = (values: CreateWorkoutInput) => {
    mutate(values);
  };

  const onAddSetCollection = (exerciseId: string) => {
    append({ 
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

    update(setIndex, { workoutSetCollections: above })
    insert(setIndex + 1, { workoutSetCollections: below })
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
      <form
        onSubmit={form.handleSubmit(onSubmitWorkout)}
        className="gap-6 flex flex-col min-h-0 h-full"
      >
        <div className="flex flex-col gap-3 rounded-xl border bg-card/60 p-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Build your workout</p>
            <p className="text-xs text-muted-foreground">
              Start manually or use the co-pilot to shape a draft through conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2" role="group" aria-label="Workout builder mode">
              <Button
                type="button"
                size="sm"
                variant={builderMode === "manual" ? "default" : "outline"}
                aria-pressed={builderMode === "manual"}
                onClick={() => setBuilderMode("manual")}
              >
                <ListChecks className="size-4" />
                Manual
              </Button>
              <Button
                type="button"
                size="sm"
                variant={builderMode === "ai" ? "default" : "outline"}
                aria-pressed={builderMode === "ai"}
                onClick={() => setBuilderMode("ai")}
              >
                <Sparkles className="size-4" />
                AI assist
              </Button>
            </div>
            <Button type="submit" size="sm" disabled={isPending || builderMode === "ai"}>
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : builderMode === "ai" ? <Sparkles className="size-4" /> : null}
              {builderMode === "ai" ? "Waiting for AI draft" : "Create workout"}
            </Button>
          </div>
        </div>

        {builderMode === "ai" && (
          <AiWorkoutChat
            onApplyDraft={(draft) => {
              form.reset({
                ...draft,
                isPublic: form.getValues("isPublic"),
              })
              setBuilderMode("manual")
              toast.success("AI draft applied. Review it before creating the workout.")
            }}
          />
        )}

        <div className="flex items-center gap-6 md:px-4">
          {builderMode === "manual" && (
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
          )}

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

        {builderMode === "manual" ? (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:px-4">
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 md:mx-4">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">AI owns the workout metadata</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">The connected assistant will propose the workout name and description after it has clarified your goal, constraints, and preferences.</p>
            </div>
          </div>
        )}

        <div 
          className="w-full md:px-4" 
          style={{ minHeight: 'inherit' }}
        >
          <SelectExercise onSelectExercise={onAddSetCollection} />
        </div>

        <div className="space-y-2 min-h-0 flex-grow">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={onSwapSetCollection}
          >
            <SortableContext items={fields.map(f => f.id)}>
              <ScrollContainerFadingEdges className="pl-8 min-h-0 h-full py-1">
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

      </form>
    </Form>
  );
}
