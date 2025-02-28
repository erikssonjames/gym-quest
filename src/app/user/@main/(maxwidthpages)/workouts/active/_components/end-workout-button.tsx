"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function EndWorkoutButton ({ workoutSessionId }: { workoutSessionId: string }) {
  const router = useRouter()
  const utils = api.useUtils()

  const { mutate, isPending } = api.workout.endWorkoutSession.useMutation({
    onSuccess: async (sessionId) => {
      await utils.workout.getActiveWorkoutSession.invalidate()
      toast.success("Ended workout.")

      if (sessionId) {
        router.push(`/user/workouts/active/${sessionId}`)
      } else {
        router.push("/user/workouts")
      }
    }
  })

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          End Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to end this workout?</DialogTitle>
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
          <Button type="button" variant="destructive" onClick={() => mutate(workoutSessionId)} disabled={isPending}>
            End Workout
            {isPending && <Loader2Icon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
