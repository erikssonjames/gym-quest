import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { questClaim } from "./progression"
import { users } from "./user"
import { workoutSession } from "./workout"

export const feedPostKind = pgEnum("feedPostKind", ["status", "workout", "quest"])
export const feedReportReason = pgEnum("feedReportReason", [
  "spam",
  "harassment",
  "hate-or-abuse",
  "unsafe-or-misleading",
  "other",
])
export const feedReportStatus = pgEnum("feedReportStatus", ["pending", "kept", "removed"])

export type WorkoutRecordSnapshot = {
  exerciseId: string
  exerciseName: string
  metric: "weight" | "set-volume"
  previousValue: number
  value: number
  weight: number
  reps: number
}

export type WorkoutShareSnapshot = {
  workoutName: string
  completedAt: string
  durationSeconds: number
  exerciseCount: number
  completedSetCount: number
  totalReps: number
  totalVolume: number
  experienceAwarded: number
  beforeLevel: number
  afterLevel: number
  bestSet: null | {
    exerciseName: string
    reps: number
    weight: number
    volume: number
  }
  records: WorkoutRecordSnapshot[]
}

export type QuestShareSnapshot = {
  questId: string
  title: string
  cadence: "daily" | "weekly" | "journey"
  target: number
  unit: string
  periodKey: string
  claimedAt: string
  experienceAwarded: number
}

export const feedPost = pgTable("feedPost", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  kind: feedPostKind("kind").default("status").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  imagePublicId: text("imagePublicId"),
  imageWidth: integer("imageWidth"),
  imageHeight: integer("imageHeight"),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow().notNull(),
  pinnedAt: timestamp("pinnedAt", { mode: "date", withTimezone: true }),
  pinnedBy: uuid("pinnedBy").references(() => users.id, { onDelete: "set null" }),
  removedAt: timestamp("removedAt", { mode: "date", withTimezone: true }),
  removedBy: uuid("removedBy").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
  index("feed_post_created_idx").on(table.createdAt),
  index("feed_post_user_created_idx").on(table.userId, table.createdAt),
  index("feed_post_pinned_idx").on(table.pinnedAt),
  index("feed_post_active_kind_idx").on(table.removedAt, table.kind, table.createdAt),
  check(
    "feed_status_has_content",
    sql`${table.kind} <> 'status' OR ${table.description} IS NOT NULL OR ${table.imageUrl} IS NOT NULL`,
  ),
])

export const feedWorkoutShare = pgTable("feedWorkoutShare", {
  postId: uuid("postId")
    .primaryKey()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  workoutSessionId: uuid("workoutSessionId")
    .references(() => workoutSession.id, { onDelete: "set null" }),
  snapshot: jsonb("snapshot").$type<WorkoutShareSnapshot>().notNull(),
}, (table) => [unique().on(table.workoutSessionId)])

export const feedQuestShare = pgTable("feedQuestShare", {
  postId: uuid("postId")
    .primaryKey()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  questClaimId: uuid("questClaimId")
    .references(() => questClaim.id, { onDelete: "set null" }),
  snapshot: jsonb("snapshot").$type<QuestShareSnapshot>().notNull(),
}, (table) => [unique().on(table.questClaimId)])

export const feedPostComment = pgTable("feedPostComment", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("postId")
    .notNull()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("feed_comment_post_created_idx").on(table.postId, table.createdAt),
  index("feed_comment_user_created_idx").on(table.userId, table.createdAt),
  check(
    "feed_comment_content_length",
    sql`char_length(${table.content}) BETWEEN 1 AND 500`,
  ),
])

export const feedPostReaction = pgTable("feedPostReaction", {
  postId: uuid("postId")
    .notNull()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.postId, table.userId] }),
  index("feed_reaction_post_emoji_idx").on(table.postId, table.emoji),
])

export const feedPostReport = pgTable("feedPostReport", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("postId")
    .notNull()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  reporterId: uuid("reporterId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: feedReportReason("reason").notNull(),
  details: text("details"),
  status: feedReportStatus("status").default("pending").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt", { mode: "date", withTimezone: true }),
  resolvedBy: uuid("resolvedBy").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
  unique().on(table.postId, table.reporterId),
  index("feed_report_status_created_idx").on(table.status, table.createdAt),
  index("feed_report_post_status_idx").on(table.postId, table.status),
])

export const feedPostHidden = pgTable("feedPostHidden", {
  postId: uuid("postId")
    .notNull()
    .references(() => feedPost.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.postId, table.userId] })])

export const userBlock = pgTable("userBlock", {
  blockerId: uuid("blockerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blockedId: uuid("blockedId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.blockerId, table.blockedId] }),
  index("user_block_blocked_idx").on(table.blockedId, table.blockerId),
  check("user_block_not_self", sql`${table.blockerId} <> ${table.blockedId}`),
])

export const FeedImageInputZod = z.object({
  name: z.string().min(1).max(255),
  type: z.string().regex(/^image\/(jpeg|png|webp)$/),
  base64: z.string().max(12_000_000),
})

export const FeedDescriptionZod = z.string()
  .trim()
  .min(1, "Write something before posting.")
  .max(1000, "Posts can be at most 1000 characters.")

export const CreateFeedPostZod = z.object({
  description: FeedDescriptionZod.optional(),
  image: FeedImageInputZod.optional(),
}).refine((value) => value.description || value.image, {
  message: "Add a description or picture before posting.",
})

export const ShareFeedPostFieldsZod = z.object({
  description: FeedDescriptionZod.optional(),
  image: FeedImageInputZod.optional(),
})

export const FeedCommentZod = z.string()
  .trim()
  .min(1, "Write a comment before sending.")
  .max(500, "Comments can be at most 500 characters.")

export type FeedPost = typeof feedPost.$inferSelect
export type InsertFeedPost = z.infer<typeof CreateFeedPostZod>
