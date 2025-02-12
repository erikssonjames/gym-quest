import { cn } from "@/lib/utils"

interface InlineCodeProps {
    className?: string
    text?: string
}

export function InlineCode({ className, text }: InlineCodeProps) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      className
    )}>
      {text}
    </code>
  )
}
  