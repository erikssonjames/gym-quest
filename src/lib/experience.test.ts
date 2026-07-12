import { expect, test } from "vitest"

import { getExperienceRequiredForLevel, getLevelFromExperience } from "./experience"

void test("uses progressively larger cumulative XP thresholds", () => {
  expect(getExperienceRequiredForLevel(1)).toBe(0)
  expect(getExperienceRequiredForLevel(2)).toBe(500)
  expect(getExperienceRequiredForLevel(3)).toBe(1050)
  expect(getExperienceRequiredForLevel(4)).toBe(1650)
})

void test("calculates level progress from total experience", () => {
  expect(getLevelFromExperience(775)).toEqual({
    level: 2,
    totalExperience: 775,
    experienceIntoLevel: 275,
    experienceForLevel: 550,
    experienceToNextLevel: 275,
    progressPercent: 50,
  })
})

void test("clamps negative experience to level one", () => {
  expect(getLevelFromExperience(-100).level).toBe(1)
  expect(getLevelFromExperience(-100).totalExperience).toBe(0)
})
