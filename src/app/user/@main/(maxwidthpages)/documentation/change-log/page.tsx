import Link from "next/link"
import { ArrowLeft, CalendarDays, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSection, PageShell } from "@/app/user/@main/_components/page-shell"

const releases = [
  { version: "Current", date: "July 2026", title: "A calmer training home", updates: ["Renewed news feed layout", "Searchable exercise picker", "AI workout builder boundary", "Achievement progress gallery"] },
  { version: "Foundation", date: "Earlier release", title: "Make the work visible", updates: ["Workout session tracking", "Friend requests and profiles", "Badge progress events", "Email verification during signup"] },
]

export default function ChangeLogPage () {
  return <PageShell eyebrow="Product notes" title="Change log" description="A concise record of the changes that shape how GymQuest feels and works."><PageSection title="Recent releases"><div className="space-y-4">{releases.map((release) => <Card key={release.version}><CardHeader className="gap-3 border-b"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{release.version}</Badge><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{release.date}</span></div><CardTitle className="text-xl">{release.title}</CardTitle></CardHeader><CardContent className="grid gap-3 p-5 sm:grid-cols-2">{release.updates.map((update) => <div key={update} className="flex items-start gap-2 text-sm"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /><span>{update}</span></div>)}</CardContent></Card>)}</div></PageSection><Button asChild variant="ghost" className="w-fit px-0"><Link href="/user/documentation"><ArrowLeft data-icon="inline-start" />Back to documentation</Link></Button></PageShell>
}
