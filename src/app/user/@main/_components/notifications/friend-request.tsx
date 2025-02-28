import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationsOutput } from "@/server/api/types/output";
import UserHeader from "./user-header";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { memo } from "react";

interface FriendRequestProps {
  notification: NotificationsOutput[number]
}

function FriendRequest ({ notification }: FriendRequestProps) {
  const utils = api.useUtils()
  const session = useSession()
  const { mutate: markNotificationAsRead } = api.notification.markNotificationAsRead.useMutation()
  const { mutate: acceptFriendRequest, isPending: acceptFriendRequestPending } = api.user.acceptFriendRequest.useMutation({
    onSuccess: () => {
      void utils.user.getFriends.invalidate()
      void utils.user.getUsers.invalidate()
      void utils.notification.getNotifications.invalidate()
    }
  })
  const { mutate: ignoreFriendRequest, isPending: ignoreFriendRequestPending } = api.user.ignoreFriendRequest.useMutation({
    onSuccess: () => {
      void utils.user.getUsers.invalidate()
      void utils.notification.getNotifications.invalidate()
    }
  })

  if (!notification.friendRequest) return null

  const { friendRequest, createdAt, hidden, readAt, id } = notification

  if (hidden) return null
  
  const myUserId = notification.userId
  const fromUser = friendRequest.friendRequest.fromUser
  const toUserId = friendRequest.friendRequest.toUserId
  const accepted = friendRequest.friendRequest.accepted
  const ignored = friendRequest.friendRequest.ignored

  let text: string | undefined
  if (fromUser.id === session.data?.user.id && accepted) {
    text = 'accepted your friend request!'
  } else if (fromUser.id !== session.data?.user.id) {
    text = 'sent you a friend request!'
  }

  if (!text) return undefined

  return (
    <div
      className={cn(
        "flex flex-col gap-4 py-2 rounded-md",
        readAt === null && "bg-secondary/20"
      )}
    >
      <UserHeader 
        userId={myUserId === fromUser.id ? toUserId : fromUser.id} 
        notificationId={id} 
        isRead={readAt !== null} 
        createdAt={createdAt}
        text={text}
      />

      {!accepted && !ignored && (
        <div className="flex gap-2 ps-14">
          <Button 
            size="sm" 
            className="h-7" 
            onClick={() => {
              acceptFriendRequest({ friendRequestId: friendRequest.friendRequestId })
              markNotificationAsRead(notification.id)
            }}
            disabled={acceptFriendRequestPending}
          >
            Accept
            {acceptFriendRequestPending && <Loader2 className="animate-spin" />}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7"
            onClick={() => {
              ignoreFriendRequest({ friendRequestId: friendRequest.friendRequestId })
              markNotificationAsRead(notification.id)
            }}
            disabled={ignoreFriendRequestPending}
          >
            Ignore
            {ignoreFriendRequestPending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      )}

      {accepted && (
        <div className="flex items-center gap-1 text-xs font-bold rounded-md w-fit ms-14 bg-green-600/70 px-2 py-1">
          <p>Accepted friend request!</p>
          <CheckCircle size={13} />
        </div>
      )}
      
      {ignored && (
        <div className="flex items-center gap-1 text-xs font-bold rounded-md w-fit ms-14">
          <p>Friend Request Ignored!</p>
          <XCircle size={16} className="text-destructive" />
        </div>
      )}
    </div>
  )
}

export default memo(FriendRequest)