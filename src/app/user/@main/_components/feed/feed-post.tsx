"use client"

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RouterOutputs } from "@/trpc/react";
import PostContainer from "./post-container";

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number];

interface FeedPostProps {
  post: FeedPostItem
}

export default function FeedPost ({ post }: FeedPostProps) {
  const authorName = post.author.username ?? post.author.name ?? "Gym Quest user";
  const authorImage = post.author.uploadedImage ?? post.author.image;
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join("")
    || "GQ";

  return (
    <PostContainer>
      <CardHeader className="flex-row items-start gap-3 p-5 pb-4">
        <Link href={`/user/profile/${post.author.id}`} aria-label={`View ${authorName}'s profile`}>
          <Avatar className="size-10">
            {authorImage ? <AvatarImage src={authorImage} alt={authorName} /> : null}
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <CardTitle className="truncate text-base">
            <Link href={`/user/profile/${post.author.id}`} className="hover:underline">
              {authorName}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="whitespace-pre-wrap text-sm leading-7">{post.content}</p>
      </CardContent>
    </PostContainer>
  )
}
