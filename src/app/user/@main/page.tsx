"use client"

import DynamicLayout from "./_components/dynamic-layout";
import Feed from "./_components/feed";
import FeedSidebar from "./_components/feed/feed-sidebar";

export default function Dashboard() {
  return (
    <DynamicLayout>
      <section className="h-full overflow-y-auto bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 md:px-6 md:py-7 lg:grid-cols-[minmax(0,48rem)_16rem] lg:justify-center xl:grid-cols-[minmax(0,52rem)_18rem]">
          <main className="min-w-0">
            <Feed />
          </main>
          <aside className="hidden lg:block">
            <FeedSidebar />
          </aside>
        </div>
      </section>
    </DynamicLayout>
  )
}
