"use client"

import Link from "next/link"
import { ArrowRight, Bell, CircleUserRound, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

export default function GeneralSettings () {
  const { data: user, isPending } = api.user.getMe.useQuery()

  if (isPending) return <div className="space-y-4"><Skeleton className="h-36 w-full rounded-xl" /><Skeleton className="h-56 w-full rounded-xl" /></div>

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader className="gap-3"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CircleUserRound className="size-5" /></div><div><CardTitle>Account identity</CardTitle><CardDescription>How GymQuest recognizes you across the app.</CardDescription></div></div></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border bg-background/70 p-3"><p className="text-xs text-muted-foreground">Username</p><p className="mt-1 font-medium">{user?.username ?? "Not set"}</p></div><div className="rounded-lg border bg-background/70 p-3"><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 truncate font-medium">{user?.email}</p></div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Choose how you want to use the product. More preference controls can be added here without changing the main navigation.</CardDescription></CardHeader>
        <CardContent className="divide-y"><div className="flex items-center justify-between gap-4 py-4 first:pt-0"><div className="flex items-start gap-3"><Bell className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Notifications</p><p className="text-sm text-muted-foreground">Friend requests, workout reviews, and activity updates.</p></div></div><Badge variant="secondary">Live</Badge></div><div className="flex items-center justify-between gap-4 py-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Privacy</p><p className="text-sm text-muted-foreground">Public workouts and profile visibility are controlled per feature.</p></div><Button asChild size="sm" variant="outline"><Link href="/user/profile/@me">View profile<ArrowRight data-icon="inline-end" /></Link></Button></div></div><div className="flex items-center justify-between gap-4 py-4 last:pb-0"><div className="flex items-start gap-3"><SlidersHorizontal className="mt-0.5 size-4 text-primary" /><div><p className="font-medium">Appearance</p><p className="text-sm text-muted-foreground">Theme and border radius are available in the appearance panel.</p></div></div><Button asChild size="sm" variant="outline"><Link href="/user/settings/appearance">Customize<ArrowRight data-icon="inline-end" /></Link></Button></div></CardContent>
      </Card>
    </div>
  )
}
