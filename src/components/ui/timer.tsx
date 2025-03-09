import { useDisplayTimer, useDisplayTimerInSeconds } from "@/hooks/use-display-timer";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface TimerProps {
  style?: CSSProperties
  className?: string
  startTime?: string | Date
  initialSeconds?: number
  paused?: boolean
}

export default function Timer ({ startTime, className, style }: TimerProps) {
  const time = useDisplayTimer(startTime)

  return (
    <p 
      style={{
        ...style
      }}
      className={cn(
        className,
      )}
    >
      {time}
    </p>
  )
}

export function TimerSeconds ({ startTime, initialSeconds, className, style, paused }: TimerProps) {
  const time = useDisplayTimerInSeconds(startTime, initialSeconds, paused)

  return (
    <p 
      style={{
        ...style
      }}
      className={cn(
        className,
      )}
    >
      {time}
    </p>
  )
}