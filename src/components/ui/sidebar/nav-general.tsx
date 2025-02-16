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

export function NavGeneral({
  generalItem,
  isActive
}: {
  generalItem: SidebarItem[],
  isActive: (url: string) => boolean
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {generalItem.map((item) => (
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
