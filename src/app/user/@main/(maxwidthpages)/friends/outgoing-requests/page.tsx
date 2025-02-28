"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Loader2, X } from "lucide-react"

export default function OutgoingRequestsPage () {
  const { data: friendRequests } = api.user.getFriendRequests.useQuery()

  return (
    <div className="pt-6">
      {friendRequests?.outgoing.map(req => (
        <div key={req.id} className="w-full group hover:bg-accent/40 p-1 rounded-md relative">
          <div className="flex gap-4 items-center">
            <Avatar className="size-7 text-xs">{}
              <AvatarImage src={req.toUser.uploadedImage ?? req.toUser.image ?? ""} />
              <AvatarFallback>{req.toUser.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{req.toUser.username}</p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 h-full flex items-center">
            <FriendRequestControls friendRequestId={req.id} />
          </div>
        </div>
      ))}

      {friendRequests?.outgoing?.length === 0 && (
        <div className="w-full flex items-center justify-center pt-10">
          <p className="text-muted-foreground font-semibold">No outgoing requests found!</p>
        </div>
      )}
    </div>
  )
}

function FriendRequestControls ({ friendRequestId }: { friendRequestId: string }) {
  const utils = api.useUtils()
  const { mutate: revokeFriendRequest, isPending: revokeFriendRequestPending } = api.user.revokeFriendRequest.useMutation({
    onSuccess: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
      void utils.user.getFriendRequests.invalidate()
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
              disabled={revokeFriendRequestPending} 
              onClick={() => revokeFriendRequest({ friendRequestId })}
            >
              {revokeFriendRequestPending ? <Loader2 className="animate-spin" /> : <X />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Revoke Friend Request</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}