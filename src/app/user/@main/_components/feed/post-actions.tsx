"use client"

import { Ban, Flag, Link2, Loader2, MoreHorizontal, Pin, PinOff } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api, type RouterOutputs } from "@/trpc/react"

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number]
type ReportReason = "spam" | "harassment" | "hate-or-abuse" | "unsafe-or-misleading" | "other"

const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "hate-or-abuse", label: "Hate or abuse" },
  { value: "unsafe-or-misleading", label: "Unsafe or misleading" },
  { value: "other", label: "Other" },
]

export function PostActions({ post }: { post: FeedPostItem }) {
  const { data: session } = useSession()
  const router = useRouter()
  const utils = api.useUtils()
  const [reportOpen, setReportOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>("spam")
  const [details, setDetails] = useState("")
  const isAuthor = session?.user.id === post.userId
  const isAdmin = session?.user.role === "admin" || session?.user.role === "superAdmin"
  const authorName = post.author.username ?? post.author.name ?? "this user"
  const report = api.feed.reportPost.useMutation({
    onSuccess: async () => {
      setReportOpen(false)
      await utils.feed.getLatestPosts.invalidate()
      toast.success("Post reported and hidden.")
      router.push("/user")
    },
    onError: (error) => toast.error(error.message),
  })
  const block = api.user.blockUser.useMutation({
    onSuccess: async () => {
      setBlockOpen(false)
      await Promise.all([
        utils.feed.getLatestPosts.invalidate(),
        utils.user.getFriends.invalidate(),
        utils.user.getBlockedUsers.invalidate(),
      ])
      toast.success(`${authorName} has been blocked.`)
      router.push("/user")
    },
    onError: (error) => toast.error(error.message),
  })
  const pin = api.feed.setPinned.useMutation({
    onSuccess: async ({ pinned }) => {
      await Promise.all([
        utils.feed.getLatestPosts.invalidate(),
        utils.feed.getPost.invalidate(post.id),
      ])
      toast.success(pinned ? "Post pinned for the community." : "Post unpinned.")
    },
    onError: (error) => toast.error(error.message),
  })

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/user/posts/${post.id}`
      await navigator.clipboard.writeText(url)
      toast.success("Post link copied.")
    } catch {
      toast.error("Could not copy the post link.")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Post controls" size="icon" type="button" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void copyLink()}>
              <Link2 />
              Copy post link
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {!isAuthor && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setReportOpen(true)}>
                  <Flag />
                  Report post
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setBlockOpen(true)}>
                  <Ban />
                  Block {authorName}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={pin.isPending}
                  onSelect={() => pin.mutate({ postId: post.id, pinned: !post.pinnedAt })}
                >
                  {post.pinnedAt ? <PinOff /> : <Pin />}
                  {post.pinnedAt ? "Unpin community post" : "Pin for community"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this post</DialogTitle>
            <DialogDescription>
              The post will be hidden from your feed immediately and sent to the moderation queue.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Reason</FieldLabel>
              <Select onValueChange={(value) => setReason(value as ReportReason)} value={reason}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {REPORT_REASONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`report-details-${post.id}`}>Details</FieldLabel>
              <Textarea
                id={`report-details-${post.id}`}
                maxLength={500}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Optional context for the moderation team"
                value={details}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button disabled={report.isPending} onClick={() => setReportOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={report.isPending}
              onClick={() => report.mutate({ postId: post.id, reason, details: details.trim() || undefined })}
              type="button"
              variant="destructive"
            >
              {report.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Report and hide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {authorName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your friendship and pending requests will be removed. You will no longer see each other&apos;s profiles, posts, comments, or reactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={block.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={block.isPending}
              onClick={() => block.mutate(post.userId)}
            >
              Block user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
