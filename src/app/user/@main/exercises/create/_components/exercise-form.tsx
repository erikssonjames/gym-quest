"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Loader2Icon, Plus, Trash } from "lucide-react";
import { api } from "@/trpc/react";
import { type CreateExercise, CreateExerciseZod } from "@/server/db/schema/exercise";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-localstorage";
import Link from "next/link";
import { useSearchParamsFn } from "@/hooks/use-search-params-fn";
import { SearchParam } from "@/variables/url";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function CreateExerciseForm() {
  const searchParamsFunctions = useSearchParamsFn()
  const router = useRouter()
  const [storedForm, saveStoredForm] = useLocalStorage<Partial<CreateExercise>>("createExerciseForm", null)

  const { data: muscles } = api.body.getMuscles.useQuery()
  const { mutateAsync, isPending } = api.exercise.createExercise.useMutation({
    onSuccess: () => {
      toast.success('Exercise created!')
      form.reset()
      const redirectFn = searchParamsFunctions.get(SearchParam.RETURN_URL)
      if (redirectFn) {
        redirectFn()
      } else {
        router.back()
      }
    },
    onError: (error) => {
      toast.error('Error', {
        description: String(error)
      })
    },
  });

  const form = useForm<CreateExercise>({
    resolver: zodResolver(CreateExerciseZod),
    defaultValues: storedForm ?? {
      description: "",
      name: "",
      muscleIds: [],
      requestToBePublic: false,
    },
  });


  const onSubmitWorkout = async (values: CreateExercise) => {
    await mutateAsync(values);
  };

  // Save form state whenever it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveStoredForm({
        description: value.description ?? "",
        muscleIds: value.muscleIds 
          ? value.muscleIds.filter(m => !!m) as string[]
          : [],
        name: value.name ?? "",
        requestToBePublic: value.requestToBePublic ?? false
      });
    });

    // Cleanup: Unsubscribe the watch when the component unmounts
    return () => subscription.unsubscribe();
  }, [form, saveStoredForm]);

  const handleAddMuscleId = (id: string) => {
    const currentMuscleIds = form.getValues("muscleIds")
    const exists = currentMuscleIds.includes(id)
    const newValues = exists
      ? currentMuscleIds.filter(muscleId => muscleId !== id)
      : [...currentMuscleIds, id]
    form.setValue("muscleIds", newValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWorkout)} className="gap-6 flex flex-col h-full">
        <div className="flex gap-10">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Workout Name" className="py-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="requestToBePublic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request to make Public</FormLabel>
                <div className="block">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="size-7 mt-2" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border px-4 py-3 rounded-md border-dashed border-primary flex flex-col gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Select muscles targeted by this exercise.</p>
          </div>

          <div className="">
            {form.getValues("muscleIds").map((muscleId, idx) => {
              const muscle = muscles?.find(m => m.id === muscleId)
              if (!muscle) return null
              return (
                <div key={muscleId} className="flex justify-between items-center pe-1 ps-3 py-1 rounded-sm hover:bg-secondary/20">
                  <p className="text-sm">{idx + 1} - {muscle.name}</p>
                  <Button size="icon" variant="destructive" className="size-7" type="button">
                    <Trash />
                  </Button>
                </div>
              )
            })}
          </div>

          <SelectMuscles
            onAddMuscle={handleAddMuscleId}
            selectedIds={form.getValues("muscleIds")}
          />
        </div>

        <div className="mt-auto flex gap-4">
          <Button type="submit" className="flex-grow">
            {isPending ? <Loader2Icon className="size-6 animate-spin" /> : <>Create Exercise</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SelectMuscles({ onAddMuscle, selectedIds }: { onAddMuscle: (id: string) => void, selectedIds: Array<string> }) {
  const { data: muscles } = api.body.getMuscles.useQuery()

  const [open, setOpen] = useState(false)
  const [muscleId, setMuscleId] = useState<string | undefined>()

  const onSelected = () => {
    setMuscleId(undefined)
    setOpen(false)

    if (muscleId) onAddMuscle(muscleId)
  }

  return (
    <div className="flex gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
          >
            {muscleId
              ? muscles?.find((muscle) => muscle.id === muscleId)?.name
              : "Select muscle..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <div className="flex gap-4 border-b items-center px-2 py-1">
              <CommandInput placeholder="Search muscles..." className="h-9 border-none" noBorderB />
              <Button size="sm" className="h-7" asChild>
                <Link href="/user/muscles/create?r=./">Create new</Link>
              </Button>
            </div>
            <CommandList>
              <CommandEmpty>No muscles found.</CommandEmpty>
              <CommandGroup>
                {muscles?.map((muscle) => (
                  <CommandItem
                    key={muscle.id}
                    value={muscle.id}
                    onSelect={(id) => setMuscleId(id)}
                  >
                    {muscle.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedIds.includes(muscle.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button size="sm" type="button" onClick={onSelected}><Plus /></Button>
    </div>
  )
}
