import { cn } from "@/lib/utils"

interface H2Props {
    className?: string
    text?: string
}

export function H2({ className, text }: H2Props) {
  return (
    <h2 className={cn(
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      className
    )}>
      {text}
    </h2>
  )
}
  