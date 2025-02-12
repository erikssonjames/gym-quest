"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Muscle } from "@/server/db/schema/body";
import { type Exercise } from "@/server/db/schema/exercise";
import { api } from "@/trpc/react";
import { Loader2Icon, Pencil, Trash } from "lucide-react";
import { memo, type ReactNode, useState } from "react";
import { toast } from "sonner";
import EditExerciseForm from "./edit-exercise-form";
import { Badge } from "@/components/ui/badge";

function DisplayExercises ({ search }: { search: string }) {
  const { data: exercises } = api.exercise.getExercises.useQuery()

  const filterFn = (exercise: Partial<Exercise>, muscles: Muscle[]): boolean => {
    const s = search.toLowerCase()
    if (exercise?.name?.toLowerCase().includes(s)) return true
    if (exercise?.description?.includes(s)) return true
    if (muscles.some(m => m.name.toLowerCase().includes(s))) return true
    return false
  }

  const filteredExercises = exercises
    ? exercises
      .filter(e => filterFn(
        { name: e.name, description: e.description }, e.muscles
      )).sort((a, b) => a.name.localeCompare(b.name))
    : []

  return (
    <div className="py-10 grid grid-cols-2 gap-2 w-full">
      {filteredExercises.map(e => {
        const { muscles, ...exercise } = e
        return (
          <ExerciseComponent 
            key={e.id} 
            muscles={muscles} 
            exercise={exercise} 
            requestToBePublic={e.requestToBePublic !== null && !e.isPublic}
          />
        )
      })}
      {exercises && exercises.length === 0 && (
        <div>
          <p>No exercises added yet</p>
        </div>
      )}
    </div>
  )
}
export default memo(DisplayExercises)


function ExerciseComponent ({ exercise, muscles, requestToBePublic }: { muscles: Muscle[], exercise: Exercise, requestToBePublic: boolean }) {
  return (
    <div className="bg-secondary/40 p-4 rounded-md flex gap-2">
      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center">
            <p className="inline-block font-semibold pe-2">{exercise.name}</p>
            {exercise.isPublic && <Badge>Public</Badge>}
            {requestToBePublic && <Badge variant="outline">Pending Request</Badge>}
          </div>
          <p className="text-xs">{exercise.description}</p>
        </div>
        <div className="">
          <p className="text-xs text-muted-foreground mt-4">Muscles worked</p>
          <div className="flex flex-wrap gap-1 pt-2">
            {muscles.map(muscle => (
              <div className="flex items-center justify-center w-fit px-2 py-1 rounded-sm bg-secondary/40" key={`${muscle.id}-muscle-badge`}>
                <p className="text-xs whitespace-nowrap">{muscle.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-2 flex flex-col gap-2">
        <EditExercise exercise={exercise} muscleIds={muscles.map(m => m.id)}>
          <Button size="icon" variant="secondary" className="size-7">
            <Pencil />
          </Button>
        </EditExercise>
        <ConfirmDeleteExercise id={exercise.id}>
          <Button size="icon" variant="destructive" className="size-7">
            <Trash />
          </Button>
        </ConfirmDeleteExercise>
      </div>
    </div>
  )
}

function ConfirmDeleteExercise ({ id, children }: { id: string, children: ReactNode }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.exercise.deleteExercise.useMutation({
    onSuccess: () => utils.exercise.getExercises.invalidate()
  })
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      await mutateAsync({ id })
      toast.success('Exercise Deleted.')
      setOpen(false)
    } catch (e) {
      toast.error('Failed to remove exercise')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this exercise?</DialogTitle>
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

function EditExercise ({ exercise, muscleIds, children }: { exercise: Exercise, muscleIds: Array<string>, children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit muscle</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <EditExerciseForm 
          exercise={exercise}
          muscleIds={muscleIds}
          closeFn={() => setOpen(false)}
          closeElement={(
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                                Close
              </Button>
            </DialogClose>
          )}
        />
      </DialogContent>
    </Dialog>
  )
}
