import { relations } from "drizzle-orm"
import { muscle, muscleGroup } from "./body"
import { exercise, exercisePublicRequest, exerciseToMuscle } from "./exercise"
import { accounts, friendRequest, friendShip, sessions, userPrivateInformation, userProfile, users, userSettings } from "./user"
import { workout, workoutReview, workoutSession, workoutSessionLog, workoutSessionLogFragment, workoutSet, workoutSetCollection, workoutToUser } from "./workout"
import { friendRequestNotification, notification, workoutReviewNotification } from "./notifications"
import { badge, badgeProgress, badgeProgressEvent } from "./badges"
import { feedPost } from "./feed"
import { aiUsageEvent, aiUsagePeriod, billingCustomer, billingEntitlement, billingPlan, billingPrice, billingSubscription, ownerRevenueLedger } from "./billing"
import { weightEntry } from "./weight"
import { experienceEvent, questClaim, workoutExperienceReview } from "./progression"

// User

export const userRelations = relations(users, ({ many, one }) => ({
  savedWorkouts: many(workoutToUser),
  sessions: many(workoutSession),
  reviews: many(workoutReview),
  accounts: many(accounts),
  userSettings: one(userSettings),
  friendsShip: many(friendShip),
  friendRequests: many(friendRequest),
  userPrivateInformation: one(userPrivateInformation),
  userProfile: one(userProfile),
  badges: many(badgeProgress),
  feedPosts: many(feedPost),
  billingCustomer: one(billingCustomer),
  billingSubscriptions: many(billingSubscription),
  aiUsagePeriods: many(aiUsagePeriod),
  aiUsageEvents: many(aiUsageEvent),
  weightEntries: many(weightEntry),
  experienceEvents: many(experienceEvent),
  questClaims: many(questClaim),
  workoutExperienceReviews: many(workoutExperienceReview),
}))

export const experienceEventRelations = relations(experienceEvent, ({ one }) => ({
  user: one(users, { fields: [experienceEvent.userId], references: [users.id] }),
}))

export const questClaimRelations = relations(questClaim, ({ one }) => ({
  user: one(users, { fields: [questClaim.userId], references: [users.id] }),
}))

export const workoutExperienceReviewRelations = relations(workoutExperienceReview, ({ one }) => ({
  workoutSession: one(workoutSession, {
    fields: [workoutExperienceReview.workoutSessionId],
    references: [workoutSession.id],
  }),
}))

export const weightEntryRelations = relations(weightEntry, ({ one }) => ({
  user: one(users, { fields: [weightEntry.userId], references: [users.id] }),
}))

export const billingPlanRelations = relations(billingPlan, ({ many }) => ({
  prices: many(billingPrice),
  entitlements: many(billingEntitlement),
  subscriptions: many(billingSubscription),
}))

export const billingPriceRelations = relations(billingPrice, ({ one }) => ({
  plan: one(billingPlan, { fields: [billingPrice.planId], references: [billingPlan.id] }),
}))

export const billingEntitlementRelations = relations(billingEntitlement, ({ one }) => ({
  plan: one(billingPlan, { fields: [billingEntitlement.planId], references: [billingPlan.id] }),
}))

export const billingCustomerRelations = relations(billingCustomer, ({ one }) => ({
  user: one(users, { fields: [billingCustomer.userId], references: [users.id] }),
}))

export const billingSubscriptionRelations = relations(billingSubscription, ({ one }) => ({
  user: one(users, { fields: [billingSubscription.userId], references: [users.id] }),
  plan: one(billingPlan, { fields: [billingSubscription.planId], references: [billingPlan.id] }),
}))

export const aiUsagePeriodRelations = relations(aiUsagePeriod, ({ one, many }) => ({
  user: one(users, { fields: [aiUsagePeriod.userId], references: [users.id] }),
  events: many(aiUsageEvent),
}))

export const aiUsageEventRelations = relations(aiUsageEvent, ({ one }) => ({
  user: one(users, { fields: [aiUsageEvent.userId], references: [users.id] }),
  period: one(aiUsagePeriod, { fields: [aiUsageEvent.periodId], references: [aiUsagePeriod.id] }),
}))

export const ownerRevenueLedgerRelations = relations(ownerRevenueLedger, () => ({}))

export const userPrivateInformationRelations = relations(userPrivateInformation, ({ one }) => ({
  user: one(users, { fields: [userPrivateInformation.userId], references: [users.id] })
}))

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, { fields: [userProfile.userId], references: [users.id] }),
  badge: one(badge, { fields: [userProfile.selectedBadge], references: [badge.id] })
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

export const friendShipRelations = relations(friendShip, ({ one }) => ({
  userOneUser: one(users, {
    fields: [friendShip.userOne],
    references: [users.id],
  }),
  userTwoUser: one(users, {
    fields: [friendShip.userTwo],
    references: [users.id],
  }),
}));

export const friendRequestRelation = relations(friendRequest, ({ one }) => ({
  fromUser: one(users, {
    fields: [friendRequest.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [friendRequest.toUserId],
    references: [users.id],
  }),
}))

// Feed

export const feedPostRelations = relations(feedPost, ({ one }) => ({
  author: one(users, {
    fields: [feedPost.userId],
    references: [users.id]
  })
}))

// Badge

export const badgeRelations = relations(badge, ({ many }) => ({
  badgeProgresses: many(badgeProgress),
  userProfiles: many(userProfile)
}))

export const badgeProgressRelations = relations(badgeProgress, ({ one, many }) => ({
  user: one(users, {
    fields: [badgeProgress.userId],
    references: [users.id]
  }),
  badge: one(badge, {
    fields: [badgeProgress.badgeId],
    references: [badge.id]
  }),
  progressEvents: many(badgeProgressEvent)
}))

export const badgeProgressEventRelations = relations(badgeProgressEvent, ({ one }) => ({
  badgeProgress: one(badgeProgress, {
    fields: [badgeProgressEvent.badgeProgressId],
    references: [badgeProgress.id]
  })
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

export const workoutSetCollectionRelations = relations(workoutSetCollection, ({ one }) => ({
  workoutSet: one(workoutSet, {
    fields: [workoutSetCollection.workoutSetId],
    references: [workoutSet.id]
  }),
  exercise: one(exercise, {
    fields: [workoutSetCollection.exerciseId],
    references: [exercise.id]
  })
}));

export const workoutReviewRelations = relations(workoutReview, ({ one }) => ({
  workout: one(workout, {
    fields: [workoutReview.workoutId],
    references: [workout.id]
  }),
  user: one(users, {
    fields: [workoutReview.userId],
    references: [users.id]
  }),
  workoutReviewNotifications: one(workoutReviewNotification)
}));

export const workoutSessionRelations = relations(workoutSession, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutSession.workoutId],
    references: [workout.id]
  }),
  workoutSessionLogs: many(workoutSessionLog),
  experienceReview: one(workoutExperienceReview),
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

// Notifications

export const notificationRelations = relations(notification, ({ one }) => ({
  friendRequest: one(friendRequestNotification),
  workoutReview: one(workoutReviewNotification)
}))

export const friendRequestNotificationRelations = relations(friendRequestNotification, ({ one }) => ({
  notification: one(notification, {
    fields: [friendRequestNotification.notificationId],
    references: [notification.id]
  }),
  friendRequest: one(friendRequest, {
    fields: [friendRequestNotification.friendRequestId],
    references: [friendRequest.id]
  })
}))

export const workoutReviewNotificationRelations = relations(workoutReviewNotification, ({ one }) => ({
  notification: one(notification, {
    fields: [workoutReviewNotification.notificationId],
    references: [notification.id]
  }),
  workoutReview: one(workoutReview, {
    fields: [workoutReviewNotification.workoutReviewId],
    references: [workoutReview.id]
  })
}))
