"use client"

import { ArrowUpRight, Dumbbell, Trophy, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const shortcuts = [
  {
    icon: Dumbbell,
    label: "Start a workout",
    description: "Log the session that moves you forward.",
    href: "/user/workouts/active/create",
  },
  {
    icon: Users,
    label: "Find your circle",
    description: "See who is training alongside you.",
    href: "/user/friends",
  },
  {
    icon: Trophy,
    label: "Check milestones",
    description: "See the progress you have earned.",
    href: "/user/achievements",
  },
]

export default function FeedSidebar() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="gap-2 p-5">
          <Badge variant="secondary" className="w-fit">
            Your next move
          </Badge>
          <CardTitle className="text-xl">Keep the momentum visible.</CardTitle>
          <CardDescription className="leading-6">
            Your feed is where progress becomes something you can return to.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-5 pt-0">
          {shortcuts.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs leading-5 text-muted-foreground">{description}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </Link>
          ))}
        </CardContent>
        <CardFooter className="border-t border-border/60 p-5">
          <p className="text-xs leading-5 text-muted-foreground">
            There is no perfect week. There is only the next useful session.
          </p>
        </CardFooter>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="gap-2 p-5">
          <CardTitle className="text-base">A note from GymQuest</CardTitle>
          <CardDescription className="leading-6">
            Share wins, questions, and the small decisions that make training stick.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
