import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Dumbbell,
  Flame,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import Navbar from "./_components/navbar"
import WelcomeText from "./_components/welcome-text"
import GymQuester from "./_components/gym-quester"
import Footer from "./_components/footer"

const steps = [
  {
    icon: Target,
    number: "01",
    title: "Choose a quest",
    description: "Turn a goal into a clear, repeatable target for the week ahead.",
  },
  {
    icon: Dumbbell,
    number: "02",
    title: "Show up and log it",
    description: "Capture the work while it is fresh and watch your consistency build.",
  },
  {
    icon: Trophy,
    number: "03",
    title: "Collect the momentum",
    description: "Earn progress, unlock milestones, and give your next session a reason to happen.",
  },
]

function StepCard({
  icon: Icon,
  number,
  title,
  description,
}: (typeof steps)[number]) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm transition-transform hover:-translate-y-1">
      <CardHeader className="gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            {number}
          </span>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <CardDescription className="text-sm leading-7">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function QuestPreview() {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-card/90 shadow-xl shadow-primary/5">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border border-primary/10" />
      <CardHeader className="relative gap-4 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              This week&apos;s quest
            </p>
            <CardTitle className="mt-2 text-2xl">Build the habit</CardTitle>
          </div>
          <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Flame className="size-5" aria-hidden="true" />
          </div>
        </div>
        <CardDescription className="max-w-sm text-sm leading-7">
          Small sessions, repeated often. The scoreboard follows the work.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-6 p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold tracking-tight">4/5</p>
            <p className="mt-1 text-sm text-muted-foreground">sessions completed</p>
          </div>
          <Badge variant="secondary">80% momentum</Badge>
        </div>
        <Progress
          aria-label="Four of five sessions completed"
          className="h-2"
          value={80}
        />
        <Separator />
        <div className="flex items-center gap-3">
          <div className="flex">
            <Avatar className="size-8 border-2 border-card">
              <AvatarFallback className="bg-primary/15 text-xs text-primary">JM</AvatarFallback>
            </Avatar>
            <Avatar className="-ml-2 size-8 border-2 border-card">
              <AvatarFallback className="bg-secondary text-xs">SK</AvatarFallback>
            </Avatar>
            <Avatar className="-ml-2 size-8 border-2 border-card">
              <AvatarFallback className="bg-muted text-xs">+4</AvatarFallback>
            </Avatar>
          </div>
          <p className="text-sm text-muted-foreground">
            Your circle is keeping pace.
          </p>
        </div>
      </CardContent>
      <CardFooter className="relative border-t border-border/60 p-6 sm:p-8 sm:pt-6">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
          One more session to go.
        </p>
      </CardFooter>
    </Card>
  )
}

export default async function Home() {
  return (
    <main className="relative overflow-hidden bg-background">
      <Navbar />

      <section className="relative isolate min-h-svh border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-24 size-[28rem] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-[-12rem] top-[-10rem] size-[38rem] rounded-full border border-primary/10" />
          <div className="absolute right-[-8rem] top-[-6rem] size-[30rem] rounded-full border border-primary/10" />
        </div>
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-16 px-6 pb-20 pt-36 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8 lg:pb-24 lg:pt-40">
          <div className="relative z-10">
            <WelcomeText />
          </div>
          <div className="relative z-10 lg:pl-6">
            <GymQuester />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Scroll to explore
            <ArrowUpRight className="size-3 rotate-90" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
            <div className="max-w-md">
              <Badge variant="secondary">How it works</Badge>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
                A better loop for the work you already want to do.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                GymQuest keeps the useful parts of a training log and adds the
                momentum of a game you actually want to return to.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Start your first quest
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-center lg:px-8 lg:py-32">
          <QuestPreview />

          <div className="max-w-lg">
            <Badge variant="secondary">Progress with people</Badge>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
              Your routine is easier to keep when it has a little life around it.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              Share the milestone, celebrate the streak, and let your friends
              make the next session feel like part of something bigger.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              {[
                "See the sessions that are moving you forward.",
                "Turn consistency into visible milestones.",
                "Keep your goals personal and your motivation social.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="get-started" className="bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <Card className="relative overflow-hidden border-primary/20 bg-primary text-primary-foreground shadow-xl shadow-primary/10">
            <div className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border border-primary-foreground/10" />
            <div className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full border border-primary-foreground/10" />
            <CardHeader className="relative gap-5 p-8 sm:p-12">
              <Badge variant="secondary" className="w-fit">Ready when you are</Badge>
              <CardTitle className="max-w-2xl text-3xl leading-tight text-primary-foreground sm:text-5xl">
                Make your next workout count for more than today.
              </CardTitle>
              <CardDescription className="max-w-xl text-base leading-8 text-primary-foreground">
                Start with one goal, one session, and a place to see the momentum
                build.
              </CardDescription>
            </CardHeader>
            <CardFooter className="relative flex flex-wrap gap-3 p-8 pt-0 sm:p-12 sm:pt-0">
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">
                  Join GymQuest
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
