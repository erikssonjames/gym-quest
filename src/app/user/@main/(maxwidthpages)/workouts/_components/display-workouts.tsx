
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
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/app/user/@main/_components/page-shell";

interface DisplayWorkoutsProps {
  workouts?: Array<WorkoutOutput>
  loading: boolean
}

export default function DisplayWorkouts ({ workouts, loading }: DisplayWorkoutsProps) {
  return (
    <div className="grid w-full flex-grow grid-cols-1 content-start gap-3 py-2">
      {loading && (
        <>
          <Skeleton className="w-full h-60" />
          <Skeleton className="w-full h-60" />
          <Skeleton className="w-full h-60" />
        </>
      )}
      {!loading && workouts?.length === 0 && <div className="w-full"><EmptyState title="No workouts in this library" description="Create a plan for yourself or browse public workouts to find a useful starting point." action={<Button asChild><Link href="/user/workouts/manage/create">Create a workout</Link></Button>} /></div>}
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
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="flex gap-3 p-4">
      <div className="min-w-0 flex-grow">
        <div>
          <p className="inline-block font-semibold pe-2">{workout.name}</p>
          <span className="italic text-xs">{workout.category}</span>
            <Badge variant={workout.isPublic ? "default" : "destructive"}>
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
                className="flex w-fit items-center justify-center rounded-sm bg-muted/60 px-2 py-1"
                key={`${name}-${index}-exercise-name-badge`}
              >
                <p className="text-xs whitespace-nowrap">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-2 flex flex-col gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/user/workouts/browse/${workout.id}`}>View</Link>
        </Button>
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
      </CardContent>
    </Card>
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
      <DialogContent className="sm:max-w-7xl mx-0 md:mx-10 max-h-dvh md:h-[calc(100vh-4rem)] flex flex-col md:px-20 md:py-10">
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
