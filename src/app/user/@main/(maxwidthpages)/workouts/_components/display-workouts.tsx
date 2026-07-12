"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Clock3,
  Dumbbell,
  Eye,
  Layers3,
  Loader2Icon,
  Pencil,
  RotateCcw,
  Search,
  Star,
  Trash,
} from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useExerciseName } from "@/hooks/use-exercise-name"
import { estimateWorkoutDurationMinutes } from "@/lib/workout-duration"
import type { WorkoutOutput } from "@/server/api/types/output"
import { api } from "@/trpc/react"
import EditWorkoutForm from "./edit-workout-form"

type WorkoutLibrary = "community" | "personal"
type WorkoutDuration = "all" | "short" | "medium" | "long"
type WorkoutSort = "featured" | "name-asc" | "duration-asc" | "sets-desc"
type WorkoutStatus = "all" | "saved" | "unsaved" | "public" | "private"

interface DisplayWorkoutsProps {
  workouts?: WorkoutOutput[]
  loading: boolean
  library?: WorkoutLibrary
}

function getWorkoutSetCount(workout: WorkoutOutput) {
  return workout.workoutSets.reduce(
    (count, group) => count + group.workoutSetCollections.reduce(
      (groupCount, collection) => groupCount + Math.max(collection.reps.length, collection.duration.length),
      0,
    ),
    0,
  )
}

function matchesDuration(duration: number, filter: WorkoutDuration) {
  if (filter === "short") return duration <= 20
  if (filter === "medium") return duration > 20 && duration <= 45
  if (filter === "long") return duration > 45
  return true
}

export default function DisplayWorkouts({
  workouts,
  loading,
  library = "personal",
}: DisplayWorkoutsProps) {
  const { getExerciseName } = useExerciseName()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [duration, setDuration] = useState<WorkoutDuration>("all")
  const [status, setStatus] = useState<WorkoutStatus>("all")
  const [sort, setSort] = useState<WorkoutSort>("featured")

  const categories = useMemo(() => (
    [...new Set((workouts ?? []).map((workout) => workout.category))]
      .sort((left, right) => left.localeCompare(right))
  ), [workouts])

  const workoutDetails = useMemo(() => (workouts ?? []).map((workout) => ({
    workout,
    estimatedMinutes: estimateWorkoutDurationMinutes(workout.workoutSets),
    setCount: getWorkoutSetCount(workout),
    exerciseNames: [...new Set(workout.workoutSets.flatMap((group) => (
      group.workoutSetCollections
        .map((collection) => getExerciseName(collection.exerciseId))
        .filter((name): name is string => Boolean(name))
    )))],
  })), [getExerciseName, workouts])

  const filteredWorkouts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return workoutDetails
      .filter(({ workout, estimatedMinutes, exerciseNames }) => {
        const matchesSearch = normalizedSearch.length === 0 || [
          workout.name,
          workout.description,
          workout.category,
          ...exerciseNames,
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
        const matchesCategory = category === "all" || workout.category === category
        const matchesTime = matchesDuration(estimatedMinutes, duration)
        const matchesStatus = status === "all"
          || (status === "saved" && workout.saved)
          || (status === "unsaved" && !workout.saved)
          || (status === "public" && workout.isPublic)
          || (status === "private" && !workout.isPublic)

        return matchesSearch && matchesCategory && matchesTime && matchesStatus
      })
      .sort((left, right) => {
        if (sort === "name-asc") return left.workout.name.localeCompare(right.workout.name)
        if (sort === "duration-asc") return left.estimatedMinutes - right.estimatedMinutes || left.workout.name.localeCompare(right.workout.name)
        if (sort === "sets-desc") return right.setCount - left.setCount || left.workout.name.localeCompare(right.workout.name)
        return Number(right.workout.saved) - Number(left.workout.saved)
      })
  }, [category, duration, search, sort, status, workoutDetails])

  const hasFilters = search.length > 0 || category !== "all" || duration !== "all" || status !== "all" || sort !== "featured"
  const resetFilters = () => {
    setSearch("")
    setCategory("all")
    setDuration("all")
    setStatus("all")
    setSort("featured")
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-1 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Find the right plan</CardTitle>
            <Badge variant="info">
              {filteredWorkouts.length} of {workouts?.length ?? 0} plans
            </Badge>
          </div>
          <CardDescription>Filter by focus, expected session length, or library status.</CardDescription>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-12">
          <InputGroup className="min-w-0 md:col-span-2 xl:col-span-3">
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            <InputGroupInput
              value={search}
              placeholder="Search plans or exercises"
              aria-label="Search workout plans"
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={duration} onValueChange={(value) => setDuration(value as WorkoutDuration)}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Filter by duration"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Any length</SelectItem>
                <SelectItem value="short">Up to 20 min</SelectItem>
                <SelectItem value="medium">20–45 min</SelectItem>
                <SelectItem value="long">45+ min</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => setStatus(value as WorkoutStatus)}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label={library === "community" ? "Filter by saved status" : "Filter by visibility"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">{library === "community" ? "All plans" : "Any visibility"}</SelectItem>
                {library === "community" ? (
                  <>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="unsaved">Not saved</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as WorkoutSort)}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Sort workout plans"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="featured">Saved first</SelectItem>
                <SelectItem value="name-asc">Name A–Z</SelectItem>
                <SelectItem value="duration-asc">Shortest first</SelectItem>
                <SelectItem value="sets-desc">Most sets</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button className="min-w-0 xl:col-span-1" variant="outline" size="icon" onClick={resetFilters} disabled={!hasFilters} aria-label="Reset workout filters">
            <RotateCcw data-icon="inline-start" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid w-full gap-4 lg:grid-cols-2">
        {loading && Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}

        {!loading && filteredWorkouts.length === 0 && (
          <Empty className="col-span-full border">
            <EmptyHeader>
              <EmptyMedia variant="icon">{hasFilters ? <Search /> : <Dumbbell />}</EmptyMedia>
              <EmptyTitle>{hasFilters ? "No plans match these filters" : "No workouts in this library"}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try another category or duration, search more broadly, or reset the filters."
                  : "Create a plan for yourself or browse public workouts to find a useful starting point."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>Reset filters</Button>
              ) : (
                <Button asChild><Link href="/user/workouts/manage/create">Create a workout</Link></Button>
              )}
            </EmptyContent>
          </Empty>
        )}

        {!loading && filteredWorkouts.map((details) => (
          <WorkoutCard key={details.workout.id} {...details} />
        ))}
      </div>
    </div>
  )
}

function WorkoutCard({
  workout,
  estimatedMinutes,
  setCount,
  exerciseNames,
}: {
  workout: WorkoutOutput
  estimatedMinutes: number
  setCount: number
  exerciseNames: string[]
}) {
  const utils = api.useUtils()
  const { data } = useSession()
  const isOwner = data?.user.id === workout.userId
  const { mutate: toggleSaved, isPending } = api.workout.saveWorkoutToFavourites.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.workout.getWorkouts.invalidate(),
        utils.workout.getPublicWorkouts.invalidate(),
      ])
      toast.success(workout.saved ? "Workout removed from saved plans." : "Workout saved to your plans.")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Card className="flex h-full flex-col transition-colors hover:border-info/40">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <Badge variant="warning">{workout.category}</Badge>
            <Badge variant={workout.isPublic ? "info" : "secondary"}>
              {workout.isPublic ? "Public" : "Private"}
            </Badge>
            {workout.saved && <Badge variant="success">Saved</Badge>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-xl leading-snug">{workout.name}</CardTitle>
          <CardDescription className="line-clamp-2 leading-6">{workout.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="grid grid-cols-3 gap-2">
          <PlanMetric icon={<Clock3 />} label="Estimated" value={estimatedMinutes > 0 ? `≈${estimatedMinutes} min` : "Open"} />
          <PlanMetric icon={<Layers3 />} label="Sets" value={String(setCount)} />
          <PlanMetric icon={<Dumbbell />} label="Exercises" value={String(exerciseNames.length)} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Included movements</p>
          <div className="flex flex-wrap gap-1.5">
            {exerciseNames.slice(0, 6).map((name) => <Badge key={name} variant="outline">{name}</Badge>)}
            {exerciseNames.length > 6 && <Badge variant="secondary">+{exerciseNames.length - 6} more</Badge>}
            {exerciseNames.length === 0 && <span className="text-sm text-muted-foreground">Open workout plan</span>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2 border-t pt-4">
        <Button asChild variant="outline">
          <Link href={`/user/workouts/browse/${workout.id}`}>
            <Eye data-icon="inline-start" />
            View plan
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <EditWorkout workout={workout}>
                <Button size="icon" variant="outline" aria-label={`Edit ${workout.name}`}><Pencil data-icon="inline-start" /></Button>
              </EditWorkout>
              <ConfirmDeleteWorkout id={workout.id} name={workout.name}>
                <Button size="icon" variant="destructive" aria-label={`Archive ${workout.name}`}><Trash data-icon="inline-start" /></Button>
              </ConfirmDeleteWorkout>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => toggleSaved({ workoutId: workout.id })}
              disabled={isPending}
              variant={workout.saved ? "secondary" : "default"}
            >
              {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <Star data-icon="inline-start" />}
              {workout.saved ? "Remove saved" : "Save plan"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

function PlanMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function ConfirmDeleteWorkout({ id, name, children }: { id: string; name: string; children: ReactNode }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.workout.deleteWorkout.useMutation({
    onSuccess: () => utils.workout.getWorkouts.invalidate(),
  })
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      await mutateAsync({ id })
      toast.success("Workout archived.")
      setOpen(false)
    } catch {
      toast.error("Failed to archive workout.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archive {name}?</DialogTitle>
          <DialogDescription>
            The plan will leave your library, while completed workout history stays intact.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isPending}>
            Archive
            {isPending && <Loader2Icon data-icon="inline-end" className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditWorkout({ workout, children }: { workout: WorkoutOutput; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="mx-0 flex max-h-dvh flex-col md:mx-10 md:h-[calc(100vh-4rem)] md:max-w-7xl md:px-20 md:py-10">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit workout</DialogTitle>
          <DialogDescription>Update the plan structure, exercises, and training targets.</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <EditWorkoutForm workout={workout} close={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
