"use client"

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Notifications from "./notifications";
import SendFeedback from "./send-feedback";

const ITEMS_TO_DISPLAY = 3

export default function Navbar () {
  const [open, setOpen] = useState(false)
  const pathName = usePathname()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const breadcrumbArr: { name: string, url: string, active: boolean }[] = useMemo(() => {
    const segments = pathName.split("/")
      .filter(segment => segment)

    const res: { name: string, url: string, active: boolean }[] = segments.map((segment, index) => ({
      name: segment,
      active: false,
      url: "/" + segments.slice(0, index + 1).join("/")
    }))

    return res.map(segment => ({
      ...segment,
      active: segment.url === pathName
    })).sort((a, b) => a.url.length - b.url.length).filter(segment => segment.name !== "user")
  }, [pathName])

  return (
    <header className="flex w-full h-16 shrink-0 items-center border-b justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 absolute top-0 bg-background/50 backdrop-blur-sm z-30">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden">
          <BreadcrumbList>
            <BreadcrumbItem>
              {breadcrumbArr.length === 0 ? (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                  Dashboard
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/user">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {breadcrumbArr.length > 0 && <BreadcrumbSeparator />}
            {breadcrumbArr.length > ITEMS_TO_DISPLAY ? (
              <>
                <BreadcrumbItem>
                  {isDesktop ? (
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                      <DropdownMenuTrigger
                        className="flex items-center gap-1"
                        aria-label="Toggle menu"
                      >
                        <BreadcrumbEllipsis className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {breadcrumbArr.slice(1, -2).map((item, index) => (
                          <DropdownMenuItem key={index}>
                            <Link href={item.url} className="capitalize">
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Drawer open={open} onOpenChange={setOpen}>
                      <DrawerTrigger aria-label="Toggle Menu">
                        <BreadcrumbEllipsis className="h-4 w-4" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader className="text-left">
                          <DrawerTitle>Navigate to</DrawerTitle>
                          <DrawerDescription>
                                                Select a page to navigate to.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="grid gap-1 px-4">
                          {breadcrumbArr.slice(1, -2).map((item, index) => (
                            <Link
                              key={index}
                              href={item.url}
                              className="py-1 text-sm capitalize"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <DrawerFooter className="pt-4">
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}
            {breadcrumbArr.slice(-ITEMS_TO_DISPLAY).map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem key={index}>
                  {!item.active ? (
                    <BreadcrumbLink
                      asChild
                      className="max-w-20 truncate md:max-w-none capitalize"
                    >
                      <Link href={item.url}>{item.name}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="max-w-20 truncate md:max-w-none capitalize">
                      {item.name}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!item.active && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex gap-2 items-center">
        <SendFeedback />
        <Notifications />
      </div>
    </header>
  )
}