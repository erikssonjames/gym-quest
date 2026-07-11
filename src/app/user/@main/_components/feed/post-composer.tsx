"use client"

import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import PostContainer from "./post-container";

const MAX_POST_LENGTH = 1000;

export default function PostComposer () {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const [content, setContent] = useState("");

  const displayName = session?.user.name ?? session?.user.email ?? "You";
  const initials = useMemo(() => {
    const nameParts = displayName.split(" ").filter(Boolean);
    return (nameParts[0]?.at(0) ?? "Y") + (nameParts[1]?.at(0) ?? "");
  }, [displayName]);

  const trimmedContent = content.trim();
  const remainingCharacters = MAX_POST_LENGTH - content.length;
  const showCharacterCount = content.length > 0;

  const { mutate, isPending } = api.feed.createPost.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.feed.getLatestPosts.invalidate();
      toast.success("Post added to the feed.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <PostContainer className="border-primary/20 bg-card/95 shadow-sm">
      <CardHeader className="gap-2 p-5 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Share your progress</CardTitle>
            <CardDescription>Give your training circle something to cheer for.</CardDescription>
          </div>
          <Badge variant="secondary">New post</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-5">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!trimmedContent) return;
            mutate({ content: trimmedContent });
          }}
        >
          <div className="flex items-start gap-3">
            <Avatar className="size-10">
              {session?.user.image ? <AvatarImage src={session.user.image} alt={displayName} /> : null}
              <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">Post to news feed</p>
              </div>
              <div
                className={cn(
                  "rounded-md border bg-background transition-colors",
                  trimmedContent ? "border-primary/40" : "border-input"
                )}
              >
                <Textarea
                  aria-label="Post content"
                  className="min-h-[92px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  maxLength={MAX_POST_LENGTH}
                  placeholder="Share a training update, progress win, or question..."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {showCharacterCount ? `${remainingCharacters} characters left` : "What is new in your training today?"}
            </p>
            <Button className="min-w-24" disabled={isPending || !trimmedContent} type="submit">
              {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Send data-icon="inline-start" />}
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </PostContainer>
  )
}
