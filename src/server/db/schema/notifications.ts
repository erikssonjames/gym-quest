import { boolean, index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { friendRequest, users } from "./user";
import { workoutReview } from "./workout";

export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  hidden: boolean("hidden").default(false).notNull(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
}, (t) => [
  index("notification_user_created_idx").on(t.userId, t.createdAt),
  index("notification_user_hidden_idx").on(t.userId, t.hidden),
])

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
