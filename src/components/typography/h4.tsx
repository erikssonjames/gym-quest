import { cn } from "@/lib/utils"

interface H4Props {
    className?: string
    text?: string
}

export function H4({ className, text }: H4Props) {
  return (
    <h4 className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight",
      className
    )}>
      {text}
    </h4>
  )
}
  