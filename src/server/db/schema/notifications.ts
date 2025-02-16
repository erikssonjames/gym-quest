import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { friendRequest, users } from "./user";
import { workoutReview } from "./workout";

export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  hidden: boolean("hidden").default(false),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
})

export const friendRequestNotification = pgTable("friendRequestNotification", {
  notificationId: uuid("notificationId")
    .references(() => notification.id, { onDelete: "cascade" })
    .notNull(),
  friendRequestId: uuid("friendRequestId")
    .references(() => friendRequest.id, { onDelete: "cascade" })
    .notNull()
})

export const workoutReviewNotification = pgTable("workoutReviewNotification", {
  notificationId: uuid("notificationId")
    .references(() => notification.id, { onDelete: "cascade" })
    .notNull(),
  workoutReviewId: uuid("workoutReviewId")
    .references(() => workoutReview.id, { onDelete: "cascade" })
    .notNull()
})

export type Notification = typeof notification.$inferSelect