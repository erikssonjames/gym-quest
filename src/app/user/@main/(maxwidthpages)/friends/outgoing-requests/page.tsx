"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Loader2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/app/user/@main/_components/page-shell"

export default function OutgoingRequestsPage () {
  const { data: friendRequests } = api.user.getFriendRequests.useQuery()

  return (
    <div className="space-y-3">
      {friendRequests?.outgoing.map(req => (
        <Card key={req.id} className="transition-colors hover:border-primary/40"><CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-7 text-xs">{}
              <AvatarImage src={req.toUser.uploadedImage ?? req.toUser.image ?? ""} />
              <AvatarFallback>{req.toUser.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{req.toUser.username}</p>
          </div>

          <div className="flex items-center">
            <FriendRequestControls friendRequestId={req.id} />
          </div>
        </CardContent></Card>
      ))}

      {friendRequests?.outgoing?.length === 0 && (
        <EmptyState title="No outgoing requests" description="Requests you send will stay here until they are accepted, ignored, or cancelled." />
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
