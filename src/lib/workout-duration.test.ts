import { describe, expect, it } from "vitest"

import { estimateWorkoutDurationMinutes } from "./workout-duration"

describe("estimateWorkoutDurationMinutes", () => {
  it("includes rep work, timed sets, useful rest, and transitions", () => {
    const quickConditioning = [
      {
        workoutSetCollections: [
          { reps: [12, 12, 12], duration: [0, 0, 0], restTime: [30, 30, 45] },
          { reps: [20, 20, 20], duration: [0, 0, 0], restTime: [30, 30, 45] },
        ],
      },
      {
        workoutSetCollections: [
          { reps: [0, 0, 0], duration: [30, 30, 30], restTime: [30, 30, 45] },
        ],
      },
    ]

    expect(estimateWorkoutDurationMinutes(quickConditioning)).toBe(15)
  })

  it("does not count a rest period after the final round", () => {
    const plan = [{
      workoutSetCollections: [
        { reps: [10, 10], duration: [0, 0], restTime: [60, 600] },
      ],
    }]

    expect(estimateWorkoutDurationMinutes(plan)).toBe(10)
  })

  it("returns zero for an empty plan", () => {
    expect(estimateWorkoutDurationMinutes([])).toBe(0)
  })
})
