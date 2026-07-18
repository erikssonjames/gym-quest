"use client"

import { Award, Clock3, Dumbbell, Gauge, Repeat2, Sparkles, Trophy, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RouterOutputs } from "@/trpc/react"

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number]

export function StructuredPost({ post, full = false }: { post: FeedPostItem; full?: boolean }) {
  if (post.workout) return <WorkoutShare snapshot={post.workout} full={full} />
  if (post.quest) return <QuestShare snapshot={post.quest} />
  return null
}

function WorkoutShare({
  snapshot,
  full,
}: {
  snapshot: NonNullable<FeedPostItem["workout"]>
  full: boolean
}) {
  const records = full ? snapshot.records : snapshot.records.slice(0, 3)
  const leveledUp = snapshot.afterLevel > snapshot.beforeLevel

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-warning/10 to-success/15 shadow-md">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Dumbbell className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <CardDescription>Workout complete</CardDescription>
              <CardTitle className="text-xl">{snapshot.workoutName}</CardTitle>
            </div>
          </div>
          {leveledUp && (
            <Badge variant="warning">
              <Trophy />
              Level {snapshot.afterLevel}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 py-2 text-primary">
          <Zap className="size-7 fill-current" aria-hidden="true" />
          <p className="text-4xl font-black tabular-nums">
            +{snapshot.experienceAwarded.toLocaleString()} <span className="text-xl">XP</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ShareMetric icon={Clock3} label="Duration" value={formatDuration(snapshot.durationSeconds)} />
          <ShareMetric icon={Dumbbell} label="Exercises" value={snapshot.exerciseCount.toLocaleString()} />
          <ShareMetric icon={Repeat2} label="Sets" value={snapshot.completedSetCount.toLocaleString()} />
          <ShareMetric icon={Sparkles} label="Reps" value={snapshot.totalReps.toLocaleString()} />
          <ShareMetric icon={Gauge} label="Volume" value={`${snapshot.totalVolume.toLocaleString()} kg`} />
          <ShareMetric
            icon={Award}
            label="Records"
            value={snapshot.records.length.toLocaleString()}
          />
        </div>

        {snapshot.bestSet && (
          <div className="rounded-lg border bg-background/75 p-3">
            <p className="text-xs text-muted-foreground">Best set</p>
            <p className="mt-1 font-semibold">
              {snapshot.bestSet.exerciseName} · {snapshot.bestSet.weight} kg × {snapshot.bestSet.reps}
            </p>
          </div>
        )}

        {records.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New personal records</p>
            {records.map((record) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/75 p-3" key={`${record.exerciseId}:${record.metric}`}>
                <div>
                  <p className="font-medium">{record.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.metric === "weight" ? "Heaviest weight" : "Highest set volume"}
                  </p>
                </div>
                <Badge variant="success">
                  {record.metric === "weight" ? `${record.value} kg` : `${record.value.toLocaleString()} kg`}
                </Badge>
              </div>
            ))}
            {!full && snapshot.records.length > records.length && (
              <p className="text-xs text-muted-foreground">+{snapshot.records.length - records.length} more on the full post</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function QuestShare({ snapshot }: { snapshot: NonNullable<FeedPostItem["quest"]> }) {
  return (
    <Card className="border-warning/40 bg-gradient-to-br from-warning/15 via-background to-primary/10 shadow-md">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <Trophy className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <CardDescription>{capitalize(snapshot.cadence)} quest complete</CardDescription>
            <CardTitle className="text-xl">{snapshot.title}</CardTitle>
          </div>
        </div>
        <Badge className="w-fit" variant="warning">+{snapshot.experienceAwarded.toLocaleString()} XP</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Objective cleared: {snapshot.target.toLocaleString()} {snapshot.unit}.
        </p>
      </CardContent>
    </Card>
  )
}

function ShareMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-background/75 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
