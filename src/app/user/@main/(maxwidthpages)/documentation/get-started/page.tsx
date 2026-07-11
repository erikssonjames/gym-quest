import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"

const steps = [
  ["Complete your profile", "Choose a username and select a badge that feels like you."],
  ["Choose a workout", "Start with a saved plan, browse public workouts, or create your own."],
  ["Log the session", "Follow the active workout flow and record each set as you go."],
  ["Review the result", "Use your history, achievements, and feed to keep the next session visible."],
] as const

export default function GetStartedPage () {
  return (
    <PageShell eyebrow="Guide 01" title="Your first useful session" description="The fastest way to understand GymQuest is to complete one small loop from plan to reflection." actions={<Button asChild><Link href="/user/workouts/active/create">Choose a workout<ArrowRight data-icon="inline-end" /></Link></Button>}>
      <PageSection title="Four steps, one loop" description="You do not need a perfect plan to begin."><div className="grid gap-3 md:grid-cols-2">{steps.map(([title, description], index) => <Card key={title}><CardHeader className="flex-row items-start gap-3"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{index === 0 ? <Check className="size-4" /> : <span className="text-sm font-semibold">{index + 1}</span>}</div><div className="space-y-1"><CardTitle className="text-base">{title}</CardTitle><p className="text-sm leading-6 text-muted-foreground">{description}</p></div></CardHeader><CardContent className="pt-0"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Circle className="size-3" />Recommended next step</div></CardContent></Card>)}</div></PageSection>
      <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><Badge variant="secondary">Ready when you are</Badge><p className="mt-2 font-medium">Start with a workout that fits today, not the person you wish you were next month.</p></div><Button asChild><Link href="/user/workouts/active/create">Start training<ArrowRight data-icon="inline-end" /></Link></Button></CardContent></Card>
      <Button asChild variant="ghost" className="w-fit px-0"><Link href="/user/documentation"><ArrowLeft data-icon="inline-start" />Back to documentation</Link></Button>
    </PageShell>
  )
}
