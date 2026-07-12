"use client"

import Link from "next/link"
import { ArrowRight, Award, LockKeyhole } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/react"
import { getBadgeGroupName } from "@/components/ui/badge/utils"

export default function TrophiesPage () {
  const { data: badges, isPending, isError } = api.badges.getBadgesWithProgress.useQuery()
  const unlocked = badges?.filter(({ badgeProgress }) => badgeProgress?.completed).length ?? 0

  return (
    <PageShell
      eyebrow="Milestones"
      title="Trophy room"
      description="A focused view of the milestones you have earned and the next ones within reach."
      actions={<Button asChild variant="outline"><Link href="/user/achievements">View all achievements<ArrowRight data-icon="inline-end" /></Link></Button>}
    >
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-warning/15 text-warning"><Award className="size-6" /></div><div><p className="text-2xl font-semibold">{unlocked} trophies earned</p><p className="text-sm text-muted-foreground">Every trophy is a record of a useful habit.</p></div></div>
          <Badge variant="warning">{badges?.length ? Math.round((unlocked / badges.length) * 100) : 0}% collected</Badge>
        </CardContent>
      </Card>

      <PageSection title="Milestone ladders" description="Work through each family one step at a time.">
        {isPending && <p className="text-sm text-muted-foreground">Loading trophies...</p>}
        {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-muted-foreground">Trophies could not be loaded.</p>}
        {badges && (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from(new Set(badges.map(({ badge }) => badge.group))).map((group) => {
              const groupBadges = badges.filter(({ badge }) => badge.group === group).sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting)
              const groupUnlocked = groupBadges.filter(({ badgeProgress }) => badgeProgress?.completed).length
              const next = groupBadges.find(({ badgeProgress }) => !badgeProgress?.completed)
              const value = Math.min(next?.badge.valueToComplete ?? 1, next?.badgeProgress?.currentValue ?? (next ? 0 : 1))
              const progress = next ? (value / next.badge.valueToComplete) * 100 : 100

              return (
                <Card key={group}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{getBadgeGroupName(group as Parameters<typeof getBadgeGroupName>[0])}</p><p className="text-sm text-muted-foreground">{groupUnlocked} of {groupBadges.length} unlocked</p></div><Award className="size-5 text-warning" /></div>
                    {next ? <><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-muted-foreground" /><p className="text-sm">Next: <span className="font-medium">{next.badge.name}</span></p></div><Progress value={progress} variant="warning" className="h-2" /><p className="text-xs text-muted-foreground">{value} / {next.badge.valueToComplete} {next.badge.valueName}</p></> : <p className="text-sm text-success">This ladder is complete.</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </PageSection>
    </PageShell>
  )
}
