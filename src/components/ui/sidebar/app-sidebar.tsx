"use client"

import * as React from "react"
import {
  BookOpen,
  Dumbbell,
  Settings2,
  Trophy,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { LogoHeader } from "./team-switcher"
import { NavGeneral } from "./nav-general"
import { usePathname } from "next/navigation"

export const sidebarData = {
  navMain: [
    {
      title: "Workouts",
      url: '/user/workouts',
      icon: Dumbbell,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/user/workouts'
        },
        {
          title: "History",
          url: "/user/workouts/history",
        },
        {
          title: "Manage",
          url: "/user/workouts/manage",
        },
      ],
    },
    {
      title: "Achievements",
      url: "/user/achievements",
      icon: Trophy,
      items: [
        {
          title: "Levels",
          url: "/user/achievements/levels"
        },
        {
          title: "Trophies",
          url: "/user/achievements/trophies"
        }
      ]
    },
    {
      title: "Documentation",
      url: "/user/documentation",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "/user/documentation",
        },
        {
          title: "Get Started",
          url: "/user/documentation/get-started",
        },
        {
          title: "Tutorials",
          url: "/user/documentation/tutorials",
        },
        {
          title: "Changelog",
          url: "/user/documentation/change-log",
        },
      ],
    }
  ],
  navGeneral: [
    {
      name: 'Settings',
      url: '/user/settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/user/settings'
        },
        {
          title: 'Appearance',
          url: '/user/settings/appearance'
        }
      ]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUrl = usePathname()

  const isUrlActive = (url: string) => currentUrl.split("?")[0]?.endsWith(url) ?? false
  const isUrlPartiallyActive = (url: string) => currentUrl.split("?")[0]?.startsWith(url) ?? false

  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarHeader>
        <LogoHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} isActive={isUrlActive} isPartiallyActive={isUrlPartiallyActive} />
        <NavGeneral generalItem={sidebarData.navGeneral} isActive={isUrlActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
