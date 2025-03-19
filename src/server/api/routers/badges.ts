import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { badge, badgeProgress, BadgeZod, InsertBadgeZod } from "@/server/db/schema/badges";
import { getCtxUserId } from "@/server/utils/user";
import { TRPCError } from "@trpc/server";
import { userProfile } from "@/server/db/schema/user";

export const badgesRouter = createTRPCRouter({
  getBadges: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.query.badge.findMany()
    }),

  getBadgesWithProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = getCtxUserId(ctx)

      return await ctx.db
        .select()
        .from(badge)
        .leftJoin(badgeProgress, and(
          eq(badgeProgress.badgeId, badge.id),
          eq(badgeProgress.userId, userId)
        ))
    }),

  addBadge: adminProcedure
    .input(InsertBadgeZod)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(badge).values(input)
    }),

  editBadge: adminProcedure
    .input(BadgeZod)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(badge).set(input).where(eq(
        badge.id, input.id
      ))
    }),

  deleteBadge: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(badge).where(eq(
        badge.id, input
      ))
    }),

  setActiveBadge: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const badgeId = input

      if (badgeId) {
        const userHasUnlockedBadge = await ctx.db.query.badgeProgress.findFirst({
          where: and(
            eq(badgeProgress.badgeId, badgeId),
            eq(badgeProgress.userId, userId),
            eq(badgeProgress.completed, true)
          )
        })
  
        if (!userHasUnlockedBadge) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can't select a badge you haven't unlocked."
          })
        }
      }

      await ctx.db.update(userProfile).set({
        selectedBadge: badgeId ?? null
      }).where(eq(userProfile.userId, userId))
    })
});
