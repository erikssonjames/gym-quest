'use client'

import Image from "next/image"
import { BarChart3, Check, Flame } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function GymQuester() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="pointer-events-none absolute inset-5 rounded-[2rem] bg-primary/10 blur-3xl" />
      <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <CardHeader className="gap-4 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary">Live quest</Badge>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              Building momentum
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your training, with a little more game
              </p>
              <CardTitle className="mt-2 text-2xl sm:text-3xl">The next rep is the next level.</CardTitle>
            </div>
            <Flame className="hidden size-6 text-primary sm:block" aria-hidden="true" />
          </div>
          <CardDescription className="max-w-md leading-7">
            Turn the work into a story you can see, share, and keep writing.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-7 sm:pt-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
            <div className="absolute inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute inset-x-8 bottom-5 h-24 rounded-full bg-primary/10 blur-2xl" />
            <Image
              src="/gym-quester.png"
              alt="GymQuester ready for the next training quest"
              fill
              priority
              className="relative z-10 object-contain p-4 sm:p-8"
            />
            <Image
              src="/grass-hill.png"
              alt=""
              fill
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 object-contain object-bottom"
            />
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-4 border-t border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 sm:pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Weekly momentum
            </p>
            <p className="mt-1 text-lg font-semibold">Keep the streak alive.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary">
            <BarChart3 className="size-4" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Progress</p>
              <p className="font-semibold">+24% this week</p>
            </div>
            <Check className="size-4" aria-hidden="true" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
