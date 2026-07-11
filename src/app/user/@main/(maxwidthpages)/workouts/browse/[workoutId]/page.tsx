import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock3, Dumbbell, Layers3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/server"
import StartWorkoutButton from "./_components/start-workout-button"

export default async function WorkoutPage ({ params }: { params: Promise<{ workoutId: string }> }) {
  let workout
  try {
    workout = await api.workout.getWorkoutById({ id: (await params).workoutId })
  } catch {
    notFound()
  }

  if (!workout) notFound()

  const setCount = workout.workoutSets.length
  const exerciseCount = workout.workoutSets.reduce((count, set) => count + set.workoutSetCollections.length, 0)
  const setValues = workout.workoutSets.flatMap((set) => set.workoutSetCollections.flatMap((collection) => collection.reps))
  const plannedSets = setValues.length

  return (
    <PageShell
      eyebrow={workout.category || "Workout plan"}
      title={workout.name}
      description={workout.description || "A structured workout ready for your next session."}
      actions={<><Button asChild variant="ghost"><Link href="/user/workouts/browse"><ArrowLeft data-icon="inline-start" />Back to browse</Link></Button><StartWorkoutButton workoutId={workout.id} /></>}
    >
      <div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-3 p-4"><Dumbbell className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Exercises</p><p className="text-xl font-semibold">{exerciseCount}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Layers3 className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Plan groups</p><p className="text-xl font-semibold">{setCount}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Clock3 className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Planned sets</p><p className="text-xl font-semibold">{plannedSets}</p></div></CardContent></Card></div>
      <PageSection title="Workout plan" description="Review the structure before you start."><div className="space-y-3">{workout.workoutSets.sort((a, b) => a.order - b.order).map((set, index) => <Card key={set.id}><CardHeader className="flex-row items-center justify-between gap-3 border-b py-4"><CardTitle className="text-base">Group {index + 1}</CardTitle><Badge variant="outline">{set.workoutSetCollections.length} exercise{set.workoutSetCollections.length === 1 ? "" : "s"}</Badge></CardHeader><CardContent className="divide-y p-0">{set.workoutSetCollections.sort((a, b) => a.order - b.order).map((collection) => <div key={collection.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{collection.exercise?.name ?? "Exercise"}</p><p className="text-sm text-muted-foreground">{collection.reps.length} set{collection.reps.length === 1 ? "" : "s"} · {collection.restTime.at(0) ?? 0}s rest</p></div><div className="flex flex-wrap gap-2 text-xs text-muted-foreground">{collection.reps.map((reps, repsIndex) => <Badge key={`${collection.id}-${repsIndex}`} variant="secondary">{reps} reps</Badge>)}</div></div>)}</CardContent></Card>)}</div></PageSection>
    </PageShell>
  )
}
