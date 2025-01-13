"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function LogoHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Image
            alt="Logo"
            src="/icon/android-chrome-192x192.png"
            width={26}
            height={26}
            fill={false}
            className="object-contain"
          />
          <p className="font-semibold">Gym Quest</p>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
