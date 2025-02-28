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
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import IntersectionContainer from "./intersection-container";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

export default function Notifications () {
  const utils = api.useUtils()
  
  const { open } = useSidebar()

  const notificationContainerRef = useRef<HTMLDivElement>(null)

  const { data: notifications, isPending } = api.notification.getNotifications.useQuery()
  const { mutate: markNotificationsAsRead } = api.notification.markNotificationsAsRead.useMutation({
    onSuccess: () => utils.notification.getNotifications.invalidate()
  })

  const { mutate: hideReadNotifications } = api.notification.hideReadNotifications.useMutation({
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

  const [readNotifications, setReadNotifications] = useState<Array<string>>([])
  const debouncedReadNotifications = useDebounce(readNotifications, 2000)

  const onSetNotificationAsRead = useCallback((id: string) => {
    setReadNotifications(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const hasMarkedAsReadRef = useRef<Array<string>>([])
  useEffect(() => {
    const toMarkAsRead = debouncedReadNotifications.filter(notification => {
      return !hasMarkedAsReadRef.current.includes(notification)
    })

    if (toMarkAsRead.length === 0) return

    hasMarkedAsReadRef.current = [
      ...hasMarkedAsReadRef.current,
      ...toMarkAsRead
    ]

    markNotificationsAsRead(toMarkAsRead)
  }, [debouncedReadNotifications, markNotificationsAsRead])

  return (
    <DropdownMenu 
      onOpenChange={(open) => {
        hasMarkedAsReadRef.current = []
        if (!open && notifications && notifications.length > 0 && unreadNotifications > 0) {
          const toMarkAsRead = debouncedReadNotifications.filter(notification => {
            return !hasMarkedAsReadRef.current.includes(notification)
          })
          markNotificationsAsRead(toMarkAsRead)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          size="icon" 
          variant={open ? "outline" : "ghost"} 
          className={cn(
            "relative",
            open ? "me-4" : "me-2"
          )}
        >
          <Bell />
          {unreadNotifications > 0 && (
            <div className="absolute rounded-full size-2 bg-red-700 top-2 right-2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="me-3 w-80">
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Latest Notifications</span>
            {notifications && notifications.length > 0 && (
              <button
                className="text-xs text-muted-foreground hover:underline px-2"
                onClick={() => hideReadNotifications()}
              >
              Clear read
              </button>
            )}
          </DropdownMenuLabel>
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
            <div className="space-y-2 max-h-96 overflow-y-auto" ref={notificationContainerRef}>
              {notifications.map(notification => (
                <IntersectionContainer
                  key={notification.id}
                  notificationId={notification.id}
                  notificationContainerRef={notificationContainerRef}
                  onReadNotification={onSetNotificationAsRead}
                >
                  {renderNotification(notification)}
                </IntersectionContainer>
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