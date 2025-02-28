"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { type InsertFeedback, InsertFeedbackZod } from "@/server/db/schema/feedback";
import { api } from "@/trpc/react";
import { emotionEmojis } from "@/variables/emojis";
import { EmotionEmojis } from "@/variables/emojis/emotion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, NotebookPen } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SendFeedback () {
  const { open } = useSidebar()
  const session = useSession()
  const userId = session.data?.user.id
  const url = usePathname()

  const [dialogOpen, setDialogOpen] = useState(false)

  const { mutate, isPending } = api.feedback.sendFeedback.useMutation({
    onSuccess: () => {
      setDialogOpen(false)
      toast.success("Feedback successfully sent!")
      form.reset({
        description: ""
      })
    }
  })

  const form = useForm<InsertFeedback>({
    resolver: zodResolver(InsertFeedbackZod),
    defaultValues: {
      userId,
      url,
      type: "other",
      description: "",
    }
  })

  function onSubmit(values: InsertFeedback) {
    mutate(values)
  }

  useEffect(() => {
    form.setValue("url", url)
  }, [url, form])

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset({
            description: ""
          })
          console.log("Reset")
        }
        setDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button 
          variant={open ? "outline" : "ghost"} 
          size="icon"
        >
          <NotebookPen />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
             Thanks for improving GymQuest {emotionEmojis[EmotionEmojis.RED_HEART].emoji}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea className="mt-4" placeholder="Describe your feed back here" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mt-8">
                <Button 
                  type="submit"
                  disabled={isPending}
                >
                  Send
                  {isPending && <Loader2 className="animate-spin" />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}