import Link from "next/link"
import { SquarePlus } from "lucide-react"

import { PageShell } from "@/app/user/@main/_components/page-shell"
import { Button } from "@/components/ui/button"
import DisplayExercises from "./_components/display-exercises"

export default function ExercisesPage () {
  return (
    <PageShell
      eyebrow="Movement library"
      title="Exercises"
      description="Find movements by name, muscle group, or visibility, then keep your personal library organized."
      actions={(
        <Button asChild>
          <Link href="/user/exercises/create">
            <SquarePlus data-icon="inline-start" />
            Create exercise
          </Link>
        </Button>
      )}
    >
      <DisplayExercises />
    </PageShell>
  )
}
