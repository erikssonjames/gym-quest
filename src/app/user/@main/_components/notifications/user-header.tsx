import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type Notification } from "@/server/db/schema/notifications";
import { EllipsisVertical, Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { format, formatDistanceToNowStrict } from "date-fns";

interface UserHeaderProps {
  userId: string
  notificationId: Notification["id"]
  isRead: boolean
  createdAt: Date
  text: string
}


export default function UserHeader ({ userId, notificationId, isRead, createdAt, text }: UserHeaderProps) {
  const utils = api.useUtils()

  const { data: user } = api.user.getUserById.useQuery(userId)

  const { 
    mutate: markNotificationAsRead, isPending: markNotificationAsReadPending 
  } = api.notification.markNotificationAsRead.useMutation({
    onSuccess: () => utils.notification.getNotifications.invalidate()
  })
  const { 
    mutate: deleteNotification, isPending: deleteNotificationPending
  } = api.notification.deleteNotification.useMutation({
    onSuccess: () => utils.notification.getNotifications.invalidate()
  })

  return (
    <div className="flex justify-between relative pe-8 group ps-4">
      <div className="flex gap-3 flex-grow">
        <Avatar className="size-7 text-sm">
          <AvatarImage src={user?.uploadedImage ?? user?.image ?? ""} />
          <AvatarFallback>{user?.username?.at(0) ?? "~"}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <p className="text-sm"><span className="font-semibold">{user?.username}</span> {text}</p>
          <div className="text-xs text-muted-foreground flex justify-between">
            <p>{format(createdAt, "cccc, k:mm")}</p>
            <p>{formatDistanceToNowStrict(createdAt)} ago</p>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="absolute right-2 top-0 h-7 w-5 opacity-0 group-hover:opacity-100">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              disabled={isRead}
              onSelect={(e) => {
                e.preventDefault()
                markNotificationAsRead(notificationId)
              }}
            >
              {markNotificationAsReadPending ? <Loader2 className="animate-spin" /> : <Eye />}
              Mark as read
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault()
              deleteNotification(notificationId)
            }}>
              {deleteNotificationPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Remove notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  )
}