"use client"

import { useSidebar } from "@/components/ui/sidebar";
import DynamicLayout from "./_components/dynamic-layout";
import Feed from "./_components/feed";
import UserProfile from "./_components/user-profile";
import { cn } from "@/lib/utils";

export default function Dashboard () {
  const { open } = useSidebar()

  return (
    <DynamicLayout>
      <section className="p-10 h-full">
        <div className="flex gap-6 h-full">
          <div className={cn(
            "w-72 hidden flex-shrink-0",
            open ? "xl:block" : "lg:block"
          )}>
            <UserProfile />
          </div>
          <div className="flex-grow h-full overflow-y-auto">
            <Feed />
          </div>
        </div>
      </section>
    </DynamicLayout>
  )
}