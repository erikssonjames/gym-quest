"use client"

import Link from "next/link"
import { ArrowRight, Award, CalendarDays, Dumbbell, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState, MetricCard, PageSection } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/react"
import { useIsMyProfilePage } from "../_hooks/useIsMyProfilePage"

export default function Body () {
  const isMine = useIsMyProfilePage()
  const { data: workouts, isPending: workoutsPending } = api.workout.getWorkouts.useQuery(undefined, { enabled: isMine })
  const { data: sessions, isPending: sessionsPending } = api.workout.getWorkoutSessions.useQuery(undefined, { enabled: isMine })
  const { data: badges, isPending: badgesPending } = api.badges.getBadgesWithProgress.useQuery(undefined, { enabled: isMine })
  const unlockedBadges = badges?.filter(({ badgeProgress }) => badgeProgress?.completed).length ?? 0

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Workouts" value={workoutsPending ? "..." : String(workouts?.length ?? 0)} detail={isMine ? "Plans in your library" : "Public plans"} /><MetricCard label="Sessions" value={sessionsPending ? "..." : String(sessions?.length ?? 0)} detail={isMine ? "Completed sessions" : "Visible activity"} /><MetricCard label="Badges" value={badgesPending ? "..." : String(unlockedBadges)} detail={isMine ? "Milestones unlocked" : "Selected badge"} /></div>

      {isMine ? <>
        <PageSection title="Training snapshot" description="A quick view of the work behind your profile."><div className="grid gap-3 md:grid-cols-3"><Card><CardContent className="flex items-start gap-3 p-5"><Dumbbell className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Workout library</p><p className="mt-1 text-sm text-muted-foreground">{workouts?.length ?? 0} plan{workouts?.length === 1 ? "" : "s"} ready to use.</p></div></CardContent></Card><Card><CardContent className="flex items-start gap-3 p-5"><CalendarDays className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Recent rhythm</p><p className="mt-1 text-sm text-muted-foreground">{sessions?.[0]?.endedAt ? "Your latest session is recorded." : "Complete a session to start your record."}</p></div></CardContent></Card><Card><CardContent className="flex items-start gap-3 p-5"><Award className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Achievement progress</p><p className="mt-1 text-sm text-muted-foreground">{unlockedBadges} milestone{unlockedBadges === 1 ? "" : "s"} unlocked.</p></div></CardContent></Card></div></PageSection>
        <PageSection title="Keep going" action={<Button asChild variant="outline" size="sm"><Link href="/user/workouts">View workouts<ArrowRight data-icon="inline-end" /></Link></Button>}><Card><CardHeader><CardTitle className="text-base">Your profile is a training record</CardTitle></CardHeader><CardContent className="flex flex-col gap-3 pt-0"><p className="max-w-2xl text-sm leading-6 text-muted-foreground">Use the feed to share the work, history to review it, and achievements to mark the moments worth remembering.</p><div className="flex flex-wrap gap-2"><Button asChild size="sm"><Link href="/user/workouts/active/create">Start a workout</Link></Button><Button asChild size="sm" variant="secondary"><Link href="/user/achievements">View achievements</Link></Button></div></CardContent></Card></PageSection>
      </> : <EmptyState title="Public profile view" description="This profile shows public training information. Private sessions and personal settings stay visible only to the owner." action={<Button asChild variant="outline"><Link href="/user/friends"><Users data-icon="inline-start" />Back to your circle</Link></Button>} />}
    </div>
  )
}
