'use client';

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
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import { api } from "@/trpc/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type InsertMuscle, type InsertMuscleGroup, InsertMuscleGroupZod, InsertMuscleZod } from "@/server/db/schema/body";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useSearchParamsFn } from "@/hooks/use-search-params-fn";
import { SearchParam } from "@/variables/url";
import { toast } from "sonner";

type FormValues = InsertMuscle;

export default function CreateMuscleForm() {
  const searchParamFunctions = useSearchParamsFn()

  const { data: muscleGroups, refetch } = api.body.getMuscleGroups.useQuery();
  const { mutateAsync, isPending } = api.body.createMuscle.useMutation({
    onSuccess: () => {
      // Handle success, like showing a toast or resetting the form.
    },
    onError: (error) => {
      // Handle error, like showing a toast with error.message.
      console.error("Error creating muscle:", error);
    },
  });

  const [addCreateMuscleGroupOpen, setAddCreateMuscleGroupOpen] = useState(false)
  const { mutateAsync: createMuscleGroup, isPending: createMuscleGroupPending } = api.body.createMuscleGroup.useMutation({
    onSuccess: () => {
      void refetch();
      setAddCreateMuscleGroupOpen(false)
    },
    onError: (error) => {
      console.error("Error creating muscle group:", error);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(InsertMuscleZod),
    defaultValues: {
      name: "",
      latinName: "",
      muscleGroupId: "",
      description: "",
    },
  });

  const muscleGroupForm = useForm<InsertMuscleGroup>({
    resolver: zodResolver(InsertMuscleGroupZod),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values);
      toast.success('Workout created!')
      form.reset()
      searchParamFunctions.get(SearchParam.RETURN_URL)?.()
    } catch (e) {
      toast.error('Error', {
        description: String(e)
      })
    }
  };

  const onCreateMuscleGroup = async (values: InsertMuscleGroup) => {
    await createMuscleGroup(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Muscle Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latinName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latin Name</FormLabel>
              <FormControl>
                <Input placeholder="Latin Name (optional)" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="muscleGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Muscle Group</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between flex w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? muscleGroups?.find(
                            (muscleGroup) => muscleGroup.id === field.value
                          )?.name
                          : "Select muscle group"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full" align="start">
                    <Command>
                      <div className="flex gap-4 border-b items-center px-2 py-1">
                        <CommandInput
                          placeholder="Search muscle group..."
                          className="h-9 border-none"
                          noBorderB
                        />
                        <Dialog open={addCreateMuscleGroupOpen} onOpenChange={(open) => setAddCreateMuscleGroupOpen(open)}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="h-7">Add</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Muscle Group</DialogTitle>
                            </DialogHeader>
                            <Form {...muscleGroupForm}>
                              <form
                                onSubmit={muscleGroupForm.handleSubmit(onCreateMuscleGroup)}
                                className="space-y-4"
                              >
                                <FormField
                                  control={muscleGroupForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Muscle Group Name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={muscleGroupForm.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Description (optional)" {...field} value={field.value ?? ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="button" className="w-full" onClick={() => muscleGroupForm.handleSubmit(onCreateMuscleGroup)()}>
                                  {createMuscleGroupPending ? <Loader2Icon className="size-6 animate-spin" /> : <>Create</>}
                                </Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <CommandList>
                        <CommandEmpty>No muscle groups found.</CommandEmpty>
                        <CommandGroup>
                          {muscleGroups?.map((muscleGroup) => (
                            <CommandItem
                              value={muscleGroup.name}
                              key={muscleGroup.name}
                              onSelect={() => {
                                form.setValue("muscleGroupId", muscleGroup.id)
                              }}
                            >
                              {muscleGroup.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  muscleGroup.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description (optional)" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-auto">
          {isPending ? <Loader2Icon className="size-6 animate-spin" /> : <>Create Muscle</>}
        </Button>
      </form>
    </Form>
  );
}
