import { expect, test } from "vitest"

import { calculateGoalProgress, parseWeightInput } from "./weight-progress"

void test("calculates progress toward a weight-loss goal", () => {
  expect(calculateGoalProgress({ startingWeight: 90, currentWeight: 85, goalWeight: 80 })).toBe(50)
})

void test("calculates progress toward a weight-gain goal", () => {
  expect(calculateGoalProgress({ startingWeight: 70, currentWeight: 75, goalWeight: 80 })).toBe(50)
})

void test("clamps progress when moving away from or beyond the goal", () => {
  expect(calculateGoalProgress({ startingWeight: 90, currentWeight: 92, goalWeight: 80 })).toBe(0)
  expect(calculateGoalProgress({ startingWeight: 90, currentWeight: 78, goalWeight: 80 })).toBe(100)
})

void test("accepts decimal commas and rejects unreasonable weights", () => {
  expect(parseWeightInput("82,4")).toBe(82.4)
  expect(parseWeightInput("10")).toBeNull()
  expect(parseWeightInput("not-a-weight")).toBeNull()
})
