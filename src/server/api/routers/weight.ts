import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { userSettings } from "@/server/db/schema/user"
import { weightEntry } from "@/server/db/schema/weight"
import { getCtxUserId } from "@/server/utils/user"

const localDateZod = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, "Enter a valid date.")

const weightKgZod = z.number().finite().min(20).max(500)

function kilogramsToGrams(weightKg: number) {
  return Math.round(weightKg * 1000)
}

export const weightRouter = createTRPCRouter({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    const [settings, entries] = await Promise.all([
      ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
        columns: {
          weightGoalGrams: true,
          weightReminderEnabled: true,
        },
      }),
      ctx.db.query.weightEntry.findMany({
        where: eq(weightEntry.userId, userId),
        orderBy: [desc(weightEntry.recordedOn)],
        limit: 365,
      }),
    ])

    return {
      goalWeightKg: settings?.weightGoalGrams ? settings.weightGoalGrams / 1000 : null,
      reminderEnabled: settings?.weightReminderEnabled ?? false,
      entries: entries.map((entry) => ({
        id: entry.id,
        recordedOn: entry.recordedOn,
        weightKg: entry.weightGrams / 1000,
      })),
    }
  }),

  upsertEntry: protectedProcedure
    .input(z.object({
      recordedOn: localDateZod,
      weightKg: weightKgZod,
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const [entry] = await ctx.db
        .insert(weightEntry)
        .values({
          userId,
          recordedOn: input.recordedOn,
          weightGrams: kilogramsToGrams(input.weightKg),
        })
        .onConflictDoUpdate({
          target: [weightEntry.userId, weightEntry.recordedOn],
          set: {
            weightGrams: kilogramsToGrams(input.weightKg),
            updatedAt: new Date(),
          },
        })
        .returning()

      return entry
    }),

  setGoal: protectedProcedure
    .input(z.object({ weightKg: weightKgZod.nullable() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const weightGoalGrams = input.weightKg === null
        ? null
        : kilogramsToGrams(input.weightKg)

      const [settings] = await ctx.db
        .insert(userSettings)
        .values({ userId, weightGoalGrams })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: { weightGoalGrams },
        })
        .returning({ weightGoalGrams: userSettings.weightGoalGrams })

      return {
        goalWeightKg: settings?.weightGoalGrams ? settings.weightGoalGrams / 1000 : null,
      }
    }),

  setReminder: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      await ctx.db
        .insert(userSettings)
        .values({ userId, weightReminderEnabled: input.enabled })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: { weightReminderEnabled: input.enabled },
        })

      return { enabled: input.enabled }
    }),

  getReminderStatus: protectedProcedure
    .input(z.object({ localDate: localDateZod }))
    .query(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const settings = await ctx.db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
        columns: { weightReminderEnabled: true },
      })

      if (!settings?.weightReminderEnabled) {
        return { reminderEnabled: false, loggedToday: false, shouldRemind: false }
      }

      const todayEntry = await ctx.db.query.weightEntry.findFirst({
        where: and(
          eq(weightEntry.userId, userId),
          eq(weightEntry.recordedOn, input.localDate),
        ),
        columns: { id: true },
      })

      return {
        reminderEnabled: true,
        loggedToday: Boolean(todayEntry),
        shouldRemind: !todayEntry,
      }
    }),
})
