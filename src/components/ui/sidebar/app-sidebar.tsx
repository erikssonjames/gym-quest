"use client"

import * as React from "react"
import {
  BicepsFlexed,
  BookOpen,
  Dumbbell,
  type LucideIcon,
  PersonStanding,
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
import { Header } from "./header"
import { NavGeneral } from "./nav-general"
import { usePathname } from "next/navigation"
import { NavAdmin } from "./nav-admin"
import ActiveUsers from "./active-users"

export type SidebarItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: SidebarItem[]; // ✅ Recursively allows sub-items
  disabled?: boolean
};

export type SidebarData = {
  navMain: SidebarItem[];
  navGeneral: SidebarItem[];
  navAdmin: SidebarItem[];
};

export const sidebarData: SidebarData = {
  navMain: [
    {
      title: "Workouts",
      url: "/user/workouts",
      icon: Dumbbell,
      items: [
        { title: "Overview", url: "/user/workouts" },
        { title: "History", url: "/user/workouts/history", disabled: true },
        { title: "Manage", url: "/user/workouts/manage" },
        { title: "Active Workout", url: "/user/workouts/active" },
      ],
    },
    {
      title: "Achievements",
      url: "/user/achievements",
      icon: Trophy,
      items: [
        { title: "Levels", url: "/user/achievements/levels" },
        { title: "Trophies", url: "/user/achievements/trophies" },
      ],
      disabled: true
    },
    {
      title: "Documentation",
      url: "/user/documentation",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "/user/documentation" },
        { title: "Get Started", url: "/user/documentation/get-started" },
        { title: "Tutorials", url: "/user/documentation/tutorials" },
        { title: "Changelog", url: "/user/documentation/change-log" },
      ],
      disabled: true
    },
  ],
  navGeneral: [
    {
      title: "Settings",
      url: "/user/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/user/settings" },
        { title: "Appearance", url: "/user/settings/appearance" },
      ],
    },
  ],
  navAdmin: [
    {
      title: "Exercises",
      url: "/user/exercises",
      icon: PersonStanding,
    },
    {
      title: "Muscles",
      url: "/user/muscles",
      icon: BicepsFlexed,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUrl = usePathname()

  const isUrlActive = (url: string) => currentUrl.split("?")[0]?.endsWith(url) ?? false
  const isUrlPartiallyActive = (url: string) => currentUrl.split("?")[0]?.startsWith(url) ?? false

  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarHeader>
        <Header />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} isActive={isUrlActive} isPartiallyActive={isUrlPartiallyActive} />
        <NavGeneral generalItem={sidebarData.navGeneral} isActive={isUrlActive} />
        <NavAdmin adminItem={sidebarData.navAdmin} isActive={isUrlPartiallyActive} />
      </SidebarContent>
      <SidebarFooter>
        <ActiveUsers />
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
