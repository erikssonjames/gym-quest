import { bigint, index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { users } from "./user"
import { workoutSession } from "./workout"

export const workoutExperienceReviewStatus = pgEnum("workoutExperienceReviewStatus", [
  "pending",
  "approved",
  "rejected",
])

export const experienceEvent = pgTable("experienceEvent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  sourceId: text("sourceId").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.source, table.sourceId),
  index("experience_event_user_created_idx").on(table.userId, table.createdAt),
])

export const questClaim = pgTable("questClaim", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questId: text("questId").notNull(),
  periodKey: text("periodKey").notNull(),
  experienceAwarded: bigint("experienceAwarded", { mode: "number" }).notNull(),
  claimedAt: timestamp("claimedAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.questId, table.periodKey),
  index("quest_claim_user_claimed_idx").on(table.userId, table.claimedAt),
])

export const workoutExperienceReview = pgTable("workoutExperienceReview", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutSessionId: uuid("workoutSessionId")
    .notNull()
    .references(() => workoutSession.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: workoutExperienceReviewStatus("status").default("pending").notNull(),
  proposedExperience: bigint("proposedExperience", { mode: "number" }).notNull(),
  reasons: text("reasons").array().notNull(),
  completedSetCount: integer("completedSetCount").notNull(),
  totalVolume: bigint("totalVolume", { mode: "number" }).notNull(),
  maxWeight: integer("maxWeight").notNull(),
  maxReps: integer("maxReps").notNull(),
  maxSetVolume: bigint("maxSetVolume", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt", { mode: "date", withTimezone: true }),
  reviewedBy: uuid("reviewedBy").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
  unique().on(table.workoutSessionId),
  index("workout_experience_review_status_created_idx").on(table.status, table.createdAt),
  index("workout_experience_review_user_created_idx").on(table.userId, table.createdAt),
])

export type ExperienceEvent = typeof experienceEvent.$inferSelect
export type QuestClaim = typeof questClaim.$inferSelect
export type WorkoutExperienceReview = typeof workoutExperienceReview.$inferSelect
