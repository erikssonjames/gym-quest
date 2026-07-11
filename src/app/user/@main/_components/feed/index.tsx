"use client"

import { ArrowUpRight, Radio } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import EmptyWelcomeMessage from "./empty-welcome-message"
import FeedPost from "./feed-post"
import PostComposer from "./post-composer"

export default function Feed() {
  const { data: posts, isError, isLoading } = api.feed.getLatestPosts.useQuery({ limit: 50 })
  const { data: session } = useSession()
  const [filter, setFilter] = useState<"all" | "mine">("all")
  const visiblePosts = useMemo(() => {
    if (filter === "all") return posts ?? []
    return (posts ?? []).filter((post) => post.author.id === session?.user.id)
  }, [filter, posts, session?.user.id])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <header className="flex flex-col gap-5 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Home base
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">News feed</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              The latest from your training circle, the GymQuest team, and the work
              you are putting in.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/user/workouts/active/create">
            Start a workout
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </header>

      <PostComposer />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Latest updates</h2>
          <p className="mt-1 text-sm text-muted-foreground">A little momentum from around GymQuest.</p>
        </div>
        <div className="flex items-center gap-2"><Button type="button" size="sm" variant={filter === "all" ? "secondary" : "ghost"} onClick={() => setFilter("all")}>All updates</Button><Button type="button" size="sm" variant={filter === "mine" ? "secondary" : "ghost"} onClick={() => setFilter("mine")}>My posts</Button><Badge variant="outline" className="hidden items-center gap-2 sm:inline-flex"><Radio className="size-3 text-primary" aria-hidden="true" />Live feed</Badge></div>
      </div>

      <div className="flex flex-col gap-4" aria-label="News feed posts">
        {filter === "all" && <EmptyWelcomeMessage />}

        {isLoading && (
          <>
            <Card className="border-border/70">
              <CardContent className="flex flex-col gap-4 p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="flex flex-col gap-4 p-6">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/5" />
              </CardContent>
            </Card>
          </>
        )}

        {!isLoading && visiblePosts.map((post) => <FeedPost key={post.id} post={post} />)}

        {!isLoading && !isError && visiblePosts.length === 0 && (
          <Card className="border-dashed border-border/70 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="font-medium">Your circle is quiet for now.</p>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Start a workout, share a thought, or invite a friend to give the feed
                something to follow.
              </p>
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-none">
            <CardContent className="flex flex-col gap-2 p-6">
              <p className="font-medium">The feed could not load.</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Refresh the page and we&apos;ll try to pull your latest updates again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
