"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Check, Loader2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/app/user/@main/_components/page-shell"

export default function IncomingRequestsPage () {
  const { data: friendRequests } = api.user.getFriendRequests.useQuery()

  return (
    <div className="space-y-3">
      {friendRequests?.incoming.map(req => (
        <Card key={req.id} className="transition-colors hover:border-primary/40"><CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-7 text-xs">{}
              <AvatarImage src={req.fromUser.uploadedImage ?? req.fromUser.image ?? ""} />
              <AvatarFallback>{req.fromUser.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{req.fromUser.username}</p>
          </div>

          <div className="flex items-center">
            <FriendRequestControls friendRequestId={req.id} />
          </div>
        </CardContent></Card>
      ))}

      {friendRequests?.incoming?.length === 0 && (
        <EmptyState title="No incoming requests" description="When someone wants to train alongside you, their request will appear here." />
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
      void utils.user.getFriendRequests.invalidate()
    }
  })
  const { mutate: ignoreFriendRequest, isPending: ignoreFriendRequestPending } = api.user.ignoreFriendRequest.useMutation({
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
