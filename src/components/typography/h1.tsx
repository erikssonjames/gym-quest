import { cn } from "@/lib/utils"

interface H1Props {
    className?: string
    text?: string
}

export function H1({ className, text }: H1Props) {
    return (
      <h1 className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}>
        {text}
      </h1>
    )
  }
  