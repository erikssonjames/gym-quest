import { relations } from "drizzle-orm"
import { muscle, muscleGroup } from "./body"
import { exercise, exercisePublicRequest, exerciseToMuscle } from "./exercise"
import { accounts, sessions, users, userSettings } from "./user"
import { workout, workoutReview, workoutSession, workoutSessionLog, workoutSessionLogFragment, workoutSet, workoutSetCollection, workoutToUser } from "./workout"

// User

export const userRelations = relations(users, ({ many, one }) => ({
  savedWorkouts: many(workoutToUser),
  sessions: many(workoutSession),
  reviews: many(workoutReview),
  accounts: many(accounts),
  userSettings: one(userSettings)
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] })
}))

// Exercise

export const exerciseRelations = relations(exercise, ({ many, one }) => ({
  muscles: many(exerciseToMuscle),
  sessionLogs: many(workoutSessionLog),
  setCollections: many(workoutSetCollection),
  requestToBePublic: one(exercisePublicRequest)
}))

export const exercisePublicRequestRelations = relations(exercisePublicRequest, ({ one }) => ({
  exercise: one(exercise, {
    fields: [exercisePublicRequest.exerciseId],
    references: [exercise.id]
  })
}))

// Body

export const muscleGroupRelations = relations(muscleGroup, ({ many }) => ({
  muscles: many(muscle)
}))

export const muscleRelations = relations(muscle, ({ one, many }) => ({
  muscleGroup: one(muscleGroup, {
    fields: [muscle.muscleGroupId],
    references: [muscleGroup.id]
  }),
  exercises: many(exerciseToMuscle)
}))

// Exercise + Body

export const exerciseToMuscleRelations = relations(exerciseToMuscle, ({ one }) => ({
  muscle: one(muscle, {
    fields: [exerciseToMuscle.muscleId],
    references: [muscle.id]
  }),
  exercise: one(exercise, {
    fields: [exerciseToMuscle.exerciseId],
    references: [exercise.id]
  })
}))

// Workout

export const workoutRelations = relations(workout, ({ one, many }) => ({
  user: one(users, {
    fields: [workout.userId],
    references: [users.id]
  }),
  savedByUsers: many(workoutToUser),
  workoutSets: many(workoutSet),
  reviews: many(workoutReview),
  sessions: many(workoutSession)
}));

export const workoutSetRelations = relations(workoutSet, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutSet.workoutId],
    references: [workout.id]
  }),
  workoutSetCollections: many(workoutSetCollection)
}));

export const workoutSetCollectionRelations = relations(workoutSetCollection, ({ one, many }) => ({
  workoutSet: one(workoutSet, {
    fields: [workoutSetCollection.workoutSetId],
    references: [workoutSet.id]
  }),
  exercise: one(exercise, {
    fields: [workoutSetCollection.exerciseId],
    references: [exercise.id]
  }),
  workoutSessionLogs: many(workoutSessionLog)
}));

export const workoutReviewRelations = relations(workoutReview, ({ one }) => ({
  workout: one(workout, {
    fields: [workoutReview.workoutId],
    references: [workout.id]
  }),
  user: one(users, {
    fields: [workoutReview.userId],
    references: [users.id]
  })
}));

export const workoutSessionRelations = relations(workoutSession, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutSession.workoutId],
    references: [workout.id]
  }),
  workoutSessionLogs: many(workoutSessionLog)
}))

export const workoutSessionLogRelations = relations(workoutSessionLog, ({ one, many }) => ({
  workoutSession: one(workoutSession, {
    fields: [workoutSessionLog.workoutSessionId],
    references: [workoutSession.id]
  }),
  exercise: one(exercise, {
    fields: [workoutSessionLog.exerciseId],
    references: [exercise.id]
  }),
  workoutSetCollection: one(workoutSetCollection, {
    fields: [workoutSessionLog.exerciseId],
    references: [workoutSetCollection.id]
  }),
  workoutSessionLogFragments: many(workoutSessionLogFragment),
}))

export const workoutSessionLogFragmentRelations = relations(workoutSessionLogFragment, ({ one }) => ({
  workoutSessionLog: one(workoutSessionLog, {
    fields: [workoutSessionLogFragment.workoutSessionLogId],
    references: [workoutSessionLog.id]
  }),
}))

// Workout + User

export const workoutToUserRelations = relations(workoutToUser, ({ one }) => ({
  workout: one(workout, {
    fields: [workoutToUser.workoutId],
    references: [workout.id]
  }),
  user: one(users, {
    fields: [workoutToUser.userId],
    references: [users.id]
  })
}))
