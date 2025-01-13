"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

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

export function NavMain({
  items,
  isActive,
  isPartiallyActive
}: {
  items: {
    title: string
    icon?: LucideIcon
    url: string
    items?: {
      title: string
      url: string
    }[]
  }[],
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
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} className="data-[active=true]:border-primary/40 data-[active=true]:border">
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
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
