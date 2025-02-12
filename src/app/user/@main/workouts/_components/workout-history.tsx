"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WorkoutSessionsOutput } from "@/server/api/types/output";
import { api } from "@/trpc/react";
import { formatDistanceStrict, formatISO } from "date-fns"
import { Loader2Icon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function WorkoutHistory () {
  const { data: workoutSessions, isPending } = api.workout.getWorkoutSessions.useQuery()

  if (isPending) {
    return (
      <Skeleton className="w-full h-40" />
    )
  }

  const hasSessions = workoutSessions && workoutSessions.length > 0

  return (
    <div className="w-full max-h-96 bg-card px-6 py-5 rounded-md">
      {hasSessions && (
        <p className="font-semibold text-md">Workout History</p>
      )}
      <div className={cn(
        "space-y-2",
        hasSessions && "mt-4"
      )}>
        {workoutSessions?.map((workoutSession, index) => (
          <WorkoutSessionComponent
            even={index % 2 === 0}
            workoutSession={workoutSession}
            key={`${workoutSession.id}-history-comp`}
          />
        ))}
        {!hasSessions && (
          <div className="w-full h-20 flex justify-center items-center">
            <p className="text-base text-muted-foreground">No workouts completed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkoutSessionComponent (
  { workoutSession, even }:
  { workoutSession: WorkoutSessionsOutput[number], even: boolean }
) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "flex gap-10 py-2 px-3 rounded-sm justify-between items-center cursor-pointer",
        even ? "bg-secondary" : ""
      )}
      onClick={() => {
        router.push(`/user/workouts/active/completed/${workoutSession.id}`)
      }}
    >
      <div className="flex gap-x-10 gap-y-4 flex-wrap">
        <div>
          <p className="text-muted-foreground text-xs">Workout</p>
          <p>{workoutSession.workout.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Duration</p>
          {workoutSession.endedAt ? (
            <p>{formatDistanceStrict(workoutSession.startedAt, workoutSession.endedAt)}</p>
          ) : (
            <Badge>Active</Badge>
          )}
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Date</p>
          {workoutSession.endedAt ? (
            <p>{formatISO(workoutSession.startedAt, { representation: "date" })}</p>
          ) : (
            <Badge>Active</Badge>
          )}
        </div>
      </div>

      <div>
        <DeleteWorkoutSessionButton />
      </div>
    </div>
  )
}

function DeleteWorkoutSessionButton () {
  const utils = api.useUtils()

  const { mutate, isPending } = api.workout.deleteWorkoutSession.useMutation({
    onSuccess: () => {
      void utils.workout.getWorkoutSessions.invalidate()
      toast.success("Deleted Workout Session.")
      setOpen(false)
    }
  })

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="destructive"
          className="size-7"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
        >
          <Trash />
        </Button>
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
            <Button 
              type="button" 
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
            >
                Close
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={(e) => {
              e.stopPropagation()
              mutate()
            }} 
            disabled={isPending}
          >
            Delete Workout
            {isPending && <Loader2Icon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
