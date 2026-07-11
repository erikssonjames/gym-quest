import Link from "next/link"
import { ArrowRight, Bot, CalendarClock, Search, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"

const tutorials = [
  { title: "Create a workout", description: "Build sets manually, search your exercise library, or open AI assist for a guided draft.", href: "/user/workouts/manage/create", icon: Bot },
  { title: "Find a public plan", description: "Browse community workouts and choose one that matches your time and equipment.", href: "/user/workouts/browse", icon: Search },
  { title: "Make training repeatable", description: "Use history and levels to see whether your plan is becoming a habit.", href: "/user/workouts/history", icon: CalendarClock },
  { title: "Train with friends", description: "Add friends, respond to requests, and share the work that keeps you moving.", href: "/user/friends", icon: Users },
]

export default function TurtorialsPage () {
  return <PageShell eyebrow="Guide 02" title="Training tutorials" description="Short, task-focused guides for the parts of GymQuest you will use most."><PageSection title="Pick a task"><div className="grid gap-3 sm:grid-cols-2">{tutorials.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className="group"><Card className="h-full transition-colors group-hover:border-primary/40"><CardHeader className="flex-row items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="size-4" /></div><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="pt-0"><p className="text-sm leading-6 text-muted-foreground">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open flow<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></CardContent></Card></Link>)}</div></PageSection></PageShell>
}
