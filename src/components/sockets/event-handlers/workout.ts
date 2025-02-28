import { WorkoutEvent } from "@/socket/enums/workout";
import type { WorkoutSocketEventPayloads } from "@/socket/types/workout";
import { api } from "@/trpc/react";

type SocketEventHandlerFunction<T extends keyof WorkoutSocketEventPayloads> = (data: WorkoutSocketEventPayloads[T]) => Promise<void> | void;

export function useWorkoutSocketEventHandlers() {
  const utils = api.useUtils();
  const { data: workouts } = api.workout.getWorkouts.useQuery()

  const workoutFunctionsMap: { [K in keyof WorkoutSocketEventPayloads]: SocketEventHandlerFunction<K> } = {
    [WorkoutEvent.STARTED_NEW_WORKOUT]: async (data) => {
      console.log('WorkoutEvent.STARTED_NEW_WORKOUT @@@')
      if (workouts?.some(w => w.id !== data.workoutSession.workoutId)) {
        await utils.workout.invalidate()
      } else {
        console.log('Should invalidate getFriendsActiveWorkoutSessions')
        void utils.workout.getFriendsActiveWorkoutSessions.invalidate()
      }
    },
    [WorkoutEvent.NEW_PUBLIC_WORKOUT]: (data) => {
      const { workout } = data
      if (workouts?.some(w => w.id === workout.id)) return
      void utils.workout.invalidate()
    },
    [WorkoutEvent.ENDED_WORKOUT]: () => {
      void utils.workout.getFriendsActiveWorkoutSessions.invalidate()
    },
    [WorkoutEvent.REACTED_TO_FRIEND_WORKOUT]: (data) => {
      console.log(`User: ${data.userId} reacted to your active workout, with emoji ${data.emoji}`)
    }
  };

  return { workoutFunctionsMap };
}
