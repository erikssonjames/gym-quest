import { type RouterOutput } from "../root";

export type UserGetMeOutput = RouterOutput['user']['getMe']

export type WorkoutOutput = RouterOutput["workout"]["getWorkouts"][number]

export type WorkoutActiveSessionOutput = RouterOutput["workout"]["getActiveWorkoutSession"]

export type WorkoutSessionsOutput = RouterOutput["workout"]["getWorkoutSessions"]