import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { BadgeLiteral } from "@/variables/badges";
import { type ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from "../tooltip";
import { CheckCircle, TriangleAlert } from "lucide-react";

export function BadgeComponent (
  { badge, unlocked = false, cursor = 'default' }: 
  { badge: BadgeLiteral, unlocked?: boolean, cursor?: 'pointer' | 'default' }
) {
  const foundBadge = useBadge(badge.id)

  if (!foundBadge) return null

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "text-xs font-bold rounded-full px-2 py-1 w-fit border-2 overflow-hidden relative flex-shrink-0",
            cursor === "default" ? "cursor-default" : "cursor-pointer",
            getBadgeSpecificClassname(badge, unlocked)
          )}>
            <span className="relative z-10">
              {foundBadge.name}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            <div>
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="font-semibold">{foundBadge.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold">{foundBadge.percentageOfUsersHasBadge}%</span> of users has this badge.
                </p>
              </div>

              {unlocked ? (
                <div className="text-green-500 flex gap-2 items-center my-4">
                  <p className="font-semibold">Unlocked</p>
                  <CheckCircle size={15} />
                </div>
              ) : (
                <div className="text-destructive flex gap-2 items-center my-4">
                  <p className="font-semibold">Not unlocked</p>
                  <TriangleAlert size={15} />
                </div>
              )}

              <div className="bg-secondary/20 border rounded-md p-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground">Requirements to Unlock</p>

                <div className="mt-4">
                  <p style={{ fontSize: 10 }} className="text-muted-foreground leading-none font-semibold">Value</p>
                  <p>{foundBadge.valueToComplete} {foundBadge.valueName}s</p>
                </div>

                <div className="mt-4">
                  <p style={{ fontSize: 10 }} className="text-muted-foreground leading-none font-semibold">Description</p>
                  <p>{foundBadge.valueDescription}</p>
                </div>
              </div>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}

function useBadge (badgeId?: string) {
  const { data: badges } = api.badges.getBadges.useQuery()

  if (!badges || !badgeId) return

  return badges.find(badge => badge.id === badgeId)
}

function getBadgeSpecificClassname (
  badge: BadgeLiteral, unlocked: boolean
): ComponentProps<'div'>["className"] {
  switch (badge.id) {
  // Group Separation
  case "1000kg":
    return unlocked ? "bg-green-300/30" : "bg-gray-800/30 text-muted-foreground"
  case "5000kg":
    return unlocked ? "bg-green-300/50 border-green-800" : "bg-gray-800/30 text-muted-foreground"
  case "10000kg":
    return unlocked ? "bg-green-300/80 border-green-700" : "bg-gray-800/30 text-muted-foreground"
  case "50000kg":
    return unlocked ? "bg-amber-300/50" : "bg-gray-800/30 text-muted-foreground"
  case "100000kg":
    return unlocked ? "bg-amber-300/60 border-amber-400/50" : "bg-gray-800/30 text-muted-foreground"
  case "500000kg":
    return unlocked ? "bg-amber-300/80 border-amber-400/90" : "bg-gray-800/30 text-muted-foreground"
  case "1000000kg":
    return unlocked ? "bg-red-500/50" : "bg-gray-800/30 text-muted-foreground"
  case "5000000kg":
    return unlocked ? "bg-red-500/70 border-red-800/90" : "bg-gray-800/30 text-muted-foreground"
  case "10000000kg":
    return unlocked ? "bg-red-500/90 border-red-800/100 outline outline-red-500/50" : "bg-gray-800/30 text-muted-foreground"
  case "50000000kg":
    return unlocked ? "bg-gradient-to-b from-gray-900/50 to-gray-600/50" : "bg-gray-800/30 text-muted-foreground"
  case "100000000kg":
    return unlocked ? "bg-gradient-to-b from-gray-900/50 to-gray-600/50 outline outline-gray-900" : "bg-gray-800/30 text-muted-foreground"
    // Group Separation
  case "2_weeks_in_a_row":
    return unlocked 
      ? "after:bg-green-300/40 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "4_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-green-700/80 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "8_weeks_in_a_row":
    return unlocked
      ? cn(
        "after:bg-green-700 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0 after:outline after:outline-green-600/40"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "12_weeks_in_a_row":
    return unlocked
      ? cn(
        "after:bg-amber-300/50 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "52_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-amber-300/70 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "104_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-amber-500 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0 after:outline after:outline-amber-600/40"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "156_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-red-500/40 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "208_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-red-500/80 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "260_weeks_in_a_row":
    return unlocked
      ? cn(
        "after:bg-red-600 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0 after:outline after:outline-red-600/40"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "312_weeks_in_a_row":
    return unlocked 
      ? cn(
        "after:bg-gray-800 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10",
        "after:content-[''] after:z-0 after:outline after:outline-gray-400/40 border"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
  case "364_weeks_in_a_row":
    return unlocked
      ? cn(
        "after:bg-gray-800 after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-6",
        "after:content-[''] after:z-0 after:outline after:outline-gray-400/40 outline outline-gray-600/50"
      )
      : "after:bg-gray-800/80 text-muted-foreground after:w-4 after:h-20 after:absolute after:-rotate-45 after:-translate-y-8 after:left-10"
    // Group Separation
  case "5_workouts":
  case "10_workouts":
  case "25_workouts":
  case "50_workouts":
  case "100_workouts":
  case "250_workouts":
  case "500_workouts":
  case "750_workouts":
  case "1000_workouts":
    return unlocked ? "" : "text-muted-foreground"
    // Group Separation
  case "0-10th_user":
    return unlocked 
      ? "after:bg-gray-700 border-gray-500 outline outline-gray-400/40 after:absolute after:inset-0 after:blur-sm after:z-0 font-bold text"
      : "after:bg-gray-800/30 after:absolute after:inset-0 after:z-0 font-bold text-muted-foreground"
  case "11-50th_user":
    return unlocked 
      ? "after:bg-red-700 border-red-500 outline outline-red-400/40 after:absolute after:inset-0 after:blur-sm after:z-0 font-bold text"
      : "after:bg-gray-800/30 after:absolute after:inset-0 after:z-0 font-bold text-muted-foreground"
  case "51-100th_user":
    return unlocked 
      ? "after:bg-amber-700 border-amber-500 outline outline-amber-400/40 after:absolute after:inset-0 after:blur-sm after:z-0 font-bold text"
      : "after:bg-gray-800/30 after:absolute after:inset-0 after:z-0 font-bold text-muted-foreground"
  case "101-500th_user":
    return unlocked 
      ? "after:bg-green-700 border-green-500 outline outline-green-400/40 after:absolute after:inset-0 after:blur-sm after:z-0 font-bold text"
      : "after:bg-gray-800/30 after:absolute after:inset-0 after:z-0 font-bold text-muted-foreground"
  case "501-1000th_user":
    return unlocked 
      ? "after:bg-violet-700 border-violet-500 outline outline-violet-400/40 after:absolute after:inset-0 after:blur-sm after:z-0 font-bold text"
      : "after:bg-gray-800/30 after:absolute after:inset-0 after:z-0 font-bold text-muted-foreground"
  }
}