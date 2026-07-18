import { getWorkoutExperience } from "@/lib/experience"

const MAX_WEIGHT_PER_SET_KG = 500
const MAX_REPS_PER_SET = 100
const MAX_VOLUME_PER_SET_KG = 10_000
const MAX_COMPLETED_SETS = 75
const MAX_WORKOUT_VOLUME_KG = 250_000
const MAX_REPS_PER_SECOND = 4
const MIN_REPS_FOR_RATE_CHECK = 20

type SafetyFragment = {
  reps: number
  weight: number
  startedAt: Date | null
  endedAt: Date | null
}

type SafetySession = {
  workoutSessionLogs: Array<{
    exercise?: { name: string } | null
    workoutSessionLogFragments: SafetyFragment[]
  }>
}

export type WorkoutExperienceSafetyAssessment = {
  requiresReview: boolean
  reasons: string[]
  metrics: {
    completedSetCount: number
    totalVolume: number
    maxWeight: number
    maxReps: number
    maxSetVolume: number
  }
}

export function assessWorkoutExperienceSafety(
  session: SafetySession,
): WorkoutExperienceSafetyAssessment {
  const reasons = new Set<string>()
  let completedSetCount = 0
  let totalVolume = 0n
  let maxWeight = 0
  let maxReps = 0
  let maxSetVolume = 0n

  for (const log of session.workoutSessionLogs) {
    const exerciseName = log.exercise?.name ?? "An exercise"

    for (const fragment of log.workoutSessionLogFragments) {
      if (!fragment.startedAt || !fragment.endedAt) continue

      completedSetCount += 1
      const weight = toNonNegativeInteger(fragment.weight)
      const reps = toNonNegativeInteger(fragment.reps)
      const setVolume = BigInt(weight) * BigInt(reps)
      const activeSeconds = Math.max(
        0,
        (fragment.endedAt.getTime() - fragment.startedAt.getTime()) / 1_000,
      )

      totalVolume += setVolume
      maxWeight = Math.max(maxWeight, weight)
      maxReps = Math.max(maxReps, reps)
      maxSetVolume = setVolume > maxSetVolume ? setVolume : maxSetVolume

      if (weight > MAX_WEIGHT_PER_SET_KG) {
        reasons.add(
          `${exerciseName} used ${formatNumber(weight)} kg in one set (review threshold: ${MAX_WEIGHT_PER_SET_KG} kg).`,
        )
      }
      if (reps > MAX_REPS_PER_SET) {
        reasons.add(
          `${exerciseName} recorded ${formatNumber(reps)} reps in one set (review threshold: ${MAX_REPS_PER_SET} reps).`,
        )
      }
      if (setVolume > BigInt(MAX_VOLUME_PER_SET_KG)) {
        reasons.add(
          `${exerciseName} recorded ${formatBigInt(setVolume)} kg of volume in one set (review threshold: ${formatNumber(MAX_VOLUME_PER_SET_KG)} kg).`,
        )
      }
      if (
        reps >= MIN_REPS_FOR_RATE_CHECK &&
        (activeSeconds === 0 || reps / activeSeconds > MAX_REPS_PER_SECOND)
      ) {
        reasons.add(
          `${exerciseName} recorded ${formatNumber(reps)} reps in ${Math.round(activeSeconds)} seconds.`,
        )
      }
    }
  }

  if (completedSetCount > MAX_COMPLETED_SETS) {
    reasons.add(
      `${formatNumber(completedSetCount)} completed sets exceeded the review threshold of ${MAX_COMPLETED_SETS}.`,
    )
  }
  if (totalVolume > BigInt(MAX_WORKOUT_VOLUME_KG)) {
    reasons.add(
      `${formatBigInt(totalVolume)} kg of workout volume exceeded the review threshold of ${formatNumber(MAX_WORKOUT_VOLUME_KG)} kg.`,
    )
  }
  if (getWorkoutExperience(session).wasCapped) {
    reasons.add("The workout reached the 2,000 XP safety cap.")
  }

  return {
    requiresReview: reasons.size > 0,
    reasons: Array.from(reasons),
    metrics: {
      completedSetCount,
      totalVolume: toSafeMetricNumber(totalVolume),
      maxWeight,
      maxReps,
      maxSetVolume: toSafeMetricNumber(maxSetVolume),
    },
  }
}

function toNonNegativeInteger(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)))
}

function toSafeMetricNumber(value: bigint) {
  return Number(value > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : value)
}

function formatBigInt(value: bigint) {
  return value.toLocaleString("en-US")
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US")
}
