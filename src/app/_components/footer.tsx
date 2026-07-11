import { ArrowUpRight, Dumbbell } from "lucide-react"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(9rem,0.6fr)_minmax(11rem,0.8fr)]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold tracking-tight"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Dumbbell className="size-4" aria-hidden="true" />
              </span>
              GymQuest
            </Link>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              A more motivating way to keep showing up, one quest and one session
              at a time.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Explore
            </p>
            <Link href="#how-it-works" className="hover:text-primary">
              How it works
            </Link>
            <Link href="#community" className="hover:text-primary">
              Community
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 hover:text-primary">
              Get started
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Keep moving
            </p>
            <p className="leading-7 text-muted-foreground">
              Built as a side project for people who want their training to feel
              like progress.
            </p>
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Sign in to your quest log
            </Link>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>GymQuest. Train with purpose.</p>
          <p>Built for the long game.</p>
        </div>
      </div>
    </footer>
  )
}
