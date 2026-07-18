"use client"

import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import FeedPost from "@/app/user/@main/_components/feed/feed-post"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const { data: post, isLoading, isError } = api.feed.getPost.useQuery(postId)

  return (
    <div className="flex w-full flex-col gap-4 pb-10">
      <Button asChild className="self-start" variant="ghost">
        <Link href="/user">
          <ArrowLeft data-icon="inline-start" />
          Back to feed
        </Link>
      </Button>

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Post unavailable</AlertTitle>
          <AlertDescription>
            This post may have been removed, hidden, or shared outside your friends circle.
          </AlertDescription>
        </Alert>
      )}

      {post && <FeedPost full post={post} />}
    </div>
  )
}
