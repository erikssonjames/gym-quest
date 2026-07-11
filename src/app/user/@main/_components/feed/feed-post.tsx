"use client"

import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RouterOutputs } from "@/trpc/react";
import PostContainer from "./post-container";

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"][number];

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
    <PostContainer className="border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 p-6">
        <div className="flex min-w-0 gap-3">
          <Avatar className="size-10">
            {authorImage ? <AvatarImage src={authorImage} alt={authorName} /> : null}
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{authorName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Badge variant="outline">Update</Badge>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="whitespace-pre-wrap text-sm leading-7">{post.content}</p>
      </CardContent>
    </PostContainer>
  )
}
