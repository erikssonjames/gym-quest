"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/trpc/react"
import { Loader2, UserRoundX } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/app/user/@main/_components/page-shell"

export default function FriendsPage () {
  const { data: friends } = api.user.getFriends.useQuery()
  const router = useRouter()

  return (
    <div className="space-y-3">
      {friends?.map(friend => (
        <Card
          key={friend.id} 
          className="group cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/20"
          onClick={() => {
            router.push(`/user/profile/${friend.id}`)
          }}
        >
          <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-7 text-xs">
              <AvatarImage src={friend.uploadedImage ?? friend.image ?? ""} />
              <AvatarFallback>{friend.username?.at(0) ?? ""}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{friend.username}</p>
          </div>

          <div className="flex items-center opacity-70 transition-opacity group-hover:opacity-100">
            <UserControls otherUserId={friend.id} />
          </div>
          </CardContent>
        </Card>
      ))}

      {friends?.length === 0 && (
        <EmptyState title="Your circle is empty" description="Add a friend to share progress and make the next session easier to start." />
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
              onClick={(event) => {
                event.stopPropagation()
                removeFriend(otherUserId)
              }}
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
