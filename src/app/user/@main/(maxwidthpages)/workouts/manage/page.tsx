"use client"

import { Button } from "@/components/ui/button";
import { Grid2X2, SquarePlus } from "lucide-react";
import Link from "next/link";
import DisplayWorkouts from "../_components/display-workouts";
import { api } from "@/trpc/react";
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default function ManagePage () {
  const { data: workouts, isLoading } = api.workout.getWorkouts.useQuery()

  return (
    <PageShell eyebrow="Workout library" title="Manage your workouts" description="Keep your personal plans organized, reusable, and ready for the next session." actions={<>
          <Button size="sm" className="h-8" asChild>
            <Link href="/user/workouts/browse">
              <Grid2X2 />
              Browse
            </Link>
          </Button>
          <Button size="sm" className="h-8" asChild>
            <Link href="/user/workouts/manage/create">
              <SquarePlus />
              Create
            </Link>
          </Button>
        </>}>
      <DisplayWorkouts workouts={workouts} loading={isLoading} />
    </PageShell>
  )
}
