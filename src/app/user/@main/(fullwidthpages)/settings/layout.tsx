"use client"

import { useSidebar } from "@/components/ui/sidebar";
import LinkNavigation from "./_components/link-navigation";
import { H3 } from "@/components/typography/h3";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()

  return (
    <div className={cn(
      "flex px-6 py-6 md:px-10 md:py-10 h-full",
      (open || isMobile) && "flex-col gap-6"
    )}>
      <div className={cn(
        "flex flex-col gap-4 min-w-40 sticky top-0",
      )}>
        <H3 text="Settings" />
        <LinkNavigation />
      </div>
      <div className="flex-grow overflow-auto min-h-0">
        {children}
      </div>
    </div>
  );
}
