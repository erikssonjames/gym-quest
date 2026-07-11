import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8", className)}>
      <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow && <Badge variant="secondary" className="w-fit">{eyebrow}</Badge>}
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            {description && <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}

export function PageSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card className="border-dashed bg-muted/20 shadow-none">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="font-medium">{title}</p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <Card className="bg-card/80 shadow-sm">
      <CardContent className="flex flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  )
}
