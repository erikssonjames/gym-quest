"use client"

import { ChevronRight, Plus } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/trpc/react"
import { type SidebarItem } from "./app-sidebar"
import { useDisplayTimer } from "@/hooks/useDisplayTimer"
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from "../tooltip"

export function NavMain({
  items,
  isActive,
  isPartiallyActive
}: {
  items: SidebarItem[],
  isActive: (url: string) => boolean,
  isPartiallyActive: (url: string) => boolean
}) {
  const { open } = useSidebar()
  const router = useRouter()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Training</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isPartiallyActive(item.url)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  isActive={isActive(item.url) || isPartiallyActive(item.url)}
                  onClick={() => {
                    if (!open) router.push(item.url)
                  }}
                  className="group/menu-button"
                >
                  {item.icon && <item.icon className="group-data-[active=true]/menu-button:text-primary" />}
                  <span className="">{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    subItem.title === "Active Workout" ? (
                      <ActiveWorkoutItem key={subItem.title} subItem={subItem} isActive={isActive} />
                    ) : (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function ActiveWorkoutItem ({ isActive, subItem }:  { isActive: (url: string) => boolean, subItem: SidebarItem }) {
  const { data: activeSession } = api.workout.getActiveWorkoutSession.useQuery()
  const timePassed = useDisplayTimer(activeSession?.startedAt)

  return (
    <SidebarMenuSubItem>
      {activeSession ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} className="relative border border-primary border-dashed">
                <Link href={subItem.url}>
                  <span>{subItem.title}</span>
                  <div className="absolute z-10 right-0 bg-sidebar/20 top-0 bottom-0 flex flex-col items-center justify-center px-2 backdrop-blur-sm">
                    <p>{timePassed}</p>
                  </div>
                </Link>
              </SidebarMenuSubButton>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent align="start" side="right" className="z-50">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Workout</p>
                    <p>{activeSession.workout.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p>{activeSession.startedAt.toTimeString().split("GMT")[0]}</p>
                  </div>
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <SidebarMenuSubButton asChild isActive={isActive("/user/workouts/active/create")} className="relative border border-dashed">
          <Link href="/user/workouts/active/create">
            <Plus />
            <p>Start new Workout</p>
          </Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  )
}