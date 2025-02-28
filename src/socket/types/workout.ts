import type { Workout, WorkoutSession } from "@/server/db/schema/workout";
import type { WorkoutEvent } from "../enums/workout";
import { EmojiDefinition } from "@/variables/emojis/types";

export interface WorkoutSocketEventPayloads {
  [WorkoutEvent.NEW_PUBLIC_WORKOUT]: {
    workout: Workout;
    userId: string;
    sentAt: Date;
  };
  [WorkoutEvent.STARTED_NEW_WORKOUT]: {
    workoutSession: WorkoutSession
    userId: string;
    sentAt: Date;
  }
  [WorkoutEvent.ENDED_WORKOUT]: {
    userId: string;
    sentAt: Date;
  },
  [WorkoutEvent.REACTED_TO_FRIEND_WORKOUT]: {
    userId: string;
    sentAt: Date;
    emoji: EmojiDefinition["emoji"]
  }
}
