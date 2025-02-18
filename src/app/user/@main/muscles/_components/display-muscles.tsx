"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Muscle, type MuscleGroup } from "@/server/db/schema/body";
import { api } from "@/trpc/react";
import { Loader2Icon, Pencil, Trash } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import EditMuscleForm from "./edit-muscle-form";

export default function DisplayMuscles () {
  const { data: muscles } = api.body.getMuscles.useQuery(undefined, {

  })

  return (
    <div className="py-4 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
      {muscles?.map(m => {
        const { muscleGroup, ...muscle } = m
        return <MuscleComponent key={m.id} muscle={muscle} muscleGroup={muscleGroup} />
      })}
    </div>
  )
}

function MuscleComponent ({ muscle, muscleGroup }: { muscle: Muscle, muscleGroup: MuscleGroup }) {
  return (
    <div className="bg-secondary/40 p-4 rounded-md flex gap-2">
      <div className="flex-grow">
        <div>
          <p className="inline-block font-semibold pe-2">{muscle.name}</p>
          <span className="italic text-xs">({muscle.latinName})</span>
        </div>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Group</p>
          <p>{muscleGroup.name}</p>
        </div>
      </div>
      <div className="px-2 flex flex-col gap-2">
        <EditMuscle muscle={muscle}>
          <Button size="icon" variant="secondary" className="size-7">
            <Pencil />
          </Button>
        </EditMuscle>
        <ConfirmDeleteMuscle id={muscle.id}>
          <Button size="icon" variant="destructive" className="size-7">
            <Trash />
          </Button>
        </ConfirmDeleteMuscle>
      </div>
    </div>
  )
}

function ConfirmDeleteMuscle ({ id, children }: { id: string, children: ReactNode }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.body.deleteMuscle.useMutation({
    onSuccess: () => utils.body.getMuscles.invalidate()
  })
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      await mutateAsync({ id })
      toast.success('Muscle Deleted.')
      setOpen(false)
    } catch (e) {
      toast.error('Failed to remove muscle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this muscle?</DialogTitle>
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

function EditMuscle ({ muscle, children }: { muscle: Muscle, children: ReactNode }) {
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

        <EditMuscleForm 
          muscle={muscle}
          closeForm={() => setOpen(false)}
          close={(
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