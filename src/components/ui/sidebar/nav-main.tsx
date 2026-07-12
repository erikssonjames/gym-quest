"use client"

import { ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDisplayTimer } from "@/hooks/use-display-timer"
import { api } from "@/trpc/react"
import { type SidebarItem } from "./app-sidebar"

type NavigationGroup = {
  label: string
  items: SidebarItem[]
}

export function NavMain({
  groups,
  isActive,
  isPartiallyActive,
}: {
  groups: NavigationGroup[]
  isActive: (url: string) => boolean
  isPartiallyActive: (url: string) => boolean
}) {
  const { open } = useSidebar()
  const router = useRouter()
  const { data: questBoard } = api.quests.getQuestBoard.useQuery()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const rewardsReady = item.url === "/user/quests"
                ? questBoard?.collectableCount ?? 0
                : 0
              const itemIsActive = isActive(item.url) || isPartiallyActive(item.url)

              if (!item.items?.length) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={rewardsReady ? `${item.title}: ${rewardsReady} rewards ready` : item.title}
                      isActive={itemIsActive}
                      disabled={item.disabled}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {rewardsReady > 0 && (
                      <SidebarMenuBadge aria-label={`${rewardsReady} quest rewards ready to collect`}>
                        {rewardsReady}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              }

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isPartiallyActive(item.url)}
                  className="group/collapsible"
                  disabled={item.disabled}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={itemIsActive}
                        onClick={() => {
                          if (!open) router.push(item.url)
                        }}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          subItem.title === "Active Workout" ? (
                            <ActiveWorkoutItem key={subItem.title} subItem={subItem} isActive={isActive} />
                          ) : (
                            !subItem.disabled && (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          )
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

function ActiveWorkoutItem({
  isActive,
  subItem,
}: {
  isActive: (url: string) => boolean
  subItem: SidebarItem
}) {
  const { data: activeSession } = api.workout.getActiveWorkoutSession.useQuery()
  const timePassed = useDisplayTimer(activeSession?.startedAt ?? undefined)
  const timerText = activeSession?.startedAt ? timePassed : "Ready"

  return (
    <SidebarMenuSubItem>
      {activeSession ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} className="relative border border-dashed border-primary">
                <Link href={subItem.url}>
                  <span>{subItem.title}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center bg-sidebar/80 px-2 backdrop-blur-sm">
                    {timerText}
                  </span>
                </Link>
              </SidebarMenuSubButton>
            </TooltipTrigger>
            <TooltipContent align="start" side="right">
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Workout</p>
                  <p>{activeSession.workout?.name ?? "Empty workout"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p>{activeSession.startedAt ? activeSession.startedAt.toTimeString().split("GMT")[0] : "Not started"}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <SidebarMenuSubButton asChild isActive={isActive("/user/workouts/active/create")} className="border border-dashed">
          <Link href="/user/workouts/active/create">
            <Plus />
            <span>Start new workout</span>
          </Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  )
}
