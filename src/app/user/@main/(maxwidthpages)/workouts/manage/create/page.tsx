import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageShell } from "@/app/user/@main/_components/page-shell"
import { Button } from "@/components/ui/button"
import CreateWorkoutForm from "./_components/workout-form"

export default function CreateWorkoutPage() {
  return (
    <PageShell
      eyebrow="Workout builder"
      title="Create a workout"
      description="Build every detail yourself, or plan with AI and review its suggestion before anything is added."
      actions={
        <Button asChild variant="ghost">
          <Link href="/user/workouts/manage">
            <ArrowLeft data-icon="inline-start" />
            Workout library
          </Link>
        </Button>
      }
      className="max-w-none px-0 py-0"
    >
      <CreateWorkoutForm />
    </PageShell>
  )
}
