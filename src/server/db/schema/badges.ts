import { boolean, integer, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const badge = pgTable("badge", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  valueToComplete: integer("valueToComplete").notNull(),
  valueName: text("valueName").notNull(),
  valueDescription: text("valueDescription").notNull(),
  group: text("group").notNull(),
  groupWeighting: integer("groupWeighting").notNull(),
  percentageOfUsersHasBadge: real("percentageOfUsersHasBadge").notNull()
});

export const badgeProgress = pgTable(
  "badgeProgress", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    badgeId: text("badgeId")
      .references(() => badge.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull()
  },
  (t) => [unique().on(t.userId, t.badgeId)]
)

export const badgeProgressEvent = pgTable("badgeProgressEvent", {
  id: uuid("id").defaultRandom().primaryKey(),
  badgeProgressId: uuid("badgeProgressId")
    .notNull()
    .references(() => badgeProgress.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  value: integer("value").notNull()
})

export type InsertBadge = typeof badge.$inferSelect
export const InsertBadgeZod = createInsertSchema(badge)

export type Badge = typeof badge.$inferSelect
export const BadgeZod = createSelectSchema(badge)
