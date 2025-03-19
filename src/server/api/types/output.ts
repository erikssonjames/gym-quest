import { type RouterOutput } from "../root";

// User
export type UserGetMeOutput = RouterOutput['user']['getMe']


// Workout
export type WorkoutOutput = RouterOutput["workout"]["getWorkouts"][number]
export type WorkoutActiveSessionOutput = RouterOutput["workout"]["getActiveWorkoutSession"]
export type WorkoutSessionsOutput = RouterOutput["workout"]["getWorkoutSessions"]

// Notifications 
export type NotificationsOutput = RouterOutput['notification']['getNotifications']

// Badges
export type BadgeWithProgressOutput = RouterOutput["badges"]["getBadgesWithProgress"]