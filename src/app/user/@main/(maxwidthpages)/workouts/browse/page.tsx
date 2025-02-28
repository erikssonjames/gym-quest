import { H3 } from "@/components/typography/h3";
import DisplayWorkouts from "../_components/display-workouts";
import { api } from "@/trpc/server";

export default async function BrowseWorkoutsPage () {
  const workouts = await api.workout.getPublicWorkouts()

  return (
    <>
      <div className="flex justify-between items-center">
        <H3 text="Browse workouts" />
      </div>

      <DisplayWorkouts workouts={workouts} loading={false} />
    </>
  )
}