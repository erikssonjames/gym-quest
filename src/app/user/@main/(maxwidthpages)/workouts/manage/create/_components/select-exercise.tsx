import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { api } from "@/trpc/react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { type ReactNode, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function SelectExercise (
  { onSelectExercise, button }: 
    { 
        onSelectExercise: (exerciseId: string) => void
        button?: ({ onClick }: { onClick: () => void }) => ReactNode
    }
) {
  const { data: exercises, isLoading, isError } = api.exercise.getExercises.useQuery()
  
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredExercises = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    if (!normalizedSearch) return exercises ?? []

    return (exercises ?? []).filter((exercise) => {
      const muscleNames = exercise.muscles.map((muscle) => muscle.name).join(" ")
      const searchableText = [exercise.name, exercise.description ?? "", muscleNames]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [exercises, searchValue])
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {button ? (
          button({ onClick: () => setOpen(true) })
        ) : (
          <Button type="button" onClick={() => setOpen(true)}>
            Add exercise <Plus />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="md:min-w-[700px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="relative w-full">
            <CommandInput
              placeholder="Search by exercise, muscle, or description..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="pe-24"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pe-2">
              <Button className="h-7" size="sm" type="button" asChild>
                <Link href="/user/exercises/create?r=./">
                  <Plus />
                  Create
                </Link>
              </Button>
            </div>
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading exercises..." : isError ? "Exercises could not be loaded." : "No exercises match your search."}
            </CommandEmpty>
            <CommandGroup heading={filteredExercises.length > 0 ? `${filteredExercises.length} exercises` : undefined}>
              {filteredExercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.id}
                  onSelect={() => {
                    onSelectExercise(exercise.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{exercise.name}</p>
                      {exercise.description && (
                        <p className="truncate text-xs text-muted-foreground">{exercise.description}</p>
                      )}
                    </div>
                    {exercise.muscles.length > 0 && (
                      <div className="hidden shrink-0 gap-1 sm:flex">
                        {exercise.muscles.slice(0, 2).map((muscle) => (
                          <Badge key={muscle.id} variant="outline" className="text-[10px]">
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
      </PopoverContent>
    </Popover>
  )
}
