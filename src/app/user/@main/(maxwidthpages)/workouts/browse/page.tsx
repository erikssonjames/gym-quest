import DisplayWorkouts from "../_components/display-workouts";
import { api } from "@/trpc/server";
import { PageShell } from "@/app/user/@main/_components/page-shell"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default async function BrowseWorkoutsPage () {
  const workouts = await api.workout.getPublicWorkouts()

  return (
    <PageShell eyebrow="Community library" title="Browse workouts" description="Find public plans that fit your time, equipment, and current training focus." actions={<Button asChild variant="outline"><Link href="/user/workouts/manage/create">Create your own<ArrowRight data-icon="inline-end" /></Link></Button>}>
      <DisplayWorkouts workouts={workouts} loading={false} />
    </PageShell>
  )
}
