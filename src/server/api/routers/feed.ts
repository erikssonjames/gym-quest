import { and, desc, eq, lt, or } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { feedPost, InsertFeedPostZod } from "@/server/db/schema/feed";
import { getCtxUserId } from "@/server/utils/user";
import { z } from "zod";

export const feedRouter = createTRPCRouter({
  getLatestPosts: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(10),
      scope: z.enum(["community", "mine"]).default("community"),
      cursor: z.object({
        createdAt: z.date(),
        id: z.string().uuid(),
      }).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const userId = getCtxUserId(ctx);
      const scopeCondition = input?.scope === "mine"
        ? eq(feedPost.userId, userId)
        : undefined;
      const cursorCondition = input?.cursor
        ? or(
          lt(feedPost.createdAt, input.cursor.createdAt),
          and(
            eq(feedPost.createdAt, input.cursor.createdAt),
            lt(feedPost.id, input.cursor.id),
          ),
        )
        : undefined;
      const where = scopeCondition && cursorCondition
        ? and(scopeCondition, cursorCondition)
        : scopeCondition ?? cursorCondition;

      const rows = await ctx.db.query.feedPost.findMany({
        limit: limit + 1,
        orderBy: [desc(feedPost.createdAt), desc(feedPost.id)],
        where,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              username: true,
              image: true,
              uploadedImage: true,
            },
          },
        },
      });

      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit);
      const lastItem = items.at(-1);

      return {
        items,
        nextCursor: hasMore && lastItem
          ? { createdAt: lastItem.createdAt, id: lastItem.id }
          : undefined,
      };
    }),

  createPost: protectedProcedure
    .input(InsertFeedPostZod)
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx);

      const [createdPost] = await ctx.db
        .insert(feedPost)
        .values({
          content: input.content,
          userId,
        })
        .returning();

      return createdPost;
    }),
});
