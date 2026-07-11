"use client"

import { Button } from "@/components/ui/button";
import { SquarePlus } from "lucide-react";
import Link from "next/link";
import DisplayExercises from "./_components/display-exercises";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks"
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default function ExercisesPage () {
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue, 200)

  return (
    <PageShell eyebrow="Movement library" title="Exercises" description="Search your exercise library by movement, description, or muscle group." actions={<div className="flex gap-2">
          <Button size="sm" className="h-8" asChild>
            <Link href="/user/exercises/create">
              <SquarePlus />
              <span className="hidden md:inline">Create</span>
            </Link>
          </Button>
        </div>}>
      <Input className="h-10 max-w-xl" value={searchValue} placeholder="Search exercises or muscles..." onChange={(e) => setSearchValue(e.target.value)} />
      <DisplayExercises search={debouncedSearchValue} />
    </PageShell>
  )
}
