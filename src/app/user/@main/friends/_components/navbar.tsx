"use client"

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AddFriend } from "./add-friend";

export default function Navbar () {
  const { data: friendsRequests } = api.user.getFriendRequests.useQuery()

  const incomingRequests = friendsRequests?.incoming.length ?? 0
  const outGoingRequests = friendsRequests?.outgoing.length ?? 0
  const totalRequests = incomingRequests + outGoingRequests

  const pathName = usePathname()

  return (
    <div className="flex gap-2 justify-between">
      <div className="flex gap-2">
        <Link 
          href="/user/friends"
          className={cn(
            "border-b-2 text-sm p-1",
            "/user/friends" === pathName ? "" : "border-b-transparent text-muted-foreground"
          )}
        >
          Friends
        </Link>
        <Link 
          href="/user/friends/requests"
          className={cn(
            "border-b-2 text-sm p-1",
            "/user/friends/requests" === pathName ? "" : "border-b-transparent text-muted-foreground"
          )}
        >
          Requests
          {totalRequests > 0 && (
            <span className="ms-2 px-1 py-0.5 bg-primary/80 rounded-sm font-semibold">
              {totalRequests > 9 ? "+9" : totalRequests}
            </span>
          )}
        </Link>
      </div>

      <AddFriend />
    </div>
  )
}