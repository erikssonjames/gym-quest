"use client"

import Link from "next/link"
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, MetricCard, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/react"

const levelSteps = [
  { level: 1, title: "First steps", description: "Complete your first workout and build your training baseline." },
  { level: 2, title: "Finding rhythm", description: "Return for five completed sessions and make training a habit." },
  { level: 3, title: "Training identity", description: "Complete twenty-five sessions and establish your regular practice." },
  { level: 4, title: "Long game", description: "Keep showing up for fifty sessions and make consistency visible." },
]

export default function LevelsPage () {
  const { data: sessions, isPending } = api.workout.getWorkoutSessions.useQuery()
  const completedSessions = sessions?.length ?? 0
  const currentLevel = completedSessions >= 50 ? 4 : completedSessions >= 25 ? 3 : completedSessions >= 5 ? 2 : 1
  const nextTarget = currentLevel === 1 ? 5 : currentLevel === 2 ? 25 : currentLevel === 3 ? 50 : 50
  const previousTarget = currentLevel === 1 ? 0 : currentLevel === 2 ? 5 : currentLevel === 3 ? 25 : 50
  const progress = currentLevel === 4
    ? 100
    : Math.min(100, ((completedSessions - previousTarget) / (nextTarget - previousTarget)) * 100)

  return (
    <PageShell
      eyebrow="Progression"
      title="Training levels"
      description="Levels turn completed sessions into a simple picture of your consistency. Keep the next milestone close and achievable."
      actions={(
        <Button asChild>
          <Link href="/user/workouts/active/create">
            Start a workout
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      )}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Current level" value={`Level ${currentLevel}`} detail={levelSteps[currentLevel - 1]?.title} />
        <MetricCard label="Sessions completed" value={isPending ? "..." : String(completedSessions)} detail="Your training record" />
        <MetricCard label="Next milestone" value={currentLevel === 4 ? "Complete" : String(nextTarget)} detail={currentLevel === 4 ? "Keep building" : "completed sessions"} />
      </div>

      <PageSection title="Current progression" description="Your next level is based on completed sessions.">
        <Card className="overflow-hidden">
          <CardHeader className="gap-3 border-b bg-primary/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">Level {currentLevel}: {levelSteps[currentLevel - 1]?.title}</CardTitle>
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary"><Sparkles className="size-3" /> Active</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{levelSteps[currentLevel - 1]?.description}</p>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="flex justify-between text-sm"><span>{completedSessions} sessions</span><span>{currentLevel === 4 ? "Max displayed level" : `${nextTarget} to unlock next level`}</span></div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="The path ahead" description="Each step is a reason to come back, not a demand to be perfect.">
        {isPending ? (
          <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {levelSteps.map((step) => {
              const unlocked = currentLevel >= step.level
              return (
                <Card key={step.level} className={unlocked ? "border-primary/30 bg-primary/[0.03]" : "opacity-75"}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted/50">
                      {unlocked ? <Check className="size-4 text-primary" /> : <LockKeyhole className="size-4 text-muted-foreground" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Level {step.level}: {step.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {sessions && sessions.length === 0 && (
          <EmptyState title="Your first level is waiting" description="Complete a workout and your training progression will start here." action={<Button asChild><Link href="/user/workouts/active/create">Choose a workout</Link></Button>} />
        )}
      </PageSection>
    </PageShell>
  )
}
