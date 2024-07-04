import { cn } from "@/lib/utils"

interface MutedProps {
    className?: string
    text?: string
}

export function Muted({ className, text }: MutedProps) {
    return (
      <p className={cn(
        "text-sm text-muted-foreground",
        className
      )}>
        {text}
      </p>
    )
  }
  