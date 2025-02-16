import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuPortal, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { Bell, Loader2 } from "lucide-react";
import FriendRequest from "./friend-request";

export default function Notifications () {
  const utils = api.useUtils()
  const { data: notifications, isPending } = api.notification.getNotifications.useQuery()
  const { mutate: markNotificationsAsRead } = api.notification.markNotificationsAsRead.useMutation({
    onSuccess: () => utils.notification.getNotifications.invalidate()
  })

  const unreadNotifications = notifications
    ? notifications.reduce<number>((acc, curr) => {
      const isUnread = curr.readAt === null
      return acc + (isUnread ? 1 : 0)
    }, 0)
    : 0

  const renderNotification = (notification: NonNullable<typeof notifications> extends Array<infer T> ? T : never) => {
    if (notification.friendRequest) {
      return <FriendRequest notification={notification} />
    }
  }

  return (
    <DropdownMenu 
      onOpenChange={(open) => {
        if (!open && notifications && notifications.length > 0 && unreadNotifications > 0) {
          markNotificationsAsRead(notifications.map(n => n.id))
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="me-4 relative">
          <Bell />
          {unreadNotifications > 0 && (
            <div className="absolute rounded-full size-2 bg-red-700 top-2 right-2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="me-3 w-80">
          <DropdownMenuLabel>Latest Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isPending && notifications && notifications.length === 0 && (
            <div className="w-full h-20 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                No <span className="underline">unread</span> notifications.
              </p>
            </div>
          )}
          {isPending && (
            <div className="w-full h-20 flex items-center justify-center gap-2">
              <p className="text-muted-foreground text-sm">Grabbing notifications.</p>
              <Loader2 className="text-primary animate-spin size-4" />
            </div>
          )}
          {!isPending && notifications && notifications.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <div key={notification.id}>
                  {renderNotification(notification)}
                </div>
              ))}
            </div>
          )}
          {!isPending && !notifications && (
            <div className="w-full h-20 flex items-center justify-center gap-2">
              <p className="text-muted-foreground text-sm">Oops, could not get your notifications.</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}