type WorkoutCollection = {
  reps: number[]
  duration: number[]
  restTime: number[]
}

type WorkoutGroup = {
  workoutSetCollections: WorkoutCollection[]
}

const PREPARATION_SECONDS = 5 * 60
const SECONDS_PER_REP = 3
const MOVEMENT_TRANSITION_SECONDS = 15
const GROUP_TRANSITION_SECONDS = 45
const DISPLAY_INCREMENT_MINUTES = 5

function valueAt(values: number[], index: number) {
  return values[index] ?? values.at(-1) ?? 0
}

export function estimateWorkoutDurationMinutes(workoutGroups: WorkoutGroup[]) {
  const groups = workoutGroups.filter((group) => group.workoutSetCollections.length > 0)
  if (groups.length === 0) return 0

  const plannedSeconds = groups.reduce((workoutSeconds, group) => {
    const roundCount = group.workoutSetCollections.reduce(
      (largest, collection) => Math.max(largest, collection.reps.length, collection.duration.length),
      0,
    )

    const workSeconds = group.workoutSetCollections.reduce((groupSeconds, collection) => {
      const collectionSeconds = Array.from({ length: roundCount }).reduce<number>((seconds, _, index) => {
        const explicitDuration = valueAt(collection.duration, index)
        const repetitionDuration = valueAt(collection.reps, index) * SECONDS_PER_REP
        return seconds + (explicitDuration > 0 ? explicitDuration : repetitionDuration)
      }, 0)

      return groupSeconds + collectionSeconds
    }, 0)

    const restSeconds = Array.from({ length: Math.max(0, roundCount - 1) }).reduce<number>(
      (seconds, _, roundIndex) => seconds + Math.max(
        ...group.workoutSetCollections.map((collection) => valueAt(collection.restTime, roundIndex)),
      ),
      0,
    )

    const movementTransitions = Math.max(0, group.workoutSetCollections.length - 1) * MOVEMENT_TRANSITION_SECONDS
    return workoutSeconds + workSeconds + restSeconds + movementTransitions
  }, PREPARATION_SECONDS)

  const groupTransitions = Math.max(0, groups.length - 1) * GROUP_TRANSITION_SECONDS
  const totalMinutes = (plannedSeconds + groupTransitions) / 60

  return Math.ceil(totalMinutes / DISPLAY_INCREMENT_MINUTES) * DISPLAY_INCREMENT_MINUTES
}
