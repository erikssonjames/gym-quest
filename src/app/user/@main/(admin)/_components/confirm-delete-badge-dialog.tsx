"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { api } from "@/trpc/react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import type { BadgeGroupName, BadgeLiteral } from "@/variables/badges";

export default function ConfirmDeleteBadgeDialog (
  { button, badge, badgeGroupName }: { button: ReactNode, badge: BadgeLiteral, badgeGroupName: BadgeGroupName }
) {
  const [open, setOpen] = useState(false)

  const utils = api.useUtils()
  const { mutate, isPending } = api.badges.deleteBadge.useMutation({
    onSuccess: () => {
      void utils.badges.getBadges.invalidate()
      setOpen(true)
      toast.success("Successfully removed badge.")
    }
  })

  const onDeleteBadge = () => {
    mutate(badge.id)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {button}
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Badge ({badge.id} ~ {badgeGroupName})</DialogTitle>
          <DialogDescription>Please confirm you wish to delete this badge</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button 
            variant="destructive"
            disabled={isPending}
            onClick={onDeleteBadge}
          >
            Delete
            {isPending && <Loader className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

