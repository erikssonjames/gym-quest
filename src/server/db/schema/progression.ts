import { index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { users } from "./user"

export const experienceEvent = pgTable("experienceEvent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  sourceId: text("sourceId").notNull(),
  amount: integer("amount").notNull(),
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
  experienceAwarded: integer("experienceAwarded").notNull(),
  claimedAt: timestamp("claimedAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.questId, table.periodKey),
  index("quest_claim_user_claimed_idx").on(table.userId, table.claimedAt),
])

export type ExperienceEvent = typeof experienceEvent.$inferSelect
export type QuestClaim = typeof questClaim.$inferSelect
