import { expect, test } from "vitest"

import {
  getBadgeExperience,
  getExperienceRequiredForLevel,
  getLevelFromExperience,
  getWorkoutExperience,
  toSafeExperienceNumber,
} from "./experience"

void test("uses a linearly increasing cost for each level", () => {
  expect(getExperienceRequiredForLevel(1)).toBe(0)
  expect(getExperienceRequiredForLevel(2)).toBe(500)
  expect(getExperienceRequiredForLevel(3)).toBe(2_000)
  expect(getExperienceRequiredForLevel(4)).toBe(4_500)
  expect(getExperienceRequiredForLevel(100) - getExperienceRequiredForLevel(99)).toBe(98_500)
})

void test("calculates level progress from total experience", () => {
  expect(getLevelFromExperience(1_250)).toEqual({
    level: 2,
    totalExperience: 1_250,
    experienceIntoLevel: 750,
    experienceForLevel: 1_500,
    experienceToNextLevel: 750,
    progressPercent: 50,
  })
})

void test("keeps exact level boundaries and supports large safe totals", () => {
  expect(getLevelFromExperience(499).level).toBe(1)
  expect(getLevelFromExperience(500).level).toBe(2)
  expect(getLevelFromExperience(1_999).level).toBe(2)
  expect(getLevelFromExperience(2_000).level).toBe(3)
  expect(getLevelFromExperience(500_000_000_000).level).toBe(31_623)
})

void test("clamps negative experience to level one", () => {
  expect(getLevelFromExperience(-100).level).toBe(1)
  expect(getLevelFromExperience(-100).totalExperience).toBe(0)
})

void test("converts persisted bigint totals without losing precision", () => {
  expect(toSafeExperienceNumber("4900500")).toBe(4_900_500)
  expect(toSafeExperienceNumber(4_900_500n)).toBe(4_900_500)
  expect(() => toSafeExperienceNumber(BigInt(Number.MAX_SAFE_INTEGER))).toThrow(RangeError)
})

void test("rebalances achievement XP and keeps early-user rewards flat", () => {
  expect(getBadgeExperience("weight_lifting", 0)).toBe(750)
  expect(getBadgeExperience("weight_lifting", 10)).toBe(8_250)
  expect(getBadgeExperience("early_user", 0)).toBe(750)
  expect(getBadgeExperience("early_user", 4)).toBe(750)
})

void test("awards the expected experience for a standard weighted workout", () => {
  expect(getWorkoutExperience(buildWorkout(8, { reps: 10, weight: 80, seconds: 30 }))).toEqual({
    activeTime: 56,
    finish: 200,
    reps: 160,
    sets: 120,
    total: 792,
    volume: 256,
    wasCapped: false,
  })
})

void test("keeps bodyweight and longer weighted workouts meaningful", () => {
  expect(getWorkoutExperience(buildWorkout(10, { reps: 15, weight: 0, seconds: 30 })).total).toBe(720)
  expect(getWorkoutExperience(buildWorkout(12, { reps: 8, weight: 100, seconds: 35 })).total).toBe(1_052)
})

void test("ignores skipped sets and clamps invalid and extreme effort", () => {
  const workout = buildWorkout(20, {
    reps: Number.MAX_SAFE_INTEGER,
    weight: Number.MAX_SAFE_INTEGER,
    seconds: 3_600,
  })
  workout.workoutSessionLogs[0]!.workoutSessionLogFragments.push({
    reps: 100,
    weight: 100,
    startedAt: null,
    endedAt: new Date(),
  })
  workout.workoutSessionLogs[0]!.workoutSessionLogFragments.push({
    reps: -10,
    weight: -100,
    startedAt: new Date(20_000),
    endedAt: new Date(10_000),
  })

  const experience = getWorkoutExperience(workout)

  expect(experience.total).toBe(2_000)
  expect(experience.wasCapped).toBe(true)
})

void test("awards no experience for an empty workout", () => {
  expect(getWorkoutExperience({ workoutSessionLogs: [] }).total).toBe(0)
})

function buildWorkout(
  setCount: number,
  set: { reps: number; weight: number; seconds: number },
): Parameters<typeof getWorkoutExperience>[0] {
  return {
    workoutSessionLogs: [{
      workoutSessionLogFragments: Array.from({ length: setCount }, (_, index) => {
        const startedAt = new Date(index * 10_000)
        return {
          reps: set.reps,
          weight: set.weight,
          startedAt,
          endedAt: new Date(startedAt.getTime() + set.seconds * 1_000),
        }
      }),
    }],
  }
}
