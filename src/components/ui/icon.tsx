import { Dumbbell } from "lucide-react"

interface IconProps {
  displayText: boolean
}

export default function Icon({ displayText }: IconProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="size-4" aria-hidden="true" />
      </span>
      {displayText && (
        <div className="hidden flex-col gap-0.5 sm:flex">
          <p className="text-sm font-semibold leading-none tracking-tight">GymQuest</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Train with purpose
          </p>
        </div>
      )}
    </div>
  )
}
