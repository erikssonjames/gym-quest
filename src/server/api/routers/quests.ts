import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { experienceEvent, questClaim } from "@/server/db/schema/progression"
import { getUserProgression } from "@/server/services/progression"
import { getQuestBoard } from "@/server/services/quests"
import { getCtxUserId } from "@/server/utils/user"

export const questsRouter = createTRPCRouter({
  getQuestBoard: protectedProcedure.query(async ({ ctx }) => {
    return await getQuestBoard(ctx.db, getCtxUserId(ctx), new Date())
  }),

  claimQuest: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: questId }) => {
      const userId = getCtxUserId(ctx)
      const board = await getQuestBoard(ctx.db, userId, new Date())
      const quest = board.quests.find((candidate) => candidate.id === questId)

      if (!quest) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quest not found." })
      }
      if (!quest.completed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Complete this quest before collecting it." })
      }
      if (quest.claimed) {
        throw new TRPCError({ code: "CONFLICT", message: "This quest reward has already been collected." })
      }

      await ctx.db.transaction(async (tx) => {
        const insertedClaim = await tx
          .insert(questClaim)
          .values({
            userId,
            questId: quest.id,
            periodKey: quest.periodKey,
            experienceAwarded: quest.experience,
          })
          .onConflictDoNothing()
          .returning({ id: questClaim.id })

        if (insertedClaim.length === 0) {
          throw new TRPCError({ code: "CONFLICT", message: "This quest reward has already been collected." })
        }

        await tx.insert(experienceEvent).values({
          userId,
          source: "quest",
          sourceId: `${quest.id}:${quest.periodKey}`,
          amount: quest.experience,
        })
      })

      return {
        experienceAwarded: quest.experience,
        progression: await getUserProgression(ctx.db, userId),
      }
    }),
})
