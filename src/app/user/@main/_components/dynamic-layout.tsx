"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export default function DynamicLayout({ children, className }: { children: ReactNode, className?: string }) {
  const { open } = useSidebar()

  return (
    <div className="absolute left-0 right-0 h-dvh top-0">
      <div 
        className={cn(
          "absolute inset-0",
          open ? "pt-16" : "pt-12",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}