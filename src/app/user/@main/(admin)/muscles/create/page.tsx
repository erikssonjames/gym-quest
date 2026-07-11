import CreateMuscleForm from "./_components/create-muscle-form";
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default function MusclesCreatePage () {
  return (
    <PageShell eyebrow="Admin" title="Add a muscle" description="Add a clear, searchable movement category for exercise creators." className="h-full">
      <CreateMuscleForm />
    </PageShell>
  )
}
