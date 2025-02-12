import { cn } from "@/lib/utils"

interface LargeProps {
    className?: string
    text?: string
}

export function Large({ className, text }: LargeProps) {
  return (
    <div className={cn(
      "text-lg font-semibold",
      className
    )}>
      {text}
    </div>
  )
}
  