import { expect, test } from "vitest"

import type { WorkoutAiDraft } from "@/server/ai/workout-schema"
import {
  assessWorkoutDraftQuality,
  type ExerciseCatalogItem,
} from "@/server/ai/workout-quality"

const catalog: ExerciseCatalogItem[] = [
  { id: "1", name: "Pull-up", muscles: ["Latissimus dorsi", "Biceps"] },
  { id: "2", name: "Inverted row", muscles: ["Rhomboids", "Trapezius"] },
  { id: "3", name: "Scapular pull-up", muscles: ["Trapezius", "Latissimus dorsi"] },
  { id: "4", name: "Push-up", muscles: ["Pectoralis major", "Triceps"] },
  { id: "5", name: "Pike push-up", muscles: ["Deltoids", "Triceps"] },
  { id: "6", name: "Plank", muscles: ["Abdominals"] },
]

function exercise(exerciseName: string, sets = 3, reps = 8) {
  return {
    exerciseName,
    reps: Array.from({ length: sets }, () => reps),
    weight: Array.from({ length: sets }, () => 0),
    duration: Array.from({ length: sets }, () => 0),
    restTime: Array.from({ length: sets }, () => 90),
  }
}

function draft(exerciseNames: string[], sets = 3): WorkoutAiDraft {
  return {
    name: "Back-focused calisthenics",
    description: "A complete upper-body session.",
    category: "Calisthenics",
    workoutSets: exerciseNames.map((exerciseName) => ({
      exercises: [exercise(exerciseName, sets)],
    })),
  }
}

void test("rejects a sparse draft for a 60-minute request", () => {
  const result = assessWorkoutDraftQuality({
    draft: draft(["Pull-up", "Push-up", "Plank"], 1),
    messages: [{ role: "user", content: "Make a 60 minute upper-body session." }],
    exerciseCatalog: catalog,
  })

  expect(result.accepted).toBe(false)
})

void test("rejects sets with neither reps nor duration", () => {
  const invalidDraft = draft(["Pull-up"])
  invalidDraft.workoutSets[0]!.exercises[0] = exercise("Pull-up", 3, 0)

  const result = assessWorkoutDraftQuality({
    draft: invalidDraft,
    messages: [{ role: "user", content: "Make a short pull-up workout." }],
    exerciseCatalog: catalog,
  })

  expect(result.accepted).toBe(false)
})

void test("rejects inconsistent metric array lengths", () => {
  const invalidDraft = draft(["Pull-up"])
  invalidDraft.workoutSets[0]!.exercises[0]!.restTime = [90]

  const result = assessWorkoutDraftQuality({
    draft: invalidDraft,
    messages: [{ role: "user", content: "Make a short pull-up workout." }],
    exerciseCatalog: catalog,
  })

  expect(result.accepted).toBe(false)
})

void test("rejects a back-focused draft dominated by unrelated exercises", () => {
  const result = assessWorkoutDraftQuality({
    draft: draft(["Pull-up", "Push-up", "Pike push-up", "Plank"]),
    messages: [{ role: "user", content: "Make this back-focused." }],
    exerciseCatalog: catalog,
  })

  expect(result.accepted).toBe(false)
})

void test("accepts a complete 60-minute back-focused draft", () => {
  const result = assessWorkoutDraftQuality({
    draft: draft(["Pull-up", "Inverted row", "Scapular pull-up", "Push-up", "Pike push-up"]),
    messages: [{ role: "user", content: "Make a 60 minute back-focused upper-body session." }],
    exerciseCatalog: catalog,
  })

  expect(result).toEqual({ accepted: true })
})
