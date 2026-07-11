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
import { userProfile, users } from "@/server/db/schema/user";
import { ensureBadgeProgressRows } from "@/server/services/user-provisioning";

export const badgesRouter = createTRPCRouter({
  getBadges: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.query.badge.findMany()
    }),

  getBadgesWithProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = getCtxUserId(ctx)
      await ensureBadgeProgressRows(ctx.db, userId)

      const rows = await ctx.db
        .select()
        .from(badge)
        .leftJoin(badgeProgress, and(
          eq(badgeProgress.badgeId, badge.id),
          eq(badgeProgress.userId, userId)
        ))

      const progressRows = await ctx.db.query.badgeProgress.findMany({
        where: eq(badgeProgress.userId, userId),
        with: { progressEvents: true },
      })
      const currentValueByBadgeId = new Map(
        progressRows.map((progress) => [
          progress.badgeId,
          progress.progressEvents.reduce((highest, event) => Math.max(highest, event.value), 0),
        ])
      )

      return rows.map((row) => ({
        badge: row.badge,
        badgeProgress: row.badgeProgress
          ? {
              ...row.badgeProgress,
              currentValue: currentValueByBadgeId.get(row.badgeProgress.badgeId) ?? 0,
            }
          : null,
      }))
    }),

  addBadge: adminProcedure
    .input(InsertBadgeZod)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        await tx.insert(badge).values(input)
        const allUsers = await tx.select({ id: users.id }).from(users)
        if (allUsers.length > 0) {
          await tx.insert(badgeProgress).values(
            allUsers.map(({ id }) => ({
              badgeId: input.id,
              completed: false,
              userId: id,
            })),
          ).onConflictDoNothing()
        }
      })
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

      await ctx.db.insert(userProfile).values({
        userId,
        selectedBadge: badgeId ?? null,
      }).onConflictDoUpdate({
        target: userProfile.userId,
        set: { selectedBadge: badgeId ?? null },
      })
    })
});
