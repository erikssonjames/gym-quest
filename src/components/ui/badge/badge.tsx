import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { BadgeLiteral } from "@/variables/badges";
import { type ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from "../tooltip";
import { Dumbbell, Flame, Repeat2, Star, CheckCircle, TriangleAlert } from "lucide-react";
import { Progress } from "../progress";

export type BadgeDetails = {
  id: string
  name: string
  description: string
  valueToComplete: number
  valueName: string
  valueDescription: string
  group: string
  percentageOfUsersHasBadge: number
  currentValue?: number
}

export function BadgeComponent (
  { badge, unlocked = false, cursor = 'default', details }:
  { badge: BadgeLiteral, unlocked?: boolean, cursor?: 'pointer' | 'default', details?: BadgeDetails }
) {
  const foundBadge = useBadge(badge.id, !details) ?? details

  if (!foundBadge) return null

  const currentValue = details?.currentValue ?? (unlocked ? foundBadge.valueToComplete : 0)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "relative flex w-fit flex-shrink-0 items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-xs font-semibold",
            cursor === "default" ? "cursor-default" : "cursor-pointer",
            getBadgeSpecificClassname(badge, unlocked)
          )}>
            {getBadgeIcon(foundBadge.group)}
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
                <div className="my-4 flex items-center gap-2 text-primary">
                  <p className="font-semibold">Unlocked</p>
                  <CheckCircle size={15} />
                </div>
              ) : (
                <div className="my-4 flex items-center gap-2 text-destructive">
                  <p className="font-semibold">Not unlocked</p>
                  <TriangleAlert size={15} />
                </div>
              )}

              <div className="mb-2 space-y-3 rounded-md border bg-secondary/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                  <p className="text-xs font-medium">
                    {Math.min(currentValue, foundBadge.valueToComplete)} / {foundBadge.valueToComplete}
                  </p>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (currentValue / foundBadge.valueToComplete) * 100
                  )}
                  className="h-2"
                />

                <div>
                  <p className="text-[10px] font-semibold leading-none text-muted-foreground">Value</p>
                  <p>{foundBadge.valueToComplete} {foundBadge.valueName}s</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold leading-none text-muted-foreground">Description</p>
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

function useBadge (badgeId?: string, enabled = true) {
  const { data: badges } = api.badges.getBadges.useQuery(undefined, { enabled })

  if (!badges || !badgeId) return

  return badges.find(badge => badge.id === badgeId)
}

function getBadgeSpecificClassname (
  badge: BadgeLiteral, unlocked: boolean
): ComponentProps<'div'>["className"] {
  return cn(
    unlocked
      ? "border-primary/40 bg-primary/10 text-foreground shadow-sm"
      : "border-border bg-muted/50 text-muted-foreground opacity-75",
    badge.weighting >= 8 && unlocked && "border-primary bg-primary/15 shadow-md",
    badge.weighting >= 5 && unlocked && "ring-1 ring-primary/20"
  )
}

function getBadgeIcon (group: string) {
  if (group === "weight_lifting") return <Dumbbell className="size-3.5 text-primary" />
  if (group === "consistent_lifter") return <Repeat2 className="size-3.5 text-primary" />
  if (group === "frequent_lifter") return <Flame className="size-3.5 text-primary" />
  return <Star className="size-3.5 text-primary" />
}
