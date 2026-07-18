"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Dumbbell,
  Layers3,
  Loader2,
  ExternalLink,
  ScrollText,
  Share2,
  Sparkles,
  Target,
  Weight,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { api, type RouterOutputs } from "@/trpc/react"
import { SharePostDialog } from "@/app/user/@main/_components/feed/share-post-dialog"

type Quest = RouterOutputs["quests"]["getQuestBoard"]["quests"][number]

const questPresentations: Array<{
  id: Quest["id"]
  icon: LucideIcon
  tone: "info" | "success" | "warning"
}> = [
  { id: "daily-session", icon: Dumbbell, tone: "info" },
  { id: "daily-sets", icon: Layers3, tone: "info" },
  { id: "weekly-sessions", icon: CalendarCheck, tone: "success" },
  { id: "weekly-volume", icon: Weight, tone: "success" },
  { id: "journey-five", icon: ScrollText, tone: "warning" },
]

export default function QuestsPage() {
  const utils = api.useUtils()
  const { data: board, isPending, isError } = api.quests.getQuestBoard.useQuery()
  const { data: questShares } = api.feed.getMyQuestShares.useQuery()
  const [claimingQuestId, setClaimingQuestId] = useState<string>()
  const claimQuest = api.quests.claimQuest.useMutation({
    onSuccess: async ({ experienceAwarded }) => {
      await Promise.all([
        utils.quests.getQuestBoard.invalidate(),
        utils.progression.getProgression.invalidate(),
      ])
      toast.success("Quest reward claimed!", {
        description: `+${experienceAwarded} XP added to your adventurer level.`,
      })
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setClaimingQuestId(undefined),
  })

  const collectQuest = (questId: string) => {
    setClaimingQuestId(questId)
    claimQuest.mutate(questId)
  }

  return (
    <PageShell
      eyebrow="Quest board"
      title="Your next objectives"
      description="Complete objectives, collect their rewards, and turn every workout into experience. Daily quests reset at midnight UTC and weekly quests reset each Monday."
      actions={(
        <Button asChild>
          <Link href="/user/workouts/active/create">
            Start a workout
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      )}
      className="max-w-none px-0 py-0"
    >
      <Card className={cn(board?.collectableCount && "border-success/40 bg-success/5 shadow-md")}>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-info/10 text-info">
              <Target className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">Reward progress</CardTitle>
              <CardDescription>
                {board?.claimedCount ?? 0} of {board?.quests.length ?? 0} current rewards collected
              </CardDescription>
            </div>
          </div>
          <Badge variant={board?.collectableCount ? "success" : "secondary"}>
            {board?.collectableCount ? `${board.collectableCount} ready to collect` : "Complete quests to earn XP"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Progress
            value={board?.quests.length ? (board.claimedCount / board.quests.length) * 100 : 0}
            variant="success"
            className="h-2"
          />
        </CardContent>
      </Card>

      <PageSection title="Active quests" description="Daily, weekly, and one-time journey objectives.">
        {isPending && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-60 rounded-xl" />)}
          </div>
        )}

        {isError && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">Quests could not be loaded</CardTitle>
              <CardDescription>Refresh the page to reconnect your workout history.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {board && (
          <div className="grid gap-4 md:grid-cols-2">
            {board.quests.map((quest) => {
              const presentation = questPresentations.find((item) => item.id === quest.id)
              const Icon = presentation?.icon ?? ScrollText
              return (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  icon={Icon}
                  tone={presentation?.tone ?? "warning"}
                  isClaiming={claimingQuestId === quest.id}
                  onCollect={() => collectQuest(quest.id)}
                  sharedPostId={quest.claimId
                    ? questShares?.find((share) => share.questClaimId === quest.claimId)?.postId
                    : undefined}
                />
              )
            })}
          </div>
        )}
      </PageSection>
    </PageShell>
  )
}

function QuestCard({
  quest,
  icon: Icon,
  tone,
  isClaiming,
  onCollect,
  sharedPostId,
}: {
  quest: Quest
  icon: LucideIcon
  tone: "info" | "success" | "warning"
  isClaiming: boolean
  onCollect: () => void
  sharedPostId?: string
}) {
  const current = Math.min(quest.current, quest.target)
  const cadence = quest.cadence.charAt(0).toUpperCase() + quest.cadence.slice(1)

  return (
    <Card className={cn(quest.collectable && "border-success bg-success/5 shadow-lg ring-1 ring-success/20")}>
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground",
            tone === "info" && "bg-info/10 text-info",
            tone === "success" && "bg-success/10 text-success",
            tone === "warning" && "bg-warning/15 text-warning",
            quest.collectable && "bg-success text-success-foreground shadow-sm",
          )}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="warning">+{quest.experience} XP</Badge>
            <Badge variant={quest.claimed || quest.collectable ? "success" : tone}>
              {quest.claimed && <Check aria-hidden="true" />}
              {quest.claimed ? "Collected" : quest.collectable ? "Ready" : cadence}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{quest.title}</CardTitle>
          <CardDescription>{quest.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{current.toLocaleString()} / {quest.target.toLocaleString()} {quest.unit}</span>
        </div>
        <Progress value={(current / quest.target) * 100} variant={quest.completed ? "success" : tone} className="h-2" />
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {quest.claimed
            ? "Reward collected."
            : quest.completed
              ? "Your reward is ready."
              : `${(quest.target - current).toLocaleString()} ${quest.unit} remaining.`}
        </p>
        {quest.collectable && (
          <Button size="sm" onClick={onCollect} disabled={isClaiming}>
            {isClaiming ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
            Claim +{quest.experience} XP
          </Button>
        )}
        {quest.claimed && quest.claimId && sharedPostId && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/user/posts/${sharedPostId}`}>
              <ExternalLink data-icon="inline-start" />
              View post
            </Link>
          </Button>
        )}
        {quest.claimed && quest.claimId && !sharedPostId && (
          <SharePostDialog
            description={`Share ${quest.title} and the ${quest.experience.toLocaleString()} XP reward with your friends.`}
            source={{ kind: "quest", questClaimId: quest.claimId }}
            title="Share quest completion"
            trigger={(
              <Button size="sm" type="button" variant="outline">
                <Share2 data-icon="inline-start" />
                Share
              </Button>
            )}
          />
        )}
      </CardFooter>
    </Card>
  )
}
