import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { api } from "@/trpc/react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { type ReactNode, useState } from "react"

export default function SelectExercise (
  { onSelectExercise, button }: 
    { 
        onSelectExercise: (exerciseId: string) => void
        button?: ({ onClick }: { onClick: () => void }) => ReactNode
    }
) {
  const { data: exercises } = api.exercise.getExercises.useQuery()
  
  const [open, setOpen] = useState(false)
  
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
      <PopoverContent className="min-w-[700px] p-0" align="start">
        <Command>
          <div className="relative w-full">
            <CommandInput placeholder="Search exercises..." />
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center pe-2">
              <Button className="h-7" size="sm" type="button" asChild>
                <Link href="/user/exercises/create?r=./">
                  <Plus />
                    Create
                </Link>
              </Button>
            </div>
          </div>
          <CommandList>
            <CommandEmpty>No exercises found.</CommandEmpty>
            <CommandGroup>
              {exercises?.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={exercise.name}
                  onSelect={() => {
                    onSelectExercise(exercise.id)
                    setOpen(false)
                  }}
                >
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
  