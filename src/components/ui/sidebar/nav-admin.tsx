"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import Link from "next/link"
import { type SidebarItem } from "./app-sidebar"
import { useSession } from "next-auth/react"

export function NavAdmin({
  adminItem,
  isActive
}: {
  adminItem: SidebarItem[],
  isActive: (url: string) => boolean
}) {
  const session = useSession()

  if (session.data?.user.role !== "admin") return null

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Admin stuff</SidebarGroupLabel>
      <SidebarMenu>
        {adminItem.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive(item.url)} disabled={item.disabled}>
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
