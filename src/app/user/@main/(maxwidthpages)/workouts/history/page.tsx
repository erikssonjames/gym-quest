"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, Clock3, Dumbbell } from "lucide-react"
import { format, formatDistanceStrict } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, MetricCard, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/react"

export default function HistoryPage () {
  const { data: sessions, isPending, isError } = api.workout.getWorkoutSessions.useQuery()
  const total = sessions?.length ?? 0
  const latest = sessions?.[0]?.endedAt

  return (
    <PageShell
      eyebrow="Training record"
      title="Workout history"
      description="Review the sessions you completed, spot your rhythm, and return to the work that is helping you move forward."
      actions={<Button asChild><Link href="/user/workouts/active/create">Start a workout<ArrowRight data-icon="inline-end" /></Link></Button>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard tone="info" label="Completed sessions" value={isPending ? "..." : String(total)} detail="Your full training record" />
        <MetricCard tone="warning" label="Latest session" value={latest ? format(latest, "MMM d") : "None yet"} detail={latest ? format(latest, "yyyy") : "Start your first workout"} />
        <MetricCard tone={total > 4 ? "success" : "default"} label="Training signal" value={total > 4 ? "Building" : "Starting"} detail="Consistency grows one session at a time" />
      </div>

      <PageSection title="Completed sessions" description="Select a session to view its full summary.">
        {isPending && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div>}
        {isError && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-6 text-sm text-muted-foreground">Your history could not be loaded.</CardContent></Card>}
        {!isPending && !isError && sessions?.length === 0 && <EmptyState title="No completed sessions yet" description="Your history will become a useful record once you finish your first workout." action={<Button asChild><Link href="/user/workouts/active/create">Choose a workout</Link></Button>} />}
        {!isPending && !isError && sessions && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link key={session.id} href={`/user/workouts/active/completed/${session.id}`} className="group block">
                <Card className="transition-colors group-hover:border-info/40 group-hover:bg-info/5"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info"><Dumbbell className="size-4" /></div><div className="min-w-0"><p className="truncate font-semibold">{session.workout?.name ?? "Open workout"}</p><p className="text-sm text-muted-foreground">{session.endedAt ? format(session.endedAt, "EEEE, MMM d, yyyy") : "Completed session"}</p></div></div><div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{session.startedAt ? format(session.startedAt, "MMM d") : "-"}</span><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{session.startedAt && session.endedAt ? formatDistanceStrict(session.startedAt, session.endedAt) : "-"}</span><Badge variant="info">View summary</Badge></div></CardContent></Card>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  )
}
