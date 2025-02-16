"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Check, Loader2, X } from "lucide-react"

export default function IncomingRequestsPage () {
  const { data: friendRequests } = api.user.getFriendRequests.useQuery()

  return (
    <div className="pt-6">
      {friendRequests?.incoming.map(req => (
        <div key={req.id} className="w-full group hover:bg-accent/40 p-1 rounded-md relative">
          <div className="flex gap-4 items-center">
            <Avatar className="size-7 text-xs">{}
              <AvatarImage src={req.fromUser.image ?? ""} />
              <AvatarFallback>{req.fromUser.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{req.fromUser.username}</p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 h-full flex items-center">
            <FriendRequestControls friendRequestId={req.id} />
          </div>
        </div>
      ))}

      {friendRequests?.incoming?.length === 0 && (
        <div className="w-full flex items-center justify-center pt-10">
          <p className="text-muted-foreground font-semibold">No incoming requests found!</p>
        </div>
      )}
    </div>
  )
}

function FriendRequestControls ({ friendRequestId }: { friendRequestId: string }) {
  const utils = api.useUtils()
  const { mutate: acceptFriendRequest, isPending: acceptFriendRequestPending } = api.user.acceptFriendRequest.useMutation({
    onSuccess: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
    }
  })
  const { mutate: ignoreFriendRequest, isPending: ignoreFriendRequestPending } = api.user.ignoreFriendRequest.useMutation({
    onSuccess: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
    }
  })

  return (
    <div className="flex gap-2 pe-2">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              className="size-7 p-0 rounded-full"
              variant="outline"
              disabled={acceptFriendRequestPending || ignoreFriendRequestPending} 
              onClick={() => acceptFriendRequest({ friendRequestId })}
            >
              {acceptFriendRequestPending ? <Loader2 className="animate-spin" /> : <Check />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Accept</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              className="size-7 p-0 rounded-full"
              variant="outline"
              disabled={acceptFriendRequestPending || ignoreFriendRequestPending} 
              onClick={() => ignoreFriendRequest({ friendRequestId })}
            >
              {ignoreFriendRequestPending ? <Loader2 className="animate-spin" /> : <X />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ignore</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}