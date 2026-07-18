import { and, eq, isNotNull, lt, lte, or, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

import { getLevelFromExperience, toSafeExperienceNumber } from "@/lib/experience"
import { type db } from "@/server/db"
import type { WorkoutRecordSnapshot, WorkoutShareSnapshot } from "@/server/db/schema/feed"
import { experienceEvent } from "@/server/db/schema/progression"
import { workoutSession } from "@/server/db/schema/workout"

type WorkoutDatabase = typeof db

type PerformedFragment = {
  exerciseId: string
  exerciseName: string
  reps: number
  weight: number
  volume: number
}

export async function createWorkoutShareSnapshot(
  database: WorkoutDatabase,
  userId: string,
  sessionId: string,
): Promise<WorkoutShareSnapshot> {
  const session = await database.query.workoutSession.findFirst({
    where: and(eq(workoutSession.id, sessionId), eq(workoutSession.userId, userId)),
    with: {
      workout: true,
      experienceReview: true,
      workoutSessionLogs: {
        with: {
          exercise: true,
          workoutSessionLogFragments: true,
        },
      },
    },
  })

  if (!session?.endedAt) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Complete this workout before sharing it." })
  }
  if (session.experienceReview?.status === "pending") {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This workout is waiting for XP review." })
  }
  if (session.experienceReview?.status === "rejected") {
    throw new TRPCError({ code: "FORBIDDEN", message: "A rejected workout cannot be shared." })
  }

  const performed = session.workoutSessionLogs.flatMap((log) => (
    log.workoutSessionLogFragments
      .filter((fragment) => fragment.startedAt && fragment.endedAt)
      .map((fragment) => ({
        exerciseId: log.exerciseId,
        exerciseName: log.exercise.name,
        reps: fragment.reps,
        weight: fragment.weight,
        volume: fragment.reps * fragment.weight,
      }))
  ))

  if (performed.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Complete at least one set before sharing this workout." })
  }

  const priorSessions = await database.query.workoutSession.findMany({
    where: and(
      eq(workoutSession.userId, userId),
      isNotNull(workoutSession.endedAt),
      or(
        lt(workoutSession.endedAt, session.endedAt),
        and(eq(workoutSession.endedAt, session.endedAt), lt(workoutSession.id, session.id)),
      ),
    ),
    with: {
      experienceReview: true,
      workoutSessionLogs: {
        with: {
          exercise: true,
          workoutSessionLogFragments: true,
        },
      },
    },
  })
  const priorPerformed = priorSessions
    .filter((candidate) => !candidate.experienceReview || candidate.experienceReview.status === "approved")
    .flatMap((candidate) => candidate.workoutSessionLogs.flatMap((log) => (
      log.workoutSessionLogFragments
        .filter((fragment) => fragment.startedAt && fragment.endedAt)
        .map((fragment) => ({
          exerciseId: log.exerciseId,
          exerciseName: log.exercise.name,
          reps: fragment.reps,
          weight: fragment.weight,
          volume: fragment.reps * fragment.weight,
        }))
    )))

  const records = findRecords(performed, priorPerformed)
  const bestSet = performed.reduce<PerformedFragment | null>((best, fragment) => (
    !best || fragment.volume > best.volume ? fragment : best
  ), null)
  const workoutExperience = await database.query.experienceEvent.findFirst({
    where: and(
      eq(experienceEvent.userId, userId),
      eq(experienceEvent.source, "workout"),
      eq(experienceEvent.sourceId, sessionId),
    ),
  })
  const experienceAwarded = workoutExperience?.amount ?? 0
  let totalAtAward = 0

  if (workoutExperience) {
    const [{ total } = { total: "0" }] = await database
      .select({ total: sql<string>`coalesce(sum(${experienceEvent.amount}), 0)::text` })
      .from(experienceEvent)
      .where(and(
        eq(experienceEvent.userId, userId),
        lte(experienceEvent.createdAt, workoutExperience.createdAt),
      ))
    totalAtAward = toSafeExperienceNumber(total)
  }

  const beforeLevel = getLevelFromExperience(Math.max(0, totalAtAward - experienceAwarded)).level
  const afterLevel = getLevelFromExperience(totalAtAward).level

  return {
    workoutName: session.workout?.name ?? "Open workout",
    completedAt: session.endedAt.toISOString(),
    durationSeconds: session.startedAt
      ? Math.max(0, Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000))
      : 0,
    exerciseCount: new Set(performed.map((fragment) => fragment.exerciseId)).size,
    completedSetCount: performed.length,
    totalReps: performed.reduce((total, fragment) => total + fragment.reps, 0),
    totalVolume: performed.reduce((total, fragment) => total + fragment.volume, 0),
    experienceAwarded,
    beforeLevel,
    afterLevel,
    bestSet: bestSet ? {
      exerciseName: bestSet.exerciseName,
      reps: bestSet.reps,
      weight: bestSet.weight,
      volume: bestSet.volume,
    } : null,
    records,
  }
}

function findRecords(current: PerformedFragment[], previous: PerformedFragment[]) {
  const currentByExercise = groupByExercise(current)
  const previousByExercise = groupByExercise(previous)
  const records: WorkoutRecordSnapshot[] = []

  currentByExercise.forEach((fragments, exerciseId) => {
    const prior = previousByExercise.get(exerciseId)
    if (!prior?.length) return

    const maxWeight = maximumBy(fragments, (fragment) => fragment.weight)
    const priorMaxWeight = maximumBy(prior, (fragment) => fragment.weight)
    if (maxWeight.weight > priorMaxWeight.weight) {
      records.push({
        exerciseId,
        exerciseName: maxWeight.exerciseName,
        metric: "weight",
        previousValue: priorMaxWeight.weight,
        value: maxWeight.weight,
        weight: maxWeight.weight,
        reps: maxWeight.reps,
      })
    }

    const maxVolume = maximumBy(fragments, (fragment) => fragment.volume)
    const priorMaxVolume = maximumBy(prior, (fragment) => fragment.volume)
    if (maxVolume.volume > priorMaxVolume.volume) {
      records.push({
        exerciseId,
        exerciseName: maxVolume.exerciseName,
        metric: "set-volume",
        previousValue: priorMaxVolume.volume,
        value: maxVolume.volume,
        weight: maxVolume.weight,
        reps: maxVolume.reps,
      })
    }
  })

  return records
}

function groupByExercise(fragments: PerformedFragment[]) {
  const grouped = new Map<string, PerformedFragment[]>()
  fragments.forEach((fragment) => {
    grouped.set(fragment.exerciseId, [...(grouped.get(fragment.exerciseId) ?? []), fragment])
  })
  return grouped
}

function maximumBy(
  fragments: PerformedFragment[],
  value: (fragment: PerformedFragment) => number,
) {
  return fragments.reduce((maximum, fragment) => value(fragment) > value(maximum) ? fragment : maximum)
}
