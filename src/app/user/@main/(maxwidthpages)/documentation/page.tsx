import Link from "next/link"
import { ArrowRight, BookOpen, Dumbbell, Users, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"

const guides = [
  { title: "Get started", description: "Set up your profile and complete your first session.", href: "/user/documentation/get-started", icon: Dumbbell },
  { title: "Training tutorials", description: "Learn the flows that make planning and logging easier.", href: "/user/documentation/tutorials", icon: BookOpen },
  { title: "Build your circle", description: "Find friends, share progress, and make consistency social.", href: "/user/friends", icon: Users },
  { title: "Earn milestones", description: "Understand badges, trophies, levels, and progress.", href: "/user/achievements", icon: Trophy },
]

export default function IntroductionPage () {
  return (
    <PageShell
      eyebrow="GymQuest guide"
      title="Train with a little more direction."
      description="GymQuest brings planning, logging, reflection, and community into one place. Use these guides when you need a clear next step."
      actions={<Button asChild><Link href="/user/documentation/get-started">Start here<ArrowRight data-icon="inline-end" /></Link></Button>}
    >
      <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="flex flex-col gap-3 p-6"><Badge variant="outline" className="w-fit border-primary/30 text-primary">The short version</Badge><p className="max-w-3xl text-lg leading-8">Choose a goal, create or find a workout, log the session, and let the record show you what is working.</p></CardContent></Card>
      <PageSection title="Choose your next guide" description="Each path is designed around a real task, not a wall of documentation."><div className="grid gap-3 sm:grid-cols-2">{guides.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className="group"><Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/20"><CardHeader className="gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="pt-0"><p className="text-sm leading-6 text-muted-foreground">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open guide<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></CardContent></Card></Link>)}</div></PageSection>
    </PageShell>
  )
}
