"use client"

import Link from "next/link"
import { type ReactNode, useMemo, useState } from "react"
import { Dumbbell, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { api } from "@/trpc/react"

export default function SelectExercise({
  onSelectExercise,
  button,
}: {
  onSelectExercise: (exerciseId: string) => void
  button?: ({ onClick }: { onClick: () => void }) => ReactNode
}) {
  const { data: exercises, isLoading, isError } = api.exercise.getExercises.useQuery()
  const { data: muscles } = api.body.getMuscles.useQuery()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [muscleGroupId, setMuscleGroupId] = useState("all")

  const muscleGroups = useMemo(() => {
    const groups = new Map<string, string>()

    muscles?.forEach((muscle) => {
      groups.set(muscle.muscleGroup.id, muscle.muscleGroup.name)
    })

    return [...groups.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [muscles])

  const filteredExercises = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return (exercises ?? []).filter((exercise) => {
      const belongsToGroup =
        muscleGroupId === "all" ||
        exercise.muscles.some((muscle) => muscle.muscleGroupId === muscleGroupId)

      if (!belongsToGroup) return false
      if (!normalizedSearch) return true

      const searchableText = [
        exercise.name,
        exercise.description ?? "",
        ...exercise.muscles.map((muscle) => muscle.name),
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [exercises, muscleGroupId, searchValue])

  const openPicker = () => setOpen(true)

  const selectExercise = (exerciseId: string) => {
    onSelectExercise(exerciseId)
    setOpen(false)
    setSearchValue("")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {button ? (
        button({ onClick: openPicker })
      ) : (
        <Button type="button" onClick={openPicker}>
          <Plus data-icon="inline-start" />
          Add exercise
        </Button>
      )}

      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
        <SheetHeader className="flex flex-col gap-2 border-b p-6 pr-12 text-left">
          <SheetTitle>Choose an exercise</SheetTitle>
          <SheetDescription>
            Search the library or narrow it by muscle group before adding an exercise.
          </SheetDescription>
        </SheetHeader>

        <Command shouldFilter={false} className="min-h-0 flex-1 rounded-none">
          <CommandInput
            placeholder="Search exercises, muscles, or descriptions…"
            value={searchValue}
            onValueChange={setSearchValue}
          />

          <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={muscleGroupId} onValueChange={setMuscleGroupId}>
              <SelectTrigger className="w-full sm:w-64" aria-label="Filter exercises by muscle group">
                <SelectValue placeholder="All muscle groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All muscle groups</SelectItem>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="w-fit">
              {filteredExercises.length} result{filteredExercises.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <CommandList className="max-h-none flex-1 p-2">
            <CommandEmpty>
              {isLoading
                ? "Loading exercises…"
                : isError
                  ? "Exercises could not be loaded."
                  : "No exercises match these filters."}
            </CommandEmpty>
            <CommandGroup heading={filteredExercises.length > 0 ? "Exercises" : undefined}>
              {filteredExercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={() => selectExercise(exercise.id)}
                  className="items-start p-3"
                >
                  <Dumbbell />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{exercise.name}</p>
                      {exercise.description && (
                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    {exercise.muscles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscles.map((muscle) => (
                          <Badge key={muscle.id} variant="outline">
                            {muscle.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <SheetFooter className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Missing an exercise from your library?</p>
          <Button type="button" variant="outline" asChild>
            <Link href="/user/exercises/create?r=./">
              <Plus data-icon="inline-start" />
              Create exercise
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
