import { desc } from "drizzle-orm";

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
      limit: z.number().int().min(1).max(100).default(25),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.feedPost.findMany({
        limit: input?.limit ?? 25,
        orderBy: [desc(feedPost.createdAt)],
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
