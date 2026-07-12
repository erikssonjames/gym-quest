"use client"

import { ArrowUpRight, Dumbbell } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PostContainer from "./post-container"

export default function EmptyWelcomeMessage() {
  return (
    <PostContainer>
      <CardHeader className="gap-3 p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-xl leading-tight">Welcome to your training feed</CardTitle>
          <CardDescription className="leading-6">
            Updates from your GymQuest community will appear here as people share their progress.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-sm leading-6 text-muted-foreground">
          Start a workout or use the composer above to create the first update.
        </p>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Button asChild>
          <Link href="/user/workouts/active/create">
            Start a workout
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </PostContainer>
  )
}
