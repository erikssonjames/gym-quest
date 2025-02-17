"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode } from "react";
import ScrollProvider from "./scroll-provider";
import ContainerRefProvider from "./container-ref-provider";

export default function DynamicLayout({ children, className }: { children: ReactNode, className?: string }) {
  const outerRef = useRef(null)
  const scrollRef = useRef(null)
  const { open } = useSidebar()

  return (
    <div className="absolute left-0 right-0 h-dvh top-0" ref={outerRef}>
      <ContainerRefProvider ref={outerRef}>
        <div 
          className={cn(
            "absolute inset-0 overflow-y-auto",
            open ? "pt-16" : "pt-12",
            className
          )}
          ref={scrollRef}
        >
          <ScrollProvider ref={scrollRef}>
            {children}
          </ScrollProvider>
        </div>
      </ContainerRefProvider>
    </div>
  )
}