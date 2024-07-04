import { cn } from "@/lib/utils"

interface SmallProps {
    className?: string
    text?: string
}

export function Small({ className, text }: SmallProps) {
    return (
      <small className={cn(
        "text-sm font-medium leading-none",
        className
      )}>
        {text}
      </small>
    )
  }
  