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
import { Loader2Icon } from "lucide-react";
import { api } from "@/trpc/react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { type InsertBadge, InsertBadgeZod } from "@/server/db/schema/badges";
import type { BadgeGroupName, BadgeLiteral } from "@/variables/badges";

export default function CreateBadgeDialog (
  { button, badge, badgeGroupName }: { button: ReactNode, badge: BadgeLiteral, badgeGroupName: BadgeGroupName }
) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {button}
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Badge ({badge.id} ~ {badgeGroupName})</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <CreateBadgeForm close={() => setOpen(false)} badge={badge} badgeGroupName={badgeGroupName} />
      </DialogContent>
    </Dialog>
  )
}

function CreateBadgeForm({ close, badge, badgeGroupName }: { close: () => void, badge: BadgeLiteral, badgeGroupName: BadgeGroupName }) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.badges.addBadge.useMutation({
    onSuccess: () => {
      void utils.badges.getBadges.invalidate()
      close()
    },
    onError: (error) => {
      toast.error('Error', {
        description: String(error)
      })
    },
  });

  const form = useForm<InsertBadge>({
    resolver: zodResolver(InsertBadgeZod),
    defaultValues: {
      id: badge.id,
      description: "",
      name: "",
      percentageOfUsersHasBadge: 0,
      valueToComplete: 0,
      valueDescription: "",
      valueName: "",
      group: badgeGroupName,
      groupWeighting: badge.weighting
    }
  });


  const onSubmitBadge = async (values: InsertBadge) => {
    await mutateAsync(values);
  };


  return (
    <Form {...form}>
      {/* {JSON.stringify(form.formState.errors)} */}
      <form
        onSubmit={form.handleSubmit(onSubmitBadge)}
        className="gap-2 flex flex-col h-full py-4 px-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
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
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="valueName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value Name</FormLabel>
              <FormControl>
                <Input placeholder="Value Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valueDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value Description</FormLabel>
              <FormControl>
                <Input placeholder="Value Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valueToComplete"
          render={() => (
            <FormItem>
              <FormLabel>Value to complete</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Value to complete" 
                  type="number"
                  {...form.register('valueToComplete', { valueAsNumber: true })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-10 flex gap-4">
          <Button type="submit" className="flex-grow">
            {isPending ? <Loader2Icon className="size-6 animate-spin" /> : <>Create Badge</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
