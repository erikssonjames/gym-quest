"use client"

import { BadgeComponent, type BadgeDetails } from "@/components/ui/badge/badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"
import { BADGE_GROUPS, type BadgeGroupName, type BadgeLiteral } from "@/variables/badges"
import { getBadgeGroupName } from "@/components/ui/badge/utils"
import { Award, LockKeyhole, Sparkles } from "lucide-react"

export default function AchievementsPage () {
  const { data: badges, isPending, isError } = api.badges.getBadgesWithProgress.useQuery()
  const unlockedCount = badges?.filter(({ badgeProgress }) => badgeProgress?.completed).length ?? 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Sparkles className="size-3" />
            Progress gallery
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Earn proof of the work.</h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Milestones are grouped by the habits they represent. Every card shows what is next, not just what you have already unlocked.
          </p>
        </div>
        <Award className="absolute -right-4 -top-5 size-40 rotate-12 text-primary/10" aria-hidden="true" />
      </section>

      <Card>
        <CardHeader className="gap-3 pb-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Your collection</CardTitle>
            <CardDescription>{unlockedCount} of {badges?.length ?? 0} milestones unlocked</CardDescription>
          </div>
          <div className="w-full max-w-xs space-y-2 md:w-56">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall progress</span>
              <span>{badges?.length ? Math.round((unlockedCount / badges.length) * 100) : 0}%</span>
            </div>
            <Progress value={badges?.length ? (unlockedCount / badges.length) * 100 : 0} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {isPending && (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}
            </div>
          )}
          {isError && <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Achievements could not be loaded.</p>}
          {badges && BADGE_GROUPS.map((group) => {
            const groupBadges = badges
              .filter(({ badge }) => badge.group === group.id)
              .sort((left, right) => left.badge.groupWeighting - right.badge.groupWeighting)

            if (groupBadges.length === 0) return null

            return (
              <section key={group.id} className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{getBadgeGroupName(group.id as BadgeGroupName)}</h2>
                    <p className="text-sm text-muted-foreground">A ladder of increasingly ambitious milestones.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {groupBadges.filter(({ badgeProgress }) => badgeProgress?.completed).length} / {groupBadges.length}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {groupBadges.map(({ badge, badgeProgress }) => {
                    const details: BadgeDetails = {
                      ...badge,
                      currentValue: badgeProgress?.currentValue,
                    }
                    const currentValue = Math.min(badgeProgress?.currentValue ?? 0, badge.valueToComplete)
                    const percent = Math.min(100, (currentValue / badge.valueToComplete) * 100)

                    return (
                      <div key={badge.id} className="flex flex-col gap-4 rounded-xl border bg-background/70 p-4 transition-colors hover:bg-muted/30">
                        <div className="flex items-start justify-between gap-3">
                          <BadgeComponent
                            badge={{ id: badge.id, weighting: badge.groupWeighting } as BadgeLiteral}
                            details={details}
                            unlocked={badgeProgress?.completed ?? false}
                          />
                          {badgeProgress?.completed ? (
                            <span className="text-xs font-medium text-primary">Unlocked</span>
                          ) : (
                            <LockKeyhole className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{badge.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{badge.valueDescription}</span>
                            <span>{currentValue} / {badge.valueToComplete}</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
