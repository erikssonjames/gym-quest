"use client"

import { format, formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api, type RouterOutputs } from "@/trpc/react"
import { EmojiReactionPicker } from "./emoji-reaction-picker"
import { PostActions } from "./post-actions"
import { PostComments } from "./post-comments"
import PostContainer from "./post-container"
import { StructuredPost } from "./structured-post"

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number]

export default function FeedPost({ post, full = false }: { post: FeedPostItem; full?: boolean }) {
  const utils = api.useUtils()
  const authorName = post.author.username ?? post.author.name ?? "Gym Quest user"
  const authorImage = post.author.uploadedImage ?? post.author.image
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join("") || "GQ"
  const reaction = api.feed.setReaction.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.feed.getLatestPosts.invalidate(),
        utils.feed.getPost.invalidate(post.id),
      ])
    },
    onError: (error) => toast.error(error.message),
  })
  const react = (emoji: string) => reaction.mutate({ postId: post.id, emoji })

  return (
    <PostContainer>
      <CardHeader className="flex-row items-start gap-3 p-5 pb-4">
        <Link href={`/user/profile/${post.author.id}`} aria-label={`View ${authorName}'s profile`}>
          <Avatar className="size-10">
            {authorImage ? <AvatarImage src={authorImage} alt={authorName} /> : null}
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate text-base">
              <Link href={`/user/profile/${post.author.id}`} className="hover:underline">
                {authorName}
              </Link>
            </CardTitle>
            {post.pinnedAt && <Badge variant="secondary">Pinned</Badge>}
          </div>
          <Link
            className="text-sm text-muted-foreground hover:underline"
            href={`/user/posts/${post.id}`}
            title={format(post.createdAt, "PPPP 'at' p")}
          >
            <time dateTime={post.createdAt.toISOString()}>
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </time>
          </Link>
        </div>
        <PostActions post={post} />
      </CardHeader>

      {(post.description || post.imageUrl || post.workout || post.quest) && (
        <CardContent className="flex flex-col gap-4 px-5 pb-5 pt-0">
          {post.description && <p className="whitespace-pre-wrap text-sm leading-7">{post.description}</p>}
          {post.imageUrl && (
            <Image
              alt={post.description ? `Picture shared with: ${post.description}` : `Training update from ${authorName}`}
              className="max-h-[40rem] h-auto w-full rounded-lg border object-contain"
              height={post.imageHeight ?? 1200}
              sizes="(max-width: 768px) 100vw, 720px"
              src={post.imageUrl}
              width={post.imageWidth ?? 1200}
            />
          )}
          <StructuredPost full={full} post={post} />
        </CardContent>
      )}

      <Separator />
      <CardFooter className="flex-col items-stretch gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.reactionGroups.map((group) => (
            <Button
              aria-label={`${group.emoji} reaction, ${group.count} total`}
              disabled={reaction.isPending}
              key={group.emoji}
              onClick={() => react(group.emoji)}
              size="sm"
              type="button"
              variant={post.viewerReaction === group.emoji ? "secondary" : "outline"}
            >
              <span aria-hidden="true">{group.emoji}</span>
              {group.count.toLocaleString()}
            </Button>
          ))}
          <EmojiReactionPicker
            disabled={reaction.isPending}
            onChange={react}
            value={post.viewerReaction}
          />
        </div>
        <PostComments full={full} post={post} />
      </CardFooter>
    </PostContainer>
  )
}
