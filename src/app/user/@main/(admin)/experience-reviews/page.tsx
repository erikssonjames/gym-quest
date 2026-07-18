"use client"

import { format } from "date-fns"
import { Check, Loader2, ShieldAlert, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/trpc/react"

export default function ExperienceReviewsPage() {
  const utils = api.useUtils()
  const { data: reviews, isLoading } = api.experienceReviews.getPending.useQuery()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const resolveReview = api.experienceReviews.resolve.useMutation({
    onSuccess: async (result) => {
      await utils.experienceReviews.getPending.invalidate()
      toast.success(
        result.decision === "approved" ? "Workout XP approved" : "Workout XP rejected",
      )
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setActiveAction(null),
  })

  const decide = (reviewId: string, decision: "approved" | "rejected") => {
    setActiveAction(`${reviewId}:${decision}`)
    resolveReview.mutate({ reviewId, decision })
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="XP review queue"
      description="Inspect workouts caught by the plausibility gate before they can award XP, advance quests, or unlock training achievements."
    >
      <PageSection
        title="Pending workouts"
        description="Approve legitimate performances or reject entries that should not affect progression."
      >
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading review queue
            </CardContent>
          </Card>
        ) : reviews?.length ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card className="border-warning/40 bg-warning/5" key={review.id}>
                <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">
                        {review.workoutName ?? "Open workout"}
                      </CardTitle>
                      <Badge variant="warning">Review required</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.userName ?? review.userEmail} · {format(review.createdAt, "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <Badge className="w-fit text-sm" variant="secondary">
                    +{review.proposedExperience.toLocaleString()} XP proposed
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <ReviewMetric label="Sets" value={review.completedSetCount.toLocaleString()} />
                    <ReviewMetric label="Total volume" value={`${review.totalVolume.toLocaleString()} kg`} />
                    <ReviewMetric label="Max weight" value={`${review.maxWeight.toLocaleString()} kg`} />
                    <ReviewMetric label="Max reps" value={review.maxReps.toLocaleString()} />
                    <ReviewMetric label="Max set volume" value={`${review.maxSetVolume.toLocaleString()} kg`} />
                  </div>

                  <Alert className="border-warning/40 bg-background/70">
                    <ShieldAlert className="size-4 text-warning" />
                    <AlertTitle>Why this was flagged</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc space-y-1 pl-4">
                        {review.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      disabled={resolveReview.isPending}
                      onClick={() => decide(review.id, "rejected")}
                      variant="destructive"
                    >
                      {activeAction === `${review.id}:rejected`
                        ? <Loader2 className="animate-spin" />
                        : <X />}
                      Reject XP
                    </Button>
                    <Button
                      disabled={resolveReview.isPending}
                      onClick={() => decide(review.id, "approved")}
                    >
                      {activeAction === `${review.id}:approved`
                        ? <Loader2 className="animate-spin" />
                        : <Check />}
                      Approve and award
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="The queue is clear"
            description="No completed workouts are waiting for an XP decision."
          />
        )}
      </PageSection>
    </PageShell>
  )
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  )
}
