import ActiveWorkouts from "./_components/active-workouts";
import WorkoutHistory from "./_components/workout-history";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageShell } from "@/app/user/@main/_components/page-shell"
import { ArrowRight, LibraryBig } from "lucide-react"

export default function WorkoutsPage () {
  return (
    <PageShell
      eyebrow="Training hub"
      title="Your workouts"
      description="Start a session, return to a plan, or use your history to decide what is useful next."
      actions={<><Button asChild variant="outline"><Link href="/user/workouts/browse"><LibraryBig />Browse plans</Link></Button><Button asChild><Link href="/user/workouts/manage/create">Create workout<ArrowRight data-icon="inline-end" /></Link></Button></>}
    >
      <ActiveWorkouts />
      <WorkoutHistory />
    </PageShell>
  )
}
