"use client"

import { useMemo, useState } from "react";
import { ChevronDown, Loader2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import PostContainer from "./post-container";
import { PostImageField, type FeedImageInput } from "./post-image-field";

const MAX_POST_LENGTH = 1000;

export default function PostComposer () {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<FeedImageInput | null>(null);
  const [open, setOpen] = useState(false);

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
      setImage(null);
      setOpen(false);
      void utils.feed.getLatestPosts.invalidate();
      toast.success("Post added to the feed.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <PostContainer className="shadow-sm">
        <CardHeader className="p-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-2 py-2">
              <Avatar className="size-9">
                {session?.user.image ? <AvatarImage src={session.user.image} alt={displayName} /> : null}
                <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
                Share a progress update...
              </span>
              <ChevronDown
                data-icon="inline-end"
                aria-hidden="true"
                className={cn("transition-transform", open && "rotate-180")}
              />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="px-5 pb-5 pt-1">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!trimmedContent && !image) return;
                mutate({
                  description: trimmedContent || undefined,
                  image: image ?? undefined,
                });
              }}
            >
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel htmlFor="feed-post-content" className="sr-only">Post content</FieldLabel>
                  <Textarea
                    id="feed-post-content"
                    className="min-h-24 resize-none"
                    maxLength={MAX_POST_LENGTH}
                    placeholder="What changed in your training today?"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    autoFocus
                  />
                </Field>
                <PostImageField disabled={isPending} image={image} onChange={setImage} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {showCharacterCount ? `${remainingCharacters} characters left` : "Visible to your training circle."}
                  </p>
                  <Button disabled={isPending || (!trimmedContent && !image)} type="submit">
                    {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Send data-icon="inline-start" />}
                    Post
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </CollapsibleContent>
      </PostContainer>
    </Collapsible>
  )
}
