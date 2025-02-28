"use client"

import { api } from "@/trpc/react"
import { useEffect, useRef, useState } from "react"
import { useContainerRef } from "../../../_components/container-ref-provider"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { useDisplayTimer } from "@/hooks/use-display-timer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SetInputProps {
  targetValue: { weight?: number | null, duration?: number | null }
  targetReps: number
  exerciseName: string
  sessionLogId: string
  sessionId: string
}

export default function SetInput (
  { sessionLogId, exerciseName, targetValue, targetReps }: SetInputProps
) {
  const [collapsed, setCollapsed] = useState(false)

  const ref = useContainerRef()
  const { mutateAsync } = api.workout.addWorkoutSessionLogFragment.useMutation()

  const [reps, setReps] = useState(targetReps)
  const [weight, setWeight] = useState<number>(targetValue.weight ?? 0)
  const [duration, setDuration] = useState<number>(targetValue.duration ?? 0)

  const startedAtRef = useRef<Date>(new Date())

  const onAddFragment = async () => {
    await mutateAsync({
      sessionId: "",
      fragment: {
        workoutSessionLogId: sessionLogId,
        endedAt: new Date(),
        startedAt: startedAtRef.current,
        reps,
        ...(weight ? { weight } : duration ? { duration } : {})
      }
    })
    startedAtRef.current = new Date()
  }

  useEffect(() => {
    startedAtRef.current = new Date()
  }, [])

  const time = useDisplayTimer(startedAtRef.current)

  if (!ref.current) return null

  return createPortal(
    <div className="absolute left-0 right-0 bottom-0 px-10 pb-4 flex items-center z-10">
      <div className="w-full bg-background p-6 rounded-lg shadow-2xl max-w-6xl mx-auto">
        <div 
          className={cn(
            "max-w-96 mx-auto overflow-hidden transition-all h-72",
            collapsed ? "max-h-10" : "max-h-72"
          )}
        >
          <div className="flex justify-between mb-6 items-center">
            <div className="flex gap-4 items-center">
              <p className="font-semibold">Active Set</p>
              <p className="text-sm">{time}</p>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} type="button">
              <ChevronDown 
                className={cn(
                  "transition-all",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          <div className="grid grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Current Exercise</p>
              <p>{exerciseName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Sets</p>
              <p>1/3</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Reps</p>
              <p>{targetReps}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 mt-6 gap-4">
            <div className="space-y-2 col-span-2">
              <p className="text-xs">Duration (s)</p>
              <Input value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="!text-3xl h-16" />
            </div>
            <div className="space-y-2">
              <p className="text-xs">Weight (kg)</p>
              <Input value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="!text-3xl h-16 w-20" />
            </div>
            <div className="space-y-2">
              <p className="text-xs">Reps</p>
              <Input value={reps} onChange={(e) => setReps(Number(e.target.value))} className="!text-3xl h-16 w-20" />
            </div>
          </div>

          <Button className="w-full mt-8" type="button" onClick={onAddFragment}>Complete Set</Button>
        </div>
      </div>
    </div>,
    ref.current
  )
}