"use client"

import { ExternalLink, Loader2, Share2 } from "lucide-react"
import Link from "next/link"

import { SharePostDialog } from "@/app/user/@main/_components/feed/share-post-dialog"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"

export function WorkoutShareAction({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = api.feed.getWorkoutShareStatus.useQuery(sessionId)

  if (isLoading) {
    return (
      <Button disabled type="button">
        <Loader2 className="animate-spin" data-icon="inline-start" />
        Checking share status
      </Button>
    )
  }
  if (data?.status === "shared" && data.postId) {
    return (
      <Button asChild>
        <Link href={`/user/posts/${data.postId}`}>
          <ExternalLink data-icon="inline-start" />
          View shared post
        </Link>
      </Button>
    )
  }
  if (data?.status === "pending") {
    return <Button disabled type="button">Share available after XP review</Button>
  }
  if (data?.status === "rejected") {
    return <Button disabled type="button">This workout cannot be shared</Button>
  }
  if (data?.status !== "available") return null

  return (
    <SharePostDialog
      description="Add an optional caption or picture. Your workout metrics, XP, best set, and new records will be included automatically."
      source={{ kind: "workout", sessionId }}
      title="Share workout completion"
      trigger={(
        <Button type="button">
          <Share2 data-icon="inline-start" />
          Share workout
        </Button>
      )}
    />
  )
}
