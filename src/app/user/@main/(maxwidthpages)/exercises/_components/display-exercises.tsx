"use client"

import { useSession } from "next-auth/react"
import { Dumbbell, Loader2Icon, Pencil, RotateCcw, Search, Trash } from "lucide-react"
import { memo, type ReactNode, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Muscle } from "@/server/db/schema/body"
import type { Exercise } from "@/server/db/schema/exercise"
import { api } from "@/trpc/react"
import EditExerciseForm from "./edit-exercise-form"

type ExerciseScope = "all" | "mine" | "public"
type ExerciseSort = "name-asc" | "name-desc" | "muscles-desc"
type PageToken = number | "ellipsis-start" | "ellipsis-end"

const EXERCISES_PER_PAGE = 24

function getPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis-end", totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-start", totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis-start", currentPage, "ellipsis-end", totalPages]
}

function DisplayExercises() {
  const { data: exercises, isPending, isError } = api.exercise.getExercises.useQuery()
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [muscleId, setMuscleId] = useState("all")
  const [scope, setScope] = useState<ExerciseScope>("all")
  const [sort, setSort] = useState<ExerciseSort>("name-asc")
  const [page, setPage] = useState(1)

  const muscles = useMemo(() => {
    const byId = new Map<string, Muscle>()
    exercises?.forEach((exercise) => {
      exercise.muscles.forEach((muscle) => byId.set(muscle.id, muscle))
    })
    return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name))
  }, [exercises])

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return (exercises ?? [])
      .filter((exercise) => {
        const matchesSearch = normalizedSearch.length === 0 || [
          exercise.name,
          exercise.description,
          ...exercise.muscles.map((muscle) => muscle.name),
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
        const matchesMuscle = muscleId === "all" || exercise.muscles.some((muscle) => muscle.id === muscleId)
        const matchesScope = scope === "all"
          || (scope === "mine" && exercise.userId === session?.user.id)
          || (scope === "public" && exercise.isPublic)

        return matchesSearch && matchesMuscle && matchesScope
      })
      .sort((left, right) => {
        if (sort === "name-desc") return right.name.localeCompare(left.name)
        if (sort === "muscles-desc") return right.muscles.length - left.muscles.length || left.name.localeCompare(right.name)
        return left.name.localeCompare(right.name)
      })
  }, [exercises, muscleId, scope, search, session?.user.id, sort])

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageTokens = getPageTokens(currentPage, totalPages)
  const pageStart = (currentPage - 1) * EXERCISES_PER_PAGE
  const visibleExercises = filteredExercises.slice(pageStart, pageStart + EXERCISES_PER_PAGE)
  const firstVisibleExercise = filteredExercises.length === 0 ? 0 : pageStart + 1
  const lastVisibleExercise = Math.min(pageStart + EXERCISES_PER_PAGE, filteredExercises.length)

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const hasFilters = search.length > 0 || muscleId !== "all" || scope !== "all" || sort !== "name-asc"
  const resetFilters = () => {
    setSearch("")
    setMuscleId("all")
    setScope("all")
    setSort("name-asc")
    setPage(1)
  }

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-1 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Filter the library</CardTitle>
            <Badge variant="info">
              {filteredExercises.length} of {exercises?.length ?? 0} exercises
            </Badge>
          </div>
          <CardDescription>Search broadly, then narrow by muscle or ownership.</CardDescription>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-12">
          <InputGroup className="min-w-0 md:col-span-2 xl:col-span-4">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              placeholder="Search exercises or muscles"
              aria-label="Search exercises"
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </InputGroup>

          <Select value={muscleId} onValueChange={(value) => {
            setMuscleId(value)
            setPage(1)
          }}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Filter by muscle">
              <SelectValue placeholder="All muscles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All muscles</SelectItem>
                {muscles.map((muscle) => (
                  <SelectItem key={muscle.id} value={muscle.id}>{muscle.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={scope} onValueChange={(value) => {
            setScope(value as ExerciseScope)
            setPage(1)
          }}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Filter by visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All exercises</SelectItem>
                <SelectItem value="mine">Created by me</SelectItem>
                <SelectItem value="public">Public exercises</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => {
            setSort(value as ExerciseSort)
            setPage(1)
          }}>
            <SelectTrigger className="min-w-0 xl:col-span-2" aria-label="Sort exercises">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="name-asc">Name A–Z</SelectItem>
                <SelectItem value="name-desc">Name Z–A</SelectItem>
                <SelectItem value="muscles-desc">Most muscles</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button className="min-w-0 xl:col-span-2" variant="outline" onClick={resetFilters} disabled={!hasFilters}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </CardContent>
      </Card>

      <div id="exercise-results" className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isPending && Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}

        {isError && (
          <Empty className="col-span-full border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Dumbbell /></EmptyMedia>
              <EmptyTitle>Exercises could not be loaded</EmptyTitle>
              <EmptyDescription>Refresh the page to reconnect to your movement library.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {visibleExercises.map((item) => {
          const { muscles: exerciseMuscles, requestToBePublic, ...exercise } = item
          return (
            <ExerciseCard
              key={item.id}
              muscles={exerciseMuscles}
              exercise={exercise}
              requestToBePublic={requestToBePublic !== null && !item.isPublic}
              isOwner={item.userId === session?.user.id}
            />
          )
        })}

        {!isPending && !isError && filteredExercises.length === 0 && (
          <Empty className="col-span-full border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Search /></EmptyMedia>
              <EmptyTitle>{hasFilters ? "No exercises match these filters" : "No exercises added yet"}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try a broader search, another muscle group, or reset the filters."
                  : "Create your first exercise to make workout planning faster."}
              </EmptyDescription>
            </EmptyHeader>
            {hasFilters && (
              <EmptyContent>
                <Button variant="outline" onClick={resetFilters}>Reset filters</Button>
              </EmptyContent>
            )}
          </Empty>
        )}
      </div>

      {!isPending && !isError && filteredExercises.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstVisibleExercise}{"\u2013"}{lastVisibleExercise} of {filteredExercises.length} exercises
          </p>
          {totalPages > 1 && (
            <Pagination aria-label="Exercise pages">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#exercise-results"
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                    onClick={(event) => {
                      event.preventDefault()
                      changePage(currentPage - 1)
                    }}
                  />
                </PaginationItem>

                {pageTokens.map((token) => (
                  typeof token === "number" ? (
                    <PaginationItem key={token}>
                      <PaginationLink
                        href={`#exercise-page-${token}`}
                        isActive={token === currentPage}
                        aria-label={`Go to page ${token}`}
                        onClick={(event) => {
                          event.preventDefault()
                          changePage(token)
                        }}
                      >
                        {token}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={token}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#exercise-results"
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                    onClick={(event) => {
                      event.preventDefault()
                      changePage(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(DisplayExercises)

function ExerciseCard({
  exercise,
  muscles,
  requestToBePublic,
  isOwner,
}: {
  muscles: Muscle[]
  exercise: Exercise
  requestToBePublic: boolean
  isOwner: boolean
}) {
  return (
    <Card className="flex h-full flex-col transition-colors hover:border-info/40">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {exercise.isPublic ? (
              <Badge variant="info">Public</Badge>
            ) : requestToBePublic ? (
              <Badge variant="warning">Pending review</Badge>
            ) : (
              <Badge variant="secondary">Personal</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-lg leading-snug">{exercise.name}</CardTitle>
          <CardDescription className="line-clamp-3 leading-6">{exercise.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Muscles worked</p>
        <div className="flex flex-wrap gap-1.5">
          {muscles.length > 0 ? muscles.map((muscle) => (
            <Badge key={muscle.id} variant="outline">{muscle.name}</Badge>
          )) : <span className="text-sm text-muted-foreground">No muscles assigned</span>}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t pt-4">
        <span className="text-xs text-muted-foreground">
          {muscles.length} muscle{muscles.length === 1 ? "" : "s"}
        </span>
        {isOwner && (
          <div className="flex items-center gap-2">
            <EditExercise exercise={exercise} muscleIds={muscles.map((muscle) => muscle.id)}>
              <Button size="icon" variant="outline" aria-label={`Edit ${exercise.name}`}>
                <Pencil data-icon="inline-start" />
              </Button>
            </EditExercise>
            <ConfirmDeleteExercise id={exercise.id} name={exercise.name}>
              <Button size="icon" variant="destructive" aria-label={`Archive ${exercise.name}`}>
                <Trash data-icon="inline-start" />
              </Button>
            </ConfirmDeleteExercise>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

function ConfirmDeleteExercise({ id, name, children }: { id: string; name: string; children: ReactNode }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.exercise.deleteExercise.useMutation({
    onSuccess: () => utils.exercise.getExercises.invalidate(),
  })
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      await mutateAsync({ id })
      toast.success("Exercise archived.")
      setOpen(false)
    } catch {
      toast.error("Failed to archive exercise.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archive {name}?</DialogTitle>
          <DialogDescription>
            It will disappear from your library, while completed workout history stays intact.
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

function EditExercise({
  exercise,
  muscleIds,
  children,
}: {
  exercise: Exercise
  muscleIds: string[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit exercise</DialogTitle>
          <DialogDescription>Update the movement details and assigned muscle groups.</DialogDescription>
        </DialogHeader>
        <EditExerciseForm
          exercise={exercise}
          muscleIds={muscleIds}
          closeFn={() => setOpen(false)}
          closeElement={(
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          )}
        />
      </DialogContent>
    </Dialog>
  )
}
