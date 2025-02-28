import { useDisplayTimer } from "@/hooks/use-display-timer";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface TimerProps {
  style?: CSSProperties
  className?: string
  startTime?: string | Date
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