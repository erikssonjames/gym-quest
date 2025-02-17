
"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Loader2Icon, Pencil, Star, Trash } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import EditMuscleForm from "./edit-workout-form";
import { type WorkoutOutput } from "@/server/api/types/output";
import { Badge } from "@/components/ui/badge";
import { useExerciseName } from "@/hooks/use-exercise-name";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface DisplayWorkoutsProps {
  workouts?: Array<WorkoutOutput>
  loading: boolean
}

export default function DisplayWorkouts ({ workouts, loading }: DisplayWorkoutsProps) {
  return (
    <div className="py-4 md:py-10 grid grid-cols-1 content-start gap-2 w-full flex-grow">
      {loading && (
        <>
          <Skeleton className="w-full h-60" />
          <Skeleton className="w-full h-60" />
          <Skeleton className="w-full h-60" />
        </>
      )}
      {!loading && workouts?.length === 0 && (
        <div className="w-full h-full pt-10 flex items-center justify-center">
          <p className="font-semibold">
            No added
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link className="ms-1" type="button" href="/user/workouts/manage/create">
                    <span className="underline text-primary">workouts</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  Create your first!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            .
          </p>
        </div>
      )}
      {!loading && workouts?.map(w => {
        return <WorkoutComponent key={w.id} workout={w} />
      })}
    </div>
  )
}

function WorkoutComponent ({ workout }: { workout: WorkoutOutput }) {
  const { data } = useSession()
  const userId = data?.user.id

  const { getExerciseName } = useExerciseName()
  
  const { mutate: saveWorkout, isPending } = api.workout.saveWorkoutToFavourites.useMutation()

  const estimatedTime = useMemo(() => {
    return Math.ceil(workout.workoutSets.reduce<number>((acc, curr) => {
      return acc + curr.workoutSetCollections.reduce<number>((acc, curr) => {
        const sets = curr.reps.length
        return acc + (sets * (curr.restTime.at(0) ?? 0)) + (sets * (curr.duration.at(0) ?? 0))
      }, 0)
    }, 0) / 60)
  }, [workout.workoutSets])

  const numSets = useMemo(() => {
    return workout.workoutSets.reduce<number>((acc, curr) => {
      return acc + curr.workoutSetCollections.reduce<number>((acc, curr) => {
        return acc + curr.reps.length
      }, 0)
    }, 0)
  }, [workout])

  const exerciseNames = useMemo(() => {
    return workout.workoutSets.flatMap(set => {
      return set.workoutSetCollections.map(col => getExerciseName(col.exerciseId))
    })
  }, [workout, getExerciseName])

  return (
    <div className="bg-secondary/40 border p-4 rounded-md flex gap-2">
      <div className="flex-grow">
        <div>
          <p className="inline-block font-semibold pe-2">{workout.name}</p>
          <span className="italic text-xs">{workout.category}</span>
          <Badge className={workout.isPublic ? "bg-primary" : "bg-destructive text-destructive-foreground"}>
            {workout.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
                
        <div className="flex gap-10 flex-wrap">
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p>{workout.description}</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Sets</p>
            <p>{numSets}</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Estimated Time</p>
            <p>{estimatedTime}m</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Exercises</p>
          <div className="flex flex-wrap gap-1 pt-2">
            {exerciseNames.filter(name => !!name && name.length > 0).map((name, index) => (
              <div 
                className="flex items-center justify-center w-fit px-2 py-1 rounded-sm bg-background/40" 
                key={`${name}-${index}-exercise-name-badge`}
              >
                <p className="text-xs whitespace-nowrap">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-2 flex flex-col gap-2">
        {userId && userId === workout.userId ? (
          <>
            <EditWorkout workout={workout}>
              <Button size="icon" variant="secondary" className="size-7">
                <Pencil />
              </Button>
            </EditWorkout>
            <ConfirmDeleteWorkout id={workout.id}>
              <Button size="icon" variant="destructive" className="size-7">
                <Trash />
              </Button>
            </ConfirmDeleteWorkout>
          </>
        ) : (
          <Button 
            size="sm" 
            type="button" 
            onClick={() => saveWorkout({ workoutId: workout.id })} 
            disabled={isPending}
            variant={workout.saved ? "default" : "outline"}
          >
            {isPending ? <Loader2Icon className="animate-spin" /> : <Star />}
          </Button>
        )}
      </div>
    </div>
  )
}

function ConfirmDeleteWorkout ({ id, children }: { id: string, children: ReactNode }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.workout.deleteWorkout.useMutation({
    onSuccess: () => utils.workout.getWorkouts.invalidate()
  })
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      await mutateAsync({ id })
      toast.success('Workout Deleted.')
      setOpen(false)
    } catch (e) {
      toast.error('Failed to remove Workout')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this workout?</DialogTitle>
          <DialogDescription>
            This action cant be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isPending}>
            Delete
            {isPending && <Loader2Icon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditWorkout ({ workout, children }: { workout: WorkoutOutput, children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-7xl mx-0 md:mx-10 max-h-screen md:h-[calc(100vh-4rem)] flex flex-col md:px-20 md:py-10">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit workout</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex-grow min-h-0 flex flex-col">
          <EditMuscleForm workout={workout} close={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}