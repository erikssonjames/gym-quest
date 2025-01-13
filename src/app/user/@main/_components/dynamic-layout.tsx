"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function DynamicLayout({ children, className }: { children: ReactNode, className?: string }) {
  const { open } = useSidebar()

  return (
    <div className={cn(
      "absolute inset-0 overflow-y-auto",
      open ? "pt-16" : "pt-12",
      className
    )}>
      {children}
    </div>
  )
}