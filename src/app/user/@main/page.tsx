"use client"

import DynamicLayout from "./_components/dynamic-layout";
import Feed from "./_components/feed";
import FeedSidebar from "./_components/feed/feed-sidebar";

export default function Dashboard() {
  return (
    <DynamicLayout>
      <section className="h-full overflow-y-auto bg-muted/20">
        <div className="mx-auto grid w-full max-w-6xl justify-center gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[minmax(0,42rem)_18rem]">
          <main className="min-w-0">
            <Feed />
          </main>
          <aside className="sticky top-4 hidden h-fit lg:block">
            <FeedSidebar />
          </aside>
        </div>
      </section>
    </DynamicLayout>
  )
}
