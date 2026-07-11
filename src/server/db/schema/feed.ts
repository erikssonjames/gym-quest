import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

import { users } from "./user";

export const feedPost = pgTable("feedPost", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow().notNull(),
}, (t) => [
  index("feed_post_created_idx").on(t.createdAt),
  index("feed_post_user_created_idx").on(t.userId, t.createdAt),
]);

export const InsertFeedPostZod = createInsertSchema(feedPost, {
  content: z.string().trim().min(1, "Write something before posting.").max(1000, "Posts can be at most 1000 characters."),
}).pick({
  content: true,
});

export type FeedPost = typeof feedPost.$inferSelect;
export type InsertFeedPost = z.infer<typeof InsertFeedPostZod>;
