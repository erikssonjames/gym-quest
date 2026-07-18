"use client"

import { Check, Loader2, ShieldAlert, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/trpc/react"

export default function FeedModerationPage() {
  const utils = api.useUtils()
  const { data: groups, isLoading } = api.feed.getPendingReports.useQuery()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const resolve = api.feed.resolveReports.useMutation({
    onSuccess: async ({ decision }) => {
      await utils.feed.getPendingReports.invalidate()
      toast.success(decision === "removed" ? "Post removed from the feed." : "Reports dismissed; the post stays live.")
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setActiveAction(null),
  })

  const decide = (postId: string, decision: "kept" | "removed") => {
    setActiveAction(`${postId}:${decision}`)
    resolve.mutate({ postId, decision })
  }

  return (
    <PageShell
      description="Review reports from the friends feed and decide whether posts remain visible."
      eyebrow="Admin"
      title="Feed moderation"
    >
      <PageSection
        description="Reports are grouped by post so one decision resolves the current queue for that post."
        title="Pending reports"
      >
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Loading report queue
            </CardContent>
          </Card>
        ) : groups?.length ? (
          <div className="flex flex-col gap-4">
            {groups.map(({ post, reports }) => {
              const authorName = post.author.username ?? post.author.name ?? "Gym Quest user"
              return (
                <Card className="border-warning/40" key={post.id}>
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">Post by {authorName}</CardTitle>
                        <CardDescription>{format(post.createdAt, "MMM d, yyyy 'at' HH:mm")}</CardDescription>
                      </div>
                      <Badge variant="warning">
                        <ShieldAlert />
                        {reports.length} report{reports.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Post preview</p>
                      {post.description && <p className="mt-2 whitespace-pre-wrap text-sm">{post.description}</p>}
                      {post.imageUrl && (
                        <Image
                          alt={`Reported picture from ${authorName}`}
                          className="mt-3 max-h-80 h-auto w-full rounded-lg border bg-background object-contain"
                          height={post.imageHeight ?? 800}
                          sizes="(max-width: 768px) 100vw, 720px"
                          src={post.imageUrl}
                          width={post.imageWidth ?? 1200}
                        />
                      )}
                      {post.workoutShare && (
                        <div className="mt-3 rounded-lg border bg-background p-3">
                          <p className="font-medium">{post.workoutShare.snapshot.workoutName}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.workoutShare.snapshot.completedSetCount} sets · {post.workoutShare.snapshot.totalVolume.toLocaleString()} kg · +{post.workoutShare.snapshot.experienceAwarded.toLocaleString()} XP
                          </p>
                        </div>
                      )}
                      {post.questShare && (
                        <div className="mt-3 rounded-lg border bg-background p-3">
                          <p className="font-medium">{post.questShare.snapshot.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.questShare.snapshot.cadence} quest · +{post.questShare.snapshot.experienceAwarded.toLocaleString()} XP
                          </p>
                        </div>
                      )}
                      {!post.description && !post.imageUrl && !post.workoutShare && !post.questShare && (
                        <p className="mt-2 text-sm text-muted-foreground">No post content is available.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {reports.map((report) => {
                        const reporterName = report.reporter.username ?? report.reporter.name ?? "Gym Quest user"
                        return (
                          <div className="rounded-lg border p-3" key={report.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{reporterName}</p>
                              <Badge variant="secondary">{report.reason}</Badge>
                            </div>
                            {report.details && <p className="mt-2 text-sm text-muted-foreground">{report.details}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button
                      disabled={resolve.isPending}
                      onClick={() => decide(post.id, "kept")}
                      type="button"
                      variant="outline"
                    >
                      {activeAction === `${post.id}:kept` ? (
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                      ) : (
                        <Check data-icon="inline-start" />
                      )}
                      Keep post
                    </Button>
                    <Button
                      disabled={resolve.isPending}
                      onClick={() => decide(post.id, "removed")}
                      type="button"
                      variant="destructive"
                    >
                      {activeAction === `${post.id}:removed` ? (
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                      ) : (
                        <Trash2 data-icon="inline-start" />
                      )}
                      Remove post
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState description="No feed posts are waiting for a moderation decision." title="The report queue is clear" />
        )}
      </PageSection>
    </PageShell>
  )
}
