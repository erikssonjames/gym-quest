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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, ListChecks, Loader2Icon, Plus, Sparkles } from "lucide-react";
import { api } from "@/trpc/react";
import { 
  type CreateWorkoutInput,
  CreateWorkoutInputZod,
} from "@/server/db/schema/workout";
import { Checkbox } from "@/components/ui/checkbox";
import CreateSetForm from "./sets-form";
import { useSearchParamsFn } from "@/hooks/use-search-params-fn";
import { SearchParam } from "@/variables/url";
import SelectExercise from "./select-exercise";
import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { useEffect } from "react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AiWorkoutChat from "./ai-workout-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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

  if (builderMode === "ai") {
    return (
      <AiWorkoutChat
        onExit={() => setBuilderMode("manual")}
        onApplyDraft={(draft) => {
          form.reset({
            ...draft,
            isPublic: form.getValues("isPublic"),
          })
          setBuilderMode("manual")
          toast.success("AI workout added to the builder. Review it, then create it when ready.")
        }}
      />
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitWorkout)}
        className="flex flex-col gap-3 pb-4"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Build with</p>
          <ToggleGroup
            type="single"
            value={builderMode}
            onValueChange={(value) => {
              if (value === "manual" || value === "ai") setBuilderMode(value)
            }}
            variant="outline"
            size="sm"
            aria-label="Workout builder mode"
          >
            <ToggleGroupItem value="manual" aria-label="Use the manual builder">
              <ListChecks />
              Manual
            </ToggleGroupItem>
            <ToggleGroupItem value="ai" aria-label="Use AI assist">
              <Sparkles />
              AI
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-base">Workout details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout name</FormLabel>
                    <FormControl>
                      <Input placeholder="Upper-body strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description (optional)"
                      className="min-h-16 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Make workout public"
                    />
                  </FormControl>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <FormLabel>Share in the public workout library</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <CardTitle className="text-base">Exercises</CardTitle>
                <CardDescription>{fields.length} group{fields.length === 1 ? "" : "s"}</CardDescription>
              </div>
              <SelectExercise
                onSelectExercise={onAddSetCollection}
                button={({ onClick }) => (
                  <Button type="button" size="sm" onClick={onClick}>
                    <Plus data-icon="inline-start" />
                    Add exercise
                  </Button>
                )}
              />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {fields.length === 0 ? (
              <Empty className="border p-4 md:p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Dumbbell />
                  </EmptyMedia>
                  <EmptyTitle>Start with your first exercise</EmptyTitle>
                  <EmptyDescription>
                    Search your exercise library, then configure sets, reps, weight, rest, and duration.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <SelectExercise
                    onSelectExercise={onAddSetCollection}
                    button={({ onClick }) => (
                      <Button type="button" variant="outline" onClick={onClick}>
                        <Plus data-icon="inline-start" />
                        Choose an exercise
                      </Button>
                    )}
                  />
                </EmptyContent>
              </Empty>
            ) : (
              <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={onSwapSetCollection}
              >
                <SortableContext items={fields.map((field) => field.id)}>
                  <div className="flex flex-col gap-2">
                    {fields.map((field, setIndex) => (
                      <CreateSetForm
                        key={field.id}
                        id={field.id}
                        setIndex={setIndex}
                        remove={() => remove(setIndex)}
                        onSeperateCollections={onSeperateCollections}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-2 flex items-center justify-between gap-3 rounded-lg border bg-background/95 p-2 shadow-sm">
          <p className="hidden text-xs text-muted-foreground sm:block">Ready when the plan looks right.</p>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
            Create workout
          </Button>
        </div>
      </form>
    </Form>
  );
}
