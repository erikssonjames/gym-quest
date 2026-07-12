import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-primary/5">
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full border border-primary/10" />
        <div className="pointer-events-none absolute -right-8 -top-12 size-36 rounded-full border border-primary/10" />
        <div className="pointer-events-none absolute left-0 top-0 h-24 w-64 bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
        <CardHeader className="relative gap-4 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
          <div className="flex min-w-0 flex-col gap-3">
            {eyebrow && <Badge variant="secondary" className="w-fit">{eyebrow}</Badge>}
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-3xl leading-tight md:text-4xl">{title}</CardTitle>
              {description && <CardDescription className="max-w-2xl text-sm leading-6 md:text-base">{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </CardHeader>
      </Card>
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
  tone = "default",
}: {
  label: string
  value: string
  detail?: string
  tone?: "default" | "primary" | "success" | "info" | "warning" | "danger"
}) {
  return (
    <Card className={cn(
      "overflow-hidden bg-card/80 shadow-sm",
      tone === "primary" && "border-primary/30 bg-primary/5",
      tone === "success" && "border-success/30 bg-success/5",
      tone === "info" && "border-info/30 bg-info/5",
      tone === "warning" && "border-warning/30 bg-warning/5",
      tone === "danger" && "border-danger/30 bg-danger/5",
    )}>
      <CardContent className="flex flex-col gap-1 p-4">
        <p className={cn(
          "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
          tone === "primary" && "text-primary",
          tone === "success" && "text-success",
          tone === "info" && "text-info",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-danger",
        )}>{label}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  )
}
