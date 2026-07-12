export const BADGE_GROUPS = [
  {
    id: "weight_lifting",
    badges: [
      { id: "1000kg", weighting: 0 },
      { id: "5000kg", weighting: 1 },
      { id: "10000kg", weighting: 2 },
      { id: "50000kg", weighting: 3 },
      { id: "100000kg", weighting: 4 },
      { id: "500000kg", weighting: 5 },
      { id: "1000000kg", weighting: 6 },
      { id: "5000000kg", weighting: 7 },
      { id: "10000000kg", weighting: 8 },
      { id: "50000000kg", weighting: 9 },
      { id: "100000000kg", weighting: 10 },
    ] as const
  },
  {
    id: "consistent_lifter",
    badges: [
      { id: "2_weeks_in_a_row", weighting: 0 },
      { id: "4_weeks_in_a_row", weighting: 1 },
      { id: "8_weeks_in_a_row", weighting: 2 },
      { id: "12_weeks_in_a_row", weighting: 3 },
      { id: "52_weeks_in_a_row", weighting: 4 },
      { id: "104_weeks_in_a_row", weighting: 5 },
      { id: "156_weeks_in_a_row", weighting: 6 },
      { id: "208_weeks_in_a_row", weighting: 7 },
      { id: "260_weeks_in_a_row", weighting: 8 },
      { id: "312_weeks_in_a_row", weighting: 9 },
      { id: "364_weeks_in_a_row", weighting: 10 }
    ] as const
  },
  {
    id: "frequent_lifter",
    badges: [
      { id: "5_workouts", weighting: 0 },
      { id: "10_workouts", weighting: 1 },
      { id: "25_workouts", weighting: 2 },
      { id: "50_workouts", weighting: 3 },
      { id: "100_workouts", weighting: 4 },
      { id: "250_workouts", weighting: 5 },
      { id: "500_workouts", weighting: 6 },
      { id: "750_workouts", weighting: 7 },
      { id: "1000_workouts", weighting: 8 }
    ] as const
  },
  {
    id: "early_user",
    badges: [
      { id: "0-10th_user", weighting: 0 },
      { id: "11-50th_user", weighting: 1 },
      { id: "51-100th_user", weighting: 2 },
      { id: "101-500th_user", weighting: 3 },
      { id: "501-1000th_user", weighting: 4 }
    ] as const
  },
] as const

type BadgeDefinition = {
  id: string
  name: string
  description: string
  valueToComplete: number
  valueName: string
  valueDescription: string
  group: BadgeGroupName
  groupWeighting: number
  percentageOfUsersHasBadge: number
}

const weightBadges = BADGE_GROUPS[0].badges.map(({ id, weighting }) => {
  const kilograms = Number(id.replace("kg", ""))
  return {
    id,
    name: `${kilograms.toLocaleString("en-US")} kg club`,
    description: `Lift ${kilograms.toLocaleString("en-US")} kg of total training volume across completed workouts.`,
    valueToComplete: kilograms,
    valueName: "kg lifted",
    valueDescription: "Total weight moved across completed sets",
    group: "weight_lifting",
    groupWeighting: weighting,
    percentageOfUsersHasBadge: 0,
  } satisfies BadgeDefinition
})

const consistencyBadges = BADGE_GROUPS[1].badges.map(({ id, weighting }) => {
  const days = Number(id.split("_")[0])
  return {
    id,
    name: `${days} day streak`,
    description: `Complete a workout on ${days} consecutive days.`,
    valueToComplete: days,
    valueName: "day streak",
    valueDescription: "Consecutive days with a completed workout",
    group: "consistent_lifter",
    groupWeighting: weighting,
    percentageOfUsersHasBadge: 0,
  } satisfies BadgeDefinition
})

const workoutBadges = BADGE_GROUPS[2].badges.map(({ id, weighting }) => {
  const workouts = Number(id.split("_")[0])
  return {
    id,
    name: `${workouts.toLocaleString("en-US")} workouts`,
    description: `Complete ${workouts.toLocaleString("en-US")} workouts and keep building your training record.`,
    valueToComplete: workouts,
    valueName: "workout",
    valueDescription: "Completed workout sessions",
    group: "frequent_lifter",
    groupWeighting: weighting,
    percentageOfUsersHasBadge: 0,
  } satisfies BadgeDefinition
})

const earlyUserNames = ["Founding ten", "First fifty", "First hundred", "First five hundred", "First thousand"] as const
const earlyUserBadges = BADGE_GROUPS[3].badges.map(({ id, weighting }) => ({
  id,
  name: earlyUserNames[weighting] ?? "Early adventurer",
  description: "Join GymQuest early and help shape the training community.",
  valueToComplete: 1,
  valueName: "account",
  valueDescription: "Awarded automatically based on signup order",
  group: "early_user",
  groupWeighting: weighting,
  percentageOfUsersHasBadge: 0,
}) satisfies BadgeDefinition)

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  ...weightBadges,
  ...consistencyBadges,
  ...workoutBadges,
  ...earlyUserBadges,
]

type BadgeUnionFromGroups<T> =
  // 1. If T is an array of something ...
  T extends ReadonlyArray<infer Group>
    // 2. Then each Group is an object with "badges" ...
    ? Group extends { badges: ReadonlyArray<infer BadgeItem> }
      // 3. Then extract the union of all BadgeItem
      ? BadgeItem
      : never
    : never

function flattenBadgeGroups<
    G extends ReadonlyArray<{ badges: ReadonlyArray<unknown> }>
  >(groups: G): BadgeUnionFromGroups<G>[] {
  // We force TypeScript to "trust us" that flatMap produces the union of all items
  return groups.flatMap(g => g.badges) as BadgeUnionFromGroups<G>[]
}

export const BADGES = flattenBadgeGroups(BADGE_GROUPS)
export type BadgeLiteral = (typeof BADGES)[number]

export type BadgeGroupName = (typeof BADGE_GROUPS)[number]["id"];
export const BADGE_GROUP_NAMES = BADGE_GROUPS.map(
  (group) => group.id
) as readonly BadgeGroupName[];

export const BADGE_GROUP_RECORD = BADGE_GROUPS.reduce<Record<BadgeGroupName, BadgeLiteral[]>>((acc, curr) => {
  if (!(curr.id in acc)) {
    acc[curr.id] = []
  }
  acc[curr.id] = [...curr.badges]
  return acc
}, {} as Record<BadgeGroupName, BadgeLiteral[]>)

export function getEarlyUserBadgeId(userNumber: number) {
  if (userNumber <= 0) return null
  if (userNumber <= 10) return "0-10th_user"
  if (userNumber <= 50) return "11-50th_user"
  if (userNumber <= 100) return "51-100th_user"
  if (userNumber <= 500) return "101-500th_user"
  if (userNumber <= 1000) return "501-1000th_user"
  return null
}
