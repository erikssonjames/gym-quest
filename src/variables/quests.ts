export const QUEST_DEFINITIONS = [
  {
    id: "daily-session",
    title: "Answer the call",
    description: "Complete one workout today.",
    cadence: "daily",
    metric: "workouts",
    target: 1,
    unit: "workout",
    experience: 100,
  },
  {
    id: "daily-sets",
    title: "Put in the work",
    description: "Finish eight working sets today.",
    cadence: "daily",
    metric: "sets",
    target: 8,
    unit: "sets",
    experience: 75,
  },
  {
    id: "weekly-sessions",
    title: "Build the rhythm",
    description: "Complete three workouts before the week resets Monday.",
    cadence: "weekly",
    metric: "workouts",
    target: 3,
    unit: "workouts",
    experience: 250,
  },
  {
    id: "weekly-volume",
    title: "Move the mountain",
    description: "Log 5,000 kg of training volume this week.",
    cadence: "weekly",
    metric: "volume",
    target: 5000,
    unit: "kg",
    experience: 200,
  },
  {
    id: "journey-five",
    title: "Begin the adventure",
    description: "Complete your first five workouts.",
    cadence: "journey",
    metric: "workouts",
    target: 5,
    unit: "workouts",
    experience: 300,
  },
] as const

export type QuestDefinition = (typeof QUEST_DEFINITIONS)[number]
export type QuestCadence = QuestDefinition["cadence"]
export type QuestMetric = QuestDefinition["metric"]
