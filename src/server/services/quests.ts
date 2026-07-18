import { and, eq, isNotNull } from "drizzle-orm"

import { type db } from "@/server/db"
import { questClaim } from "@/server/db/schema/progression"
import type { WorkoutExperienceReview } from "@/server/db/schema/progression"
import {
  workoutSession,
  type WorkoutSession,
  type WorkoutSessionLog,
  type WorkoutSessionLogFragment,
} from "@/server/db/schema/workout"
import {
  QUEST_DEFINITIONS,
  type QuestCadence,
  type QuestMetric,
} from "@/variables/quests"

type QuestDatabase = typeof db

export async function getQuestBoard(db: QuestDatabase, userId: string, now: Date) {
  const sessions = await db.query.workoutSession.findMany({
    where: and(
      eq(workoutSession.userId, userId),
      isNotNull(workoutSession.endedAt),
    ),
    with: {
      experienceReview: true,
      workoutSessionLogs: {
        with: { workoutSessionLogFragments: true },
      },
    },
  })
  const claims = await db.query.questClaim.findMany({
    where: eq(questClaim.userId, userId),
  })
  const eligibleSessions = sessions.filter((session) => (
    !session.experienceReview || session.experienceReview.status === "approved"
  ))

  const todayStart = startOfUtcDay(now)
  const weekStart = startOfUtcWeek(now)
  const dailySessions = eligibleSessions.filter((session) => session.endedAt && session.endedAt >= todayStart)
  const weeklySessions = eligibleSessions.filter((session) => session.endedAt && session.endedAt >= weekStart)

  const quests = QUEST_DEFINITIONS.map((definition) => {
    const periodKey = getPeriodKey(definition.cadence, now)
    const relevantSessions = definition.cadence === "daily"
      ? dailySessions
      : definition.cadence === "weekly"
        ? weeklySessions
        : eligibleSessions
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
  experienceReview: WorkoutExperienceReview | null
  workoutSessionLogs: Array<WorkoutSessionLog & {
    workoutSessionLogFragments: WorkoutSessionLogFragment[]
  }>
}

function getMetricValue(metric: QuestMetric, sessions: QuestSession[]) {
  if (metric === "workouts") return sessions.filter(hasPerformedSet).length
  if (metric === "sets") return countCompletedSets(sessions)
  return countVolume(sessions)
}

function hasPerformedSet(session: QuestSession) {
  return session.workoutSessionLogs.some((log) => (
    log.workoutSessionLogFragments.some((fragment) => fragment.startedAt && fragment.endedAt)
  ))
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
