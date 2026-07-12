export const EXPERIENCE_SOURCE = {
  badge: "badge",
  quest: "quest",
} as const

const BASE_EXPERIENCE_PER_LEVEL = 500
const EXPERIENCE_INCREASE_PER_LEVEL = 50

export function getBadgeExperience(groupWeighting: number) {
  return 100 + Math.max(0, groupWeighting) * 25
}

export function getLevelFromExperience(totalExperience: number) {
  const experience = Math.max(0, totalExperience)
  const quadraticCoefficient = EXPERIENCE_INCREASE_PER_LEVEL / 2
  const linearCoefficient = BASE_EXPERIENCE_PER_LEVEL - quadraticCoefficient
  const completedLevels = Math.floor(
    (-linearCoefficient + Math.sqrt(linearCoefficient ** 2 + 4 * quadraticCoefficient * experience))
      / (2 * quadraticCoefficient),
  )
  let level = completedLevels + 1

  if (experience >= getExperienceRequiredForLevel(level + 1)) level += 1
  if (experience < getExperienceRequiredForLevel(level)) level -= 1

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
  const completedLevels = Math.max(0, level - 1)
  const baseExperience = BASE_EXPERIENCE_PER_LEVEL * completedLevels
  const increasingExperience = EXPERIENCE_INCREASE_PER_LEVEL * completedLevels * (completedLevels - 1) / 2

  return baseExperience + increasingExperience
}
