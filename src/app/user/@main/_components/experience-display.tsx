"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"

export default function ExperienceDisplay() {
  const { data: progression, isPending } = api.progression.getProgression.useQuery()

  if (isPending) return <Skeleton className="h-10 w-36" />
  if (!progression) return null

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="outline" className="min-w-28 px-2 sm:min-w-44">
            <Link href="/user/achievements/levels" aria-label={`Level ${progression.level}, ${progression.totalExperience} experience points`}>
              <Badge variant="warning" className="size-7 shrink-0 justify-center rounded-full p-0">{progression.level}</Badge>
              <span className="hidden min-w-0 flex-1 flex-col gap-1 sm:flex">
                <span className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold">Level {progression.level}</span>
                  <span className="text-muted-foreground">{progression.experienceToNextLevel.toLocaleString()} XP left</span>
                </span>
                <Progress value={progression.progressPercent} variant="warning" className="h-1.5" />
              </span>
              <span className="sm:hidden">{progression.totalExperience.toLocaleString()} XP</span>
              <Sparkles data-icon="inline-end" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">
          <div className="flex min-w-48 flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold">Level {progression.level}</span>
              <span>{progression.totalExperience.toLocaleString()} total XP</span>
            </div>
            <Progress value={progression.progressPercent} variant="warning" className="h-2" />
            <p className="text-xs text-muted-foreground">Finish workouts, collect quests, and unlock achievements to level up.</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
