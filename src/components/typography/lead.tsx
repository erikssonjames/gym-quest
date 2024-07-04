import { cn } from "@/lib/utils"

interface LeadProps {
    className?: string
    text?: string
}

export function Lead({ className, text }: LeadProps) {
    return (
      <p className={cn(
        "text-xl text-muted-foreground",
        className
      )}>
        {text}
      </p>
    )
  }
  