import { describe, expect, it } from "vitest"

import { assessWorkoutExperienceSafety } from "@/lib/workout-experience-safety"

const startedAt = new Date("2026-01-01T10:00:00.000Z")

function sessionWith(
  fragments: Array<{
    reps: number
    weight: number
    seconds?: number
    performed?: boolean
  }>,
) {
  return {
    workoutSessionLogs: [{
      exercise: { name: "Bench press" },
      workoutSessionLogFragments: fragments.map((fragment) => ({
        reps: fragment.reps,
        weight: fragment.weight,
        startedAt: fragment.performed === false ? null : startedAt,
        endedAt: fragment.performed === false
          ? null
          : new Date(startedAt.getTime() + (fragment.seconds ?? 30) * 1_000),
      })),
    }],
  }
}

describe("assessWorkoutExperienceSafety", () => {
  it("allows a plausible completed workout", () => {
    const assessment = assessWorkoutExperienceSafety(sessionWith(
      Array.from({ length: 8 }, () => ({ reps: 10, weight: 80 })),
    ))

    expect(assessment.requiresReview).toBe(false)
    expect(assessment.metrics).toEqual({
      completedSetCount: 8,
      totalVolume: 6_400,
      maxWeight: 80,
      maxReps: 10,
      maxSetVolume: 800,
    })
  })

  it("flags an implausible 1,000 kg by 20-rep set", () => {
    const assessment = assessWorkoutExperienceSafety(
      sessionWith([{ reps: 20, weight: 1_000 }]),
    )

    expect(assessment.requiresReview).toBe(true)
    expect(assessment.reasons.some((reason) => reason.includes("1,000 kg in one set"))).toBe(true)
    expect(assessment.reasons.some((reason) => reason.includes("20,000 kg of volume"))).toBe(true)
  })

  it("flags impossible rep speed and ignores unperformed sets", () => {
    const assessment = assessWorkoutExperienceSafety(sessionWith([
      { reps: 30, weight: 0, seconds: 2 },
      { reps: 1_000, weight: 1_000, performed: false },
    ]))

    expect(assessment.requiresReview).toBe(true)
    expect(assessment.metrics.completedSetCount).toBe(1)
    expect(assessment.reasons.some((reason) => reason.includes("30 reps in 2 seconds"))).toBe(true)
  })

  it("flags workouts that reach the XP cap", () => {
    const assessment = assessWorkoutExperienceSafety(sessionWith(
      Array.from({ length: 40 }, () => ({ reps: 30, weight: 100, seconds: 180 })),
    ))

    expect(assessment.requiresReview).toBe(true)
    expect(assessment.reasons).toContain("The workout reached the 2,000 XP safety cap.")
  })
})
