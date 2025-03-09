import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const badge = pgTable("badge", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  group: text("group")
});

export const badgeToUser = pgTable(
  "badgeToUser", {
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    badgeId: uuid("badgeId")
      .references(() => badge.id, { onDelete: "cascade" })
      .notNull()
  }, 
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })]
)
