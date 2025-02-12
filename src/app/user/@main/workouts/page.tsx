import ActiveWorkouts from "./_components/active-workouts";
import WorkoutHistory from "./_components/workout-history";

export default function WorkoutsPage () {
  return (
    <div className="space-y-4">
      <ActiveWorkouts />
      <WorkoutHistory />
    </div>
  )
}