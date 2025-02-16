"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Loader2, UserRoundX } from "lucide-react"

export default function FriendsPage () {
  const { data: friends } = api.user.getFriends.useQuery()

  return (
    <div className="pt-6">
      {friends?.map(friend => (
        <div key={friend.id} className="w-full group hover:bg-accent/40 p-1 rounded-md relative">
          <div className="flex gap-4 items-center">
            <Avatar className="size-7 text-xs">
              <AvatarImage src={friend.image ?? ""} />
              <AvatarFallback>{friend.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{friend.username}</p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 h-full flex items-center opacity-0 group-hover:opacity-100">
            <UserControls otherUserId={friend.id} />
          </div>
        </div>
      ))}

      {friends?.length === 0 && (
        <div className="w-full flex items-center justify-center pt-10">
          <p className="text-muted-foreground font-semibold">No friends added yet!</p>
        </div>
      )}
    </div>
  )
}

function UserControls ({ otherUserId }: { otherUserId: string }) {
  const utils = api.useUtils()
  const { mutate: removeFriend, isPending: removeFriendPending } = api.user.removeFriend.useMutation({
    onSuccess: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
    }
  })

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              className="size-6"
              variant="ghost"
              disabled={removeFriendPending} 
              onClick={() => removeFriend(otherUserId)}
            >
              {removeFriendPending ? <Loader2 className="animate-spin" /> : <UserRoundX />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Friend</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}