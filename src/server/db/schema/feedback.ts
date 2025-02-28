import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";
import { createInsertSchema } from "drizzle-zod";

export const feedbackTypeEnum = pgEnum("feedbackType", ["bug", "feature", "improvement", "other"])

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  description: text("description").notNull(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "set null" }),
  timestamp: timestamp("timestamp").defaultNow(),
  url: text("url").notNull(),
  type: feedbackTypeEnum("type").default("other").notNull()
})

export const InsertFeedbackZod = createInsertSchema(feedback)
export type InsertFeedback = typeof feedback.$inferInsert