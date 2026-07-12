"use client"

import Link from "next/link"
import { ArrowRight, Award, ScrollText, Sparkles } from "lucide-react"

import { MetricCard, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

export default function LevelsPage() {
  const { data: progression, isPending } = api.progression.getProgression.useQuery()
  const currentLevel = progression?.level ?? 1

  return (
    <PageShell
      eyebrow="Progression"
      title="Experience and levels"
      description="Collect quest rewards and unlock achievements to earn XP. Your total experience determines your level."
      actions={(
        <Button asChild>
          <Link href="/user/quests">
            View quests
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      )}
    >
      {isPending || !progression ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard tone="info" label="Current level" value={`Level ${progression.level}`} detail="Your adventurer rank" />
          <MetricCard tone="warning" label="Total experience" value={`${progression.totalExperience.toLocaleString()} XP`} detail="From collected rewards" />
          <MetricCard tone="success" label="Next level" value={`${progression.experienceToNextLevel.toLocaleString()} XP`} detail="Experience remaining" />
        </div>
      )}

      <PageSection title="Current level" description="Each new level requires slightly more XP than the last.">
        <Card className="border-warning/40 bg-warning/5 shadow-md">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">Level {currentLevel}</CardTitle>
              <Badge variant="warning"><Sparkles /> Adventurer</Badge>
            </div>
            <CardDescription>
              {progression
                ? `${progression.experienceIntoLevel.toLocaleString()} of ${progression.experienceForLevel.toLocaleString()} XP earned at this level`
                : "Loading experience..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progression?.progressPercent ?? 0} variant="warning" className="h-3" />
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="Earn experience" description="Rewards come from the parts of GymQuest that mark real progress.">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info"><ScrollText className="size-5" /></div>
              <CardTitle className="text-lg">Collect quest rewards</CardTitle>
              <CardDescription>Daily, weekly, and journey quests award XP after you collect them.</CardDescription>
            </CardHeader>
            <CardContent><Button asChild variant="outline" size="sm"><Link href="/user/quests">Open quest board</Link></Button></CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-warning/15 text-warning"><Award className="size-5" /></div>
              <CardTitle className="text-lg">Unlock achievements</CardTitle>
              <CardDescription>Badge XP is awarded automatically the moment an achievement unlocks.</CardDescription>
            </CardHeader>
            <CardContent><Button asChild variant="outline" size="sm"><Link href="/user/achievements">View achievements</Link></Button></CardContent>
          </Card>
        </div>
      </PageSection>

    </PageShell>
  )
}
