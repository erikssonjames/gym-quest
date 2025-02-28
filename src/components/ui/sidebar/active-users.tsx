import { api } from "@/trpc/react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { useCallback, useEffect, useRef } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from "../dropdown-menu";
import { cn } from "@/lib/utils";
import Timer from "../timer";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from "../tooltip";
import { HandsAndOtherBodyPartsEmojis, handsAndOtherBodyPartsEmojis } from "@/variables/emojis/handsAndOtherBodyParts";

export default function ActiveUsers () {
  const { open } = useSidebar()
  const { isMobile } = useSidebar()
  const { data: activeFriendsWorkoutSessions } = api.workout.getFriendsActiveWorkoutSessions.useQuery()
  const { data: friends } = api.user.getFriends.useQuery()

  const currActiveFriendsWorkoutSession = useRef<Set<string>>(new Set())

  const getUser = useCallback((userId: string) => {
    return friends?.find(f => f.id === userId)
  }, [friends])

  useEffect(() => {
    if (
      !activeFriendsWorkoutSessions ||
      activeFriendsWorkoutSessions.length === 0
    ) return

    const newSessions = activeFriendsWorkoutSessions.filter(activeSession => (
      !currActiveFriendsWorkoutSession.current.has(activeSession.id)
    ))

    if (newSessions.length > 0) {
      console.log("New sessions!", newSessions)
      newSessions.forEach(session => {
        currActiveFriendsWorkoutSession.current.add(session.id)
      })
      const title = newSessions.length > 1
        ? "Your friends just started their workouts!"
        : "A friend of yours just started a workout!"
      toast.info(title, {
        position: "top-left",
        description: (
          <div className="flex flex-col gap-2">
            {newSessions.map(session => (
              <div key={`toast-${session.id}-${session.userId}`}>
                <span className="font-bold me-2">{getUser(session.userId)?.username}</span>
                just started a new workout.
              </div>
            ))}
          </div>
        )
      })
    }
  }, [activeFriendsWorkoutSessions, getUser])

  if (!activeFriendsWorkoutSessions || activeFriendsWorkoutSessions.length === 0) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton 
              size="lg" 
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex justify-between items-center w-full rounded-lg h-full">
                {open && <p className="font-semibold">Active Workouts ({activeFriendsWorkoutSessions.length})</p>}
                <Tooltip delayDuration={open ? Infinity : 0}>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center justify-center w-8 h-full border rounded-md",
                      open && "border-transparent"
                    )}>
                      <div className="relative min-w-[8px] min-h-[8px]">
                        <div className="flex items-center justify-center absolute inset-0">
                          <div className="bg-green-300 animate-pulse w-full h-full rounded-full relative" />
                        </div>
                        <div className="flex items-center justify-center absolute inset-0">
                          <div className="w-[6px] h-[6px] bg-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      Friends Active Workouts
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="">
              Friends Active Workouts
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {activeFriendsWorkoutSessions?.map(session => {
                const user = getUser(session.userId)

                return (
                  <DropdownMenuItem key={`${session.id}-${session.userId}`}>
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="size-6">
                        <AvatarImage src={user?.uploadedImage ?? user?.image ?? ""} />
                        <AvatarFallback>{user?.username?.at(0) ?? ""}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold ms-1s">{user?.username}</p>
                      <Timer startTime={session.startedAt} />
                      <div className="flex-grow flex items-end justify-end gap-1">
                        <p className="size-8 hover:bg-accent cursor-pointer flex items-center justify-center rounded-md">
                          {handsAndOtherBodyPartsEmojis[HandsAndOtherBodyPartsEmojis.OK].emoji}
                        </p>
                        <p className="size-8 hover:bg-accent cursor-pointer flex items-center justify-center rounded-md">
                          {handsAndOtherBodyPartsEmojis[HandsAndOtherBodyPartsEmojis.FLEXED_BICEPS].emoji}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
              {activeFriendsWorkoutSessions?.length === 0 && (
                <DropdownMenuItem>
                  No active workout
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>  
    </SidebarMenu>
  )
}