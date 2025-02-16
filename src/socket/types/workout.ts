import type { Workout } from "@/server/db/schema/workout";
import type { WorkoutEvent } from "../enums/workout";

export interface WorkoutSocketEventPayloads {
  [WorkoutEvent.NEW_PUBLIC_WORKOUT]: {
    workout: Workout;
    userId: string;
    sentAt: Date;
  };
}
