export const EXPERIENCE_SOURCE = {
  badge: "badge",
  quest: "quest",
  workout: "workout",
} as const

const EXPERIENCE_CURVE_SCALE = 500
const BADGE_EXPERIENCE_PER_TIER = 750
const EARLY_USER_BADGE_EXPERIENCE = 750

const WORKOUT_FINISH_EXPERIENCE_PER_SET = 50
const MAX_WORKOUT_FINISH_EXPERIENCE = 200
const EXPERIENCE_PER_COMPLETED_SET = 15
const EXPERIENCE_PER_REP = 2
const MAX_REPS_PER_SET_FOR_EXPERIENCE = 30
const KILOGRAMS_OF_VOLUME_PER_EXPERIENCE = 25
const MAX_VOLUME_PER_SET_FOR_EXPERIENCE = 1_500
const ACTIVE_SECONDS_PER_EXPERIENCE = 4
const MAX_ACTIVE_SECONDS_PER_SET_FOR_EXPERIENCE = 180
const MAX_EXPERIENCE_PER_WORKOUT = 2_000

const MAX_SAFE_COMPLETED_LEVELS = Math.floor(
  Math.sqrt(Number.MAX_SAFE_INTEGER / EXPERIENCE_CURVE_SCALE),
) - 1
const MAX_SUPPORTED_EXPERIENCE = (
  EXPERIENCE_CURVE_SCALE * (MAX_SAFE_COMPLETED_LEVELS + 1) ** 2
) - 1

type ExperienceWorkoutFragment = {
  reps: number
  weight: number
  startedAt: Date | null
  endedAt: Date | null
}

type ExperienceWorkoutSession = {
  workoutSessionLogs: Array<{
    workoutSessionLogFragments: ExperienceWorkoutFragment[]
  }>
}

export type WorkoutExperienceBreakdown = {
  activeTime: number
  finish: number
  reps: number
  sets: number
  total: number
  volume: number
  wasCapped: boolean
}

export function getBadgeExperience(group: string, groupWeighting: number) {
  if (group === "early_user") return EARLY_USER_BADGE_EXPERIENCE
  return BADGE_EXPERIENCE_PER_TIER * (toNonNegativeInteger(groupWeighting) + 1)
}

export function getLevelFromExperience(totalExperience: number) {
  const experience = normalizeExperienceTotal(totalExperience)
  const completedLevels = Math.floor(Math.sqrt(experience / EXPERIENCE_CURVE_SCALE))
  const level = completedLevels + 1

  const levelStartExperience = getExperienceRequiredForLevel(level)
  const nextLevelExperience = getExperienceRequiredForLevel(level + 1)
  const experienceIntoLevel = experience - levelStartExperience
  const experienceForLevel = nextLevelExperience - levelStartExperience

  return {
    level,
    totalExperience: experience,
    experienceIntoLevel,
    experienceForLevel,
    experienceToNextLevel: experienceForLevel - experienceIntoLevel,
    progressPercent: Math.min(100, (experienceIntoLevel / experienceForLevel) * 100),
  }
}

export function getExperienceRequiredForLevel(level: number) {
  const normalizedLevel = Math.max(1, Math.floor(level))
  const completedLevels = normalizedLevel - 1
  const requiredExperience = EXPERIENCE_CURVE_SCALE * completedLevels ** 2

  if (!Number.isSafeInteger(requiredExperience)) {
    throw new RangeError("The requested level exceeds the supported experience range.")
  }

  return requiredExperience
}

export function toSafeExperienceNumber(value: bigint | number | string) {
  let experience: number

  if (typeof value === "bigint") {
    if (value > BigInt(MAX_SUPPORTED_EXPERIENCE)) {
      throw new RangeError("The experience total exceeds JavaScript's safe integer range.")
    }
    experience = Number(value)
  } else if (typeof value === "string") {
    const parsed = BigInt(value)
    if (parsed > BigInt(MAX_SUPPORTED_EXPERIENCE)) {
      throw new RangeError("The experience total exceeds JavaScript's safe integer range.")
    }
    experience = Number(parsed)
  } else {
    experience = value
  }

  return normalizeExperienceTotal(experience)
}

export function getWorkoutExperience(
  session: ExperienceWorkoutSession,
): WorkoutExperienceBreakdown {
  const fragments = session.workoutSessionLogs.flatMap((log) => (
    log.workoutSessionLogFragments.filter(isPerformedFragment)
  ))

  if (fragments.length === 0) {
    return {
      activeTime: 0,
      finish: 0,
      reps: 0,
      sets: 0,
      total: 0,
      volume: 0,
      wasCapped: false,
    }
  }

  const finish = Math.min(
    MAX_WORKOUT_FINISH_EXPERIENCE,
    fragments.length * WORKOUT_FINISH_EXPERIENCE_PER_SET,
  )
  const sets = fragments.length * EXPERIENCE_PER_COMPLETED_SET
  const reps = fragments.reduce((total, fragment) => (
    total + Math.min(toNonNegativeInteger(fragment.reps), MAX_REPS_PER_SET_FOR_EXPERIENCE)
      * EXPERIENCE_PER_REP
  ), 0)
  const volume = fragments.reduce((total, fragment) => {
    const safeWeight = Math.min(
      toNonNegativeInteger(fragment.weight),
      MAX_VOLUME_PER_SET_FOR_EXPERIENCE,
    )
    const safeReps = Math.min(
      toNonNegativeInteger(fragment.reps),
      MAX_VOLUME_PER_SET_FOR_EXPERIENCE,
    )
    const cappedVolume = Math.min(
      safeWeight * safeReps,
      MAX_VOLUME_PER_SET_FOR_EXPERIENCE,
    )

    return total + Math.floor(cappedVolume / KILOGRAMS_OF_VOLUME_PER_EXPERIENCE)
  }, 0)
  const activeTime = fragments.reduce((total, fragment) => {
    const elapsedSeconds = Math.max(
      0,
      (fragment.endedAt.getTime() - fragment.startedAt.getTime()) / 1_000,
    )
    const cappedSeconds = Math.min(
      elapsedSeconds,
      MAX_ACTIVE_SECONDS_PER_SET_FOR_EXPERIENCE,
    )

    return total + Math.floor(cappedSeconds / ACTIVE_SECONDS_PER_EXPERIENCE)
  }, 0)
  const uncappedTotal = finish + sets + reps + volume + activeTime

  return {
    activeTime,
    finish,
    reps,
    sets,
    total: Math.min(uncappedTotal, MAX_EXPERIENCE_PER_WORKOUT),
    volume,
    wasCapped: uncappedTotal > MAX_EXPERIENCE_PER_WORKOUT,
  }
}

function isPerformedFragment(
  fragment: ExperienceWorkoutFragment,
): fragment is ExperienceWorkoutFragment & { startedAt: Date; endedAt: Date } {
  return fragment.startedAt !== null && fragment.endedAt !== null
}

function normalizeExperienceTotal(experience: number) {
  if (!Number.isFinite(experience)) {
    throw new RangeError("Experience must be a finite number.")
  }
  if (experience > MAX_SUPPORTED_EXPERIENCE || !Number.isSafeInteger(Math.floor(experience))) {
    throw new RangeError("The experience total exceeds JavaScript's safe integer range.")
  }

  return Math.max(0, Math.floor(experience))
}

function toNonNegativeInteger(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}
