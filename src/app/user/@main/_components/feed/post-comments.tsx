"use client"

import { formatDistanceToNow } from "date-fns"
import { Loader2, MessageCircle, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { api, type RouterOutputs } from "@/trpc/react"

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number]
type Comment = FeedPostItem["commentPreview"][number]

export function PostComments({ post, full = false }: { post: FeedPostItem; full?: boolean }) {
  const utils = api.useUtils()
  const [content, setContent] = useState("")
  const commentsQuery = api.feed.getComments.useInfiniteQuery(
    { postId: post.id, limit: 20 },
    {
      enabled: full,
      getNextPageParam: (page) => page.nextCursor,
    },
  )
  const comments = full
    ? commentsQuery.data?.pages.flatMap((page) => page.items) ?? []
    : post.commentPreview
  const addComment = api.feed.addComment.useMutation({
    onSuccess: async () => {
      setContent("")
      await Promise.all([
        utils.feed.getLatestPosts.invalidate(),
        utils.feed.getPost.invalidate(post.id),
        utils.feed.getComments.invalidate({ postId: post.id, limit: 20 }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })

  const submit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    addComment.mutate({ postId: post.id, content: trimmed })
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="size-4" aria-hidden="true" />
        <span>{post.commentCount.toLocaleString()} comment{post.commentCount === 1 ? "" : "s"}</span>
      </div>

      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => <CommentPreview comment={comment} key={comment.id} />)}
          {!full && post.commentCount > post.commentPreview.length && (
            <Button asChild className="self-start px-0" size="sm" variant="link">
              <Link href={`/user/posts/${post.id}`}>
                View all {post.commentCount.toLocaleString()} comments
              </Link>
            </Button>
          )}
        </div>
      )}

      {full && commentsQuery.hasNextPage && (
        <Button
          className="self-start"
          disabled={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
          size="sm"
          type="button"
          variant="outline"
        >
          {commentsQuery.isFetchingNextPage && <Loader2 className="animate-spin" data-icon="inline-start" />}
          Load more comments
        </Button>
      )}

      <Separator />
      <Field>
        <FieldLabel className="sr-only" htmlFor={`comment-${post.id}`}>Add a comment</FieldLabel>
        <InputGroup>
          <InputGroupInput
            disabled={addComment.isPending}
            id={`comment-${post.id}`}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Add a comment..."
            value={content}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Send comment"
              disabled={addComment.isPending || !content.trim()}
              onClick={submit}
              size="icon-xs"
            >
              {addComment.isPending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Send data-icon="inline-start" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  )
}

function CommentPreview({ comment }: { comment: Comment }) {
  const authorName = comment.author.username ?? comment.author.name ?? "Gym Quest user"
  const authorImage = comment.author.uploadedImage ?? comment.author.image
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join("") || "GQ"

  return (
    <div className="flex items-start gap-2">
      <Link href={`/user/profile/${comment.author.id}`} aria-label={`View ${authorName}'s profile`}>
        <Avatar className="size-8">
          {authorImage && <AvatarImage alt={authorName} src={authorImage} />}
          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1 rounded-lg bg-muted p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link className="truncate text-sm font-medium hover:underline" href={`/user/profile/${comment.author.id}`}>
            {authorName}
          </Link>
          <time className="text-xs text-muted-foreground" dateTime={comment.createdAt.toISOString()}>
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
      </div>
    </div>
  )
}
