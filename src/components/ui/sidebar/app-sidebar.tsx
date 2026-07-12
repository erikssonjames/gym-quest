"use client"

import * as React from "react"
import {
  BicepsFlexed,
  BookOpen,
  CreditCard,
  Dumbbell,
  Home,
  type LucideIcon,
  PersonStanding,
  Scale,
  ScrollText,
  Settings2,
  Tag,
  Trophy,
  Users,
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
  navGroups: {
    label: string;
    items: SidebarItem[];
  }[];
  navAdmin: SidebarItem[];
};

export const sidebarData: SidebarData = {
  navGroups: [
    {
      label: "Home",
      items: [
        { title: "Feed", url: "/user", icon: Home },
        { title: "Quests", url: "/user/quests", icon: ScrollText },
      ],
    },
    {
      label: "Training",
      items: [
        {
          title: "Workouts",
          url: "/user/workouts",
          icon: Dumbbell,
          items: [
            { title: "Overview", url: "/user/workouts" },
            { title: "History", url: "/user/workouts/history" },
            { title: "Manage", url: "/user/workouts/manage" },
            { title: "Active Workout", url: "/user/workouts/active" },
          ],
        },
        { title: "Exercises", url: "/user/exercises", icon: PersonStanding },
        { title: "Weight", url: "/user/progress/weight", icon: Scale },
      ],
    },
    {
      label: "Progress",
      items: [
        {
          title: "Achievements",
          url: "/user/achievements",
          icon: Trophy,
          items: [
            { title: "Overview", url: "/user/achievements" },
            { title: "Levels", url: "/user/achievements/levels" },
            { title: "Trophies", url: "/user/achievements/trophies" },
          ],
        },
      ],
    },
    {
      label: "Community",
      items: [
        { title: "Friends", url: "/user/friends", icon: Users },
      ],
    },
    {
      label: "Resources",
      items: [
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
        },
      ],
    },
    {
      label: "Account",
      items: [
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
    },
  ],
  navAdmin: [
    {
      title: "Muscles",
      url: "/user/muscles",
      icon: BicepsFlexed,
    },
    {
      title: "Badges",
      url: "/user/badges",
      icon: Tag
    },
    {
      title: "Billing",
      url: "/user/billing",
      icon: CreditCard
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUrl = usePathname()
  const currentPath = currentUrl.split("?")[0] ?? currentUrl

  const isUrlActive = (url: string) => currentPath === url
  const isUrlPartiallyActive = (url: string) => (
    url !== "/user" && (currentPath === url || currentPath.startsWith(`${url}/`))
  )

  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarHeader>
        <Header />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={sidebarData.navGroups} isActive={isUrlActive} isPartiallyActive={isUrlPartiallyActive} />
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
