import { Button } from "@/components/ui/button";
import { SquarePlus } from "lucide-react";
import Link from "next/link";
import DisplayMuscles from "./_components/display-muscles";
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default function MusclesPage () {
  return (
    <PageShell eyebrow="Admin" title="Muscle library" description="Maintain the movement taxonomy that powers exercise search and workout planning." actions={<div className="flex gap-2">
          <Button size="sm" className="h-8" asChild>
            <Link href="/user/muscles/create">
              <SquarePlus />
                Create
            </Link>
          </Button>
        </div>}>
      <DisplayMuscles />
    </PageShell>
  )
}
