import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import StickyHeader from "./_components/sticky-header";
import ActiveWorkoutDisplay from "./_components/active-workout-display";
import WorkoutController from "./_components/workout-controller";
import RedirectIfNoActiveSession from "./_components/redirect-if-no-active-session";

export default async function ActiveWorkoutPage () {
  const activeSession = await api.workout.getActiveWorkoutSession()

  if (!activeSession) {
    redirect("/user/workouts")
  }

  return (
    <>
      <RedirectIfNoActiveSession />

      <StickyHeader />
      <ActiveWorkoutDisplay />
      <WorkoutController />
    </>
  )
}