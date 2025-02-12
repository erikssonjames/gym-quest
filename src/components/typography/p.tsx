import { cn } from "@/lib/utils"

interface PProps {
    className?: string
    text?: string
}

export function P({ className, text }: PProps) {
  return (
    <p className={cn(
      "leading-7 [&:not(:first-child)]:mt-6",
      className
    )}>
      {text}
    </p>
  )
}
  