import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Dumbbell,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  footer?: ReactNode
  children: ReactNode
}

type FeatureProps = {
  icon: LucideIcon
  title: string
  description: string
}

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm leading-6 text-primary-foreground/70">{description}</p>
      </div>
    </div>
  )
}

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-dvh w-full bg-muted/30 lg:grid lg:grid-cols-[minmax(28rem,0.9fr)_minmax(36rem,1.1fr)]">
      <section className="flex min-h-dvh flex-col bg-background">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-8 sm:px-10 lg:px-14">
          <header>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-md text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
              aria-label="GymQuest home"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:-rotate-6">
                <Dumbbell className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base">GymQuest</span>
            </Link>
          </header>

          <div className="flex flex-1 items-center py-12 lg:py-16">
            <Card className="w-full border-border/70 bg-card/90 shadow-lg shadow-primary/5">
              <CardHeader className="gap-3 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {eyebrow}
                </p>
                <CardTitle className="text-3xl leading-tight sm:text-4xl">
                  {title}
                </CardTitle>
                <CardDescription className="max-w-sm text-base leading-7">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                {children}
              </CardContent>
              {footer && (
                <CardFooter className="justify-center border-t border-border/60 p-6 sm:p-8 sm:pt-6">
                  {footer}
                </CardFooter>
              )}
            </Card>
          </div>

          <footer className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>Train with purpose.</span>
            <Link href="/" className="hover:text-foreground">
              Back to GymQuest
            </Link>
          </footer>
        </div>
      </section>

      <aside className="relative hidden min-h-dvh overflow-hidden bg-primary text-primary-foreground lg:block">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 size-[32rem] rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute right-20 top-24 size-3 rounded-full bg-primary-foreground/40" />

        <ScrollArea className="h-dvh">
          <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col px-10 py-10 xl:px-16">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
              <span>Inside GymQuest</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </div>

            <div className="flex flex-1 flex-col justify-center py-16">
              <p className="text-sm font-medium text-primary-foreground/70">
                A gym community with momentum
              </p>
              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Make every set count.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-primary-foreground/75 xl:text-lg">
                GymQuest turns consistent training into visible progress, shared
                motivation, and a reason to keep showing up.
              </p>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <Feature
                  icon={BarChart3}
                  title="See your progress"
                  description="Track the work that moves you forward, session by session."
                />
                <Feature
                  icon={Users}
                  title="Train together"
                  description="Share milestones and keep your circle moving with you."
                />
                <Feature
                  icon={Trophy}
                  title="Earn your wins"
                  description="Turn consistency into badges, milestones, and momentum."
                />
                <Feature
                  icon={ShieldCheck}
                  title="Keep your routine yours"
                  description="Your training history stays in your hands and on your terms."
                />
              </div>

              <Card className="mt-6 border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground shadow-none">
                <CardHeader className="gap-2 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base text-primary-foreground">
                      Your next level starts with one session
                    </CardTitle>
                    <Dumbbell className="size-4 shrink-0" aria-hidden="true" />
                  </div>
                  <CardDescription className="text-primary-foreground/70">
                    A simple rhythm makes the hard days easier to come back to.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-5 pt-0 text-sm">
                  {["Choose a goal", "Log your first workout", "Build your streak"].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/15">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        <span className="text-primary-foreground/80">{item}</span>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/70">
              <span>Built for the long game.</span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary-foreground/70" />
                Keep moving
              </span>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </main>
  )
}
