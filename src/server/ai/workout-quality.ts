import type {
  WorkoutAiChatMessage,
  WorkoutAiDraft,
} from "@/server/ai/workout-schema"

export type ExerciseCatalogItem = {
  id: string
  name: string
  muscles: string[]
}

type DraftQualityResult =
  | { accepted: true }
  | { accepted: false; assistantMessage: string }

const BACK_MUSCLE_TERMS = [
  "back",
  "latissimus",
  "lat ",
  "trapezius",
  "rhomboid",
  "erector spinae",
  "teres major",
  "posterior deltoid",
]

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getUserRequest(messages: WorkoutAiChatMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ")
    .toLowerCase()
}

function getRequestedMinutes(request: string) {
  const matches = [...request.matchAll(/\b(\d{1,3})\s*(?:minutes?|mins?|min)\b/g)]
  const durations = matches
    .map((match) => Number(match[1]))
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0 && minutes <= 240)

  return durations.at(-1)
}

function targetsBack(request: string) {
  return /\bback[- ]focus(?:ed)?\b|\bfocus(?:ed|ing)?\s+(?:on\s+)?(?:the\s+)?back\b/.test(request)
}

function isBackExercise(exerciseName: string, catalog: ExerciseCatalogItem[]) {
  const catalogExercise = catalog.find(
    (exercise) => normalize(exercise.name) === normalize(exerciseName),
  )
  if (!catalogExercise) return false

  const muscleText = ` ${catalogExercise.muscles.map(normalize).join(" ")} `
  return BACK_MUSCLE_TERMS.some((term) => muscleText.includes(term))
}

export function assessWorkoutDraftQuality({
  draft,
  messages,
  exerciseCatalog,
}: {
  draft: WorkoutAiDraft
  messages: WorkoutAiChatMessage[]
  exerciseCatalog: ExerciseCatalogItem[]
}): DraftQualityResult {
  const request = getUserRequest(messages)
  const requestedMinutes = getRequestedMinutes(request)
  const exercises = draft.workoutSets.flatMap((set) => set.exercises)

  for (const exercise of exercises) {
    const setCount = exercise.reps.length
    const hasEqualSetArrays =
      setCount === exercise.weight.length &&
      setCount === exercise.duration.length &&
      setCount === exercise.restTime.length

    if (!hasEqualSetArrays) {
      return {
        accepted: false,
        assistantMessage:
          "I held this suggestion back because its set prescription was inconsistent. Please confirm that I should rebuild it with complete reps, timing, and rest for every set.",
      }
    }

    const hasEmptyWorkSet = exercise.reps.some(
      (reps, index) => reps <= 0 && (exercise.duration[index] ?? 0) <= 0,
    )
    if (hasEmptyWorkSet) {
      return {
        accepted: false,
        assistantMessage:
          "I held this suggestion back because one or more sets had neither reps nor a duration. Please confirm that I should rebuild it with a real work target for every set.",
      }
    }
  }

  if (requestedMinutes && requestedMinutes >= 30) {
    const minimumExercises = Math.min(8, Math.max(3, Math.floor(requestedMinutes / 12)))
    const minimumWorkingSets = Math.min(24, Math.max(8, Math.floor(requestedMinutes / 5)))
    const uniqueExerciseCount = new Set(exercises.map((exercise) => normalize(exercise.exerciseName))).size
    const workingSetCount = exercises.reduce((count, exercise) => count + exercise.reps.length, 0)
    const acceptsLimitedVariety = /\brepeat|\bminimal|limited variety|few exercises/.test(request)

    if (!acceptsLimitedVariety && uniqueExerciseCount < minimumExercises) {
      const libraryMessage = exerciseCatalog.length < minimumExercises
        ? `Your current library has only ${exerciseCatalog.length} available exercises.`
        : `The draft only used ${uniqueExerciseCount}.`

      return {
        accepted: false,
        assistantMessage: `${libraryMessage} That is not enough variety for the requested ${requestedMinutes}-minute session. Add more suitable exercises, allow repeated movements, or ask me to rebuild a fuller plan.`,
      }
    }

    if (workingSetCount < minimumWorkingSets) {
      return {
        accepted: false,
        assistantMessage: `I held this suggestion back because ${workingSetCount} working sets is too little for the requested ${requestedMinutes}-minute session. Please confirm that I should rebuild it with at least ${minimumWorkingSets} purposeful sets.`,
      }
    }
  }

  if (targetsBack(request)) {
    const backExerciseCount = exercises.filter((exercise) =>
      isBackExercise(exercise.exerciseName, exerciseCatalog),
    ).length
    const requiredBackExercises = Math.max(2, Math.ceil(exercises.length / 2))

    if (backExerciseCount < requiredBackExercises) {
      const availableBackExercises = exerciseCatalog.filter((exercise) =>
        isBackExercise(exercise.name, exerciseCatalog),
      ).length
      const limitation = availableBackExercises < requiredBackExercises
        ? `Your library currently exposes only ${availableBackExercises} back-targeting exercise${availableBackExercises === 1 ? "" : "s"}.`
        : "The generated exercise selection did not keep enough emphasis on the back."

      return {
        accepted: false,
        assistantMessage: `${limitation} I will not present it as a back-focused plan. Add more back exercises, relax the focus, or ask me to rebuild the selection.`,
      }
    }
  }

  return { accepted: true }
}
