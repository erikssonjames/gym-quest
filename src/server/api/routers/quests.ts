import { and, eq, isNotNull } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { experienceEvent, questClaim } from "@/server/db/schema/progression"
import { workoutSession } from "@/server/db/schema/workout"
import type { WorkoutSession, WorkoutSessionLog, WorkoutSessionLogFragment } from "@/server/db/schema/workout"
import { type db } from "@/server/db"
import { getUserProgression } from "@/server/services/progression"
import { getCtxUserId } from "@/server/utils/user"
import { QUEST_DEFINITIONS, type QuestCadence, type QuestMetric } from "@/variables/quests"

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

type QuestDatabase = typeof db

async function getQuestBoard(db: QuestDatabase, userId: string, now: Date) {
  const sessions = await db.query.workoutSession.findMany({
    where: and(
      eq(workoutSession.userId, userId),
      isNotNull(workoutSession.endedAt),
    ),
    with: {
      workoutSessionLogs: {
        with: { workoutSessionLogFragments: true },
      },
    },
  })
  const claims = await db.query.questClaim.findMany({
    where: eq(questClaim.userId, userId),
  })

  const todayStart = startOfUtcDay(now)
  const weekStart = startOfUtcWeek(now)
  const dailySessions = sessions.filter((session) => session.endedAt && session.endedAt >= todayStart)
  const weeklySessions = sessions.filter((session) => session.endedAt && session.endedAt >= weekStart)

  const quests = QUEST_DEFINITIONS.map((definition) => {
    const periodKey = getPeriodKey(definition.cadence, now)
    const relevantSessions = definition.cadence === "daily"
      ? dailySessions
      : definition.cadence === "weekly"
        ? weeklySessions
        : sessions
    const current = getMetricValue(definition.metric, relevantSessions)
    const claimed = claims.some((claim) => (
      claim.questId === definition.id && claim.periodKey === periodKey
    ))

    return {
      ...definition,
      periodKey,
      current,
      completed: current >= definition.target,
      claimed,
      collectable: current >= definition.target && !claimed,
    }
  })

  return {
    quests,
    completedCount: quests.filter((quest) => quest.completed).length,
    claimedCount: quests.filter((quest) => quest.claimed).length,
    collectableCount: quests.filter((quest) => quest.collectable).length,
  }
}

type QuestSession = WorkoutSession & {
  workoutSessionLogs: Array<WorkoutSessionLog & {
    workoutSessionLogFragments: WorkoutSessionLogFragment[]
  }>
}

function getMetricValue(metric: QuestMetric, sessions: QuestSession[]) {
  if (metric === "workouts") return sessions.length
  if (metric === "sets") return countCompletedSets(sessions)
  return countVolume(sessions)
}

function countCompletedSets(sessions: QuestSession[]) {
  return sessions.reduce((sessionTotal, session) => (
    sessionTotal + session.workoutSessionLogs.reduce((logTotal, log) => (
      logTotal + log.workoutSessionLogFragments.filter((fragment) => fragment.startedAt && fragment.endedAt).length
    ), 0)
  ), 0)
}

function countVolume(sessions: QuestSession[]) {
  return sessions.reduce((sessionTotal, session) => (
    sessionTotal + session.workoutSessionLogs.reduce((logTotal, log) => (
      logTotal + log.workoutSessionLogFragments.reduce((fragmentTotal, fragment) => (
        fragmentTotal + (fragment.startedAt && fragment.endedAt ? fragment.reps * fragment.weight : 0)
      ), 0)
    ), 0)
  ), 0)
}

function getPeriodKey(cadence: QuestCadence, now: Date) {
  if (cadence === "journey") return "lifetime"
  const periodStart = cadence === "daily" ? startOfUtcDay(now) : startOfUtcWeek(now)
  return periodStart.toISOString().slice(0, 10)
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function startOfUtcWeek(date: Date) {
  const dayStart = startOfUtcDay(date)
  const daysSinceMonday = (dayStart.getUTCDay() + 6) % 7
  dayStart.setUTCDate(dayStart.getUTCDate() - daysSinceMonday)
  return dayStart
}
