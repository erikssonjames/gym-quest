"use client"

import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography/h3";
import { Grid2X2, SquarePlus } from "lucide-react";
import Link from "next/link";
import DisplayWorkouts from "../_components/display-workouts";
import { api } from "@/trpc/react";

export default function ManagePage () {
  const { data: workouts, isLoading } = api.workout.getWorkouts.useQuery()

  return (
    <>
      <div className="flex justify-between items-center">
        <H3 text="Your workouts" className="hidden md:block" />

        <div className="flex gap-2">
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
        </div>
      </div>

      <DisplayWorkouts workouts={workouts} loading={isLoading} />
    </>
  )
}