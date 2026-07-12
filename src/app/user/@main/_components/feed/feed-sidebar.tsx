"use client"

import { Dumbbell, ScrollText, Trophy, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/trpc/react"

const shortcuts = [
  { icon: Dumbbell, label: "Start a workout", href: "/user/workouts/active/create" },
  { icon: Users, label: "Find your circle", href: "/user/friends" },
  { icon: Trophy, label: "View achievements", href: "/user/achievements" },
]

export default function FeedSidebar() {
  const { data: questBoard } = api.quests.getQuestBoard.useQuery()
  const rewardsReady = questBoard?.collectableCount ?? 0

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-3 p-5">
          <Badge variant={rewardsReady > 0 ? "default" : "secondary"} className="w-fit">
            {rewardsReady > 0 ? `${rewardsReady} rewards ready` : "Quest board"}
          </Badge>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg">Choose your next objective</CardTitle>
            <CardDescription className="leading-6">
              Workouts advance your daily, weekly, and journey quests automatically.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="px-5 pb-5 pt-0">
          <Button asChild variant={rewardsReady > 0 ? "default" : "outline"} className="w-full">
            <Link href="/user/quests">
              <ScrollText data-icon="inline-start" />
              {rewardsReady > 0 ? "Collect rewards" : "Open quest board"}
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-3 pb-3 pt-0">
          {shortcuts.map(({ icon: Icon, label, href }) => (
            <Button key={href} asChild variant="ghost" className="justify-start">
              <Link href={href}>
                <Icon data-icon="inline-start" />
                {label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
