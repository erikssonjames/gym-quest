"use client"

import { ArrowUpRight, Lightbulb, NotebookPen, Target } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import PostContainer from "./post-container"

export default function EmptyWelcomeMessage() {
  return (
    <PostContainer className="border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="gap-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Pinned</Badge>
          <span className="text-sm text-muted-foreground">GymQuest Team</span>
          <span className="text-xs text-muted-foreground">Start here</span>
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl leading-tight sm:text-3xl">
            Welcome to your new training home.
          </CardTitle>
          <CardDescription className="max-w-2xl leading-6">
            GymQuest is built around a simple idea: consistent work feels better
            when you can see it, share it, and return to it.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-6 pt-0 sm:p-7 sm:pt-0">
        <p className="max-w-2xl text-sm leading-7">
          Start small. Pick a goal, log the sessions that move it forward, and let
          your feed become a record of the person you are becoming.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/70 p-4">
            <Target className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Set a direction</p>
            <p className="text-xs leading-5 text-muted-foreground">Choose the next useful target.</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/70 p-4">
            <NotebookPen className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Log the work</p>
            <p className="text-xs leading-5 text-muted-foreground">Make each session count twice.</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/70 p-4">
            <Lightbulb className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Keep learning</p>
            <p className="text-xs leading-5 text-muted-foreground">Share feedback as you go.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/70 p-4">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">
            GymQuest is still growing. If something feels unclear or you have an
            idea that would make training better, use the feedback button in the
            top bar.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-3 border-t border-border/60 p-6 sm:p-7 sm:pt-5">
        <p className="text-xs text-muted-foreground">From the GymQuest Team</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/user/workouts">
            Explore workouts
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </PostContainer>
  )
}
