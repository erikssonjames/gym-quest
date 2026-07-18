"use client"

import { Loader2, Share2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/trpc/react"
import { PostImageField, type FeedImageInput } from "./post-image-field"

type ShareSource =
  | { kind: "workout"; sessionId: string }
  | { kind: "quest"; questClaimId: string }

export function SharePostDialog({
  source,
  title,
  description,
  trigger,
  onShared,
}: {
  source: ShareSource
  title: string
  description: string
  trigger?: ReactNode
  onShared?: (postId: string) => void
}) {
  const utils = api.useUtils()
  const [open, setOpen] = useState(false)
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<FeedImageInput | null>(null)
  const workoutShare = api.feed.createWorkoutShare.useMutation()
  const questShare = api.feed.createQuestShare.useMutation()
  const isPending = workoutShare.isPending || questShare.isPending

  const share = async () => {
    try {
      const fields = {
        description: caption.trim() || undefined,
        image: image ?? undefined,
      }
      const result = source.kind === "workout"
        ? await workoutShare.mutateAsync({ ...fields, sessionId: source.sessionId })
        : await questShare.mutateAsync({ ...fields, questClaimId: source.questClaimId })

      await Promise.all([
        utils.feed.getLatestPosts.invalidate(),
        utils.feed.getMyQuestShares.invalidate(),
        source.kind === "workout"
          ? utils.feed.getWorkoutShareStatus.invalidate(source.sessionId)
          : Promise.resolve(),
      ])
      setOpen(false)
      setCaption("")
      setImage(null)
      toast.success("Shared to your friends feed.")
      onShared?.(result.postId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not share this update.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button">
            <Share2 data-icon="inline-start" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`share-caption-${source.kind}`}>Caption</FieldLabel>
            <Textarea
              disabled={isPending}
              id={`share-caption-${source.kind}`}
              maxLength={1000}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Add an optional note for your friends..."
              value={caption}
            />
          </Field>
          <PostImageField disabled={isPending} image={image} onChange={setImage} />
        </FieldGroup>
        <DialogFooter>
          <Button disabled={isPending} onClick={() => setOpen(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isPending} onClick={() => void share()} type="button">
            {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Share2 data-icon="inline-start" />}
            Share to feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
