"use client"

import { useSidebar } from "@/components/ui/sidebar";
import LinkNavigation from "./_components/link-navigation";
import { H3 } from "@/components/typography/h3";
import { cn } from "@/lib/utils";
import DynamicLayout from "../_components/dynamic-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
    <DynamicLayout 
      className={cn(
        "flex gap-4 md:gap-8 md:p-10 bg-muted/40",
        open && "md:flex-col"
      )}
    >
      <div className={cn(
        "flex flex-col gap-4 min-w-40 pt-10",
        open ? "" : "sticky top-0"
      )}>
        <H3 text="Settings" />
        <LinkNavigation />
      </div>
      <div className="pe-2 pt-10 table">
        {children}
      </div>
    </DynamicLayout>
  );
}
