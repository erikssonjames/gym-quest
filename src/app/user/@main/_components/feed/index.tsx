"use client"

import { AlertCircle, Loader2, Users } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/trpc/react"
import EmptyWelcomeMessage from "./empty-welcome-message"
import FeedPost from "./feed-post"
import PostComposer from "./post-composer"

type FeedScope = "community" | "mine"

export default function Feed() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter: FeedScope = searchParams.get("feed") === "mine" ? "mine" : "community"
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = api.feed.getLatestPosts.useInfiniteQuery(
    { limit: 10, scope: filter },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  const posts = data?.pages.flatMap((page) => page.items) ?? []

  const setFilter = (value: string) => {
    if (value !== "community" && value !== "mine") return

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    if (value === "community") {
      nextSearchParams.delete("feed")
    } else {
      nextSearchParams.set("feed", value)
    }

    const query = nextSearchParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-12">
      <PostComposer />

      <section className="flex flex-col gap-3" aria-labelledby="feed-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 id="feed-heading" className="text-xl font-semibold tracking-tight">Training feed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Follow the latest momentum from your GymQuest community.
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={filter}
            onValueChange={setFilter}
            aria-label="Choose feed view"
            className="w-full sm:w-auto"
          >
            <ToggleGroupItem value="community" className="flex-1 sm:flex-none">
              Community
            </ToggleGroupItem>
            <ToggleGroupItem value="mine" className="flex-1 sm:flex-none">
              My posts
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-4" aria-label="News feed posts" aria-busy={isLoading || isFetchingNextPage}>
          {isLoading && <FeedSkeleton />}

          {!isLoading && !isError && filter === "community" && posts.length === 0 && (
            <EmptyWelcomeMessage />
          )}

          {!isLoading && posts.map((post) => <FeedPost key={post.id} post={post} />)}

          {!isLoading && !isError && filter === "mine" && posts.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Users /></EmptyMedia>
                <EmptyTitle>You have not posted yet</EmptyTitle>
                <EmptyDescription>
                  Share a training update above and it will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>The feed could not load</AlertTitle>
              <AlertDescription>
                Refresh the page and we&apos;ll try to pull your latest updates again.
              </AlertDescription>
            </Alert>
          )}

          {hasNextPage && !isError && (
            <Button
              type="button"
              variant="outline"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
              className="self-center"
            >
              {isFetchingNextPage && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isFetchingNextPage ? "Loading" : "Load more"}
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <>
      {[0, 1].map((item) => (
        <Card key={item}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}
