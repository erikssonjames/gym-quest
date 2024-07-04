import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./user";

export const posts = pgTable(
    "post",
    {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 256 }),
      createdById: varchar("createdById", { length: 255 })
        .notNull()
        .references(() => users.id),
      createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
      updatedAt: timestamp("updatedAt", { withTimezone: true }),
    },
    (example) => ({
      createdByIdIdx: index("createdById_idx").on(example.createdById),
      nameIndex: index("name_idx").on(example.name),
    })
  );
  