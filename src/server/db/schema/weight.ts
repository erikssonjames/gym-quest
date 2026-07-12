import { sql } from "drizzle-orm"
import {
  check,
  date,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "./user"

export const weightEntry = pgTable("weightEntry", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recordedOn: date("recordedOn", { mode: "string" }).notNull(),
  weightGrams: integer("weightGrams").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("weight_entry_user_date_unique").on(table.userId, table.recordedOn),
  index("weight_entry_user_date_idx").on(table.userId, table.recordedOn),
  check("weight_entry_reasonable_range", sql`${table.weightGrams} BETWEEN 20000 AND 500000`),
])

export type WeightEntry = typeof weightEntry.$inferSelect
