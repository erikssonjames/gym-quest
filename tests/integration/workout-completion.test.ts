import { randomUUID } from "node:crypto"
import { beforeEach, describe, expect, test } from "vitest"

import { exercise } from "@/server/db/schema/exercise"
import { experienceEvent, workoutExperienceReview } from "@/server/db/schema/progression"
import { users } from "@/server/db/schema/user"
import {
  workoutSession,
  workoutSessionLog,
  workoutSessionLogFragment,
} from "@/server/db/schema/workout"
import { completeWorkoutWithExperience } from "@/server/services/workout-completion"
import { buildUser } from "../factories/user"
import { testDb, truncateTestDatabase } from "../support/test-database"

describe("workout completion XP safety", () => {
  beforeEach(async () => truncateTestDatabase())

  test("completes a plausible workout and awards it exactly once", async () => {
    const session = await createSession({ reps: 10, weight: 80 })
    const endedAt = new Date("2026-07-18T10:30:00.000Z")

    const first = await completeWorkoutWithExperience(testDb, {
      endedAt,
      session,
      userId: session.userId,
    })
    const duplicate = await completeWorkoutWithExperience(testDb, {
      endedAt,
      session,
      userId: session.userId,
    })

    expect(first).toMatchObject({ pendingReview: false })
    expect(duplicate).toBeNull()
    expect(await testDb.select().from(experienceEvent)).toHaveLength(1)
    expect(await testDb.select().from(workoutExperienceReview)).toHaveLength(0)
  })

  test("withholds suspicious workout XP and creates one pending admin review", async () => {
    const session = await createSession({ reps: 20, weight: 1_000 })

    const result = await completeWorkoutWithExperience(testDb, {
      endedAt: new Date("2026-07-18T10:30:00.000Z"),
      session,
      userId: session.userId,
    })

    expect(result).toMatchObject({ pendingReview: true })
    expect(await testDb.select().from(experienceEvent)).toHaveLength(0)
    const reviews = await testDb.select().from(workoutExperienceReview)
    expect(reviews).toHaveLength(1)
    expect(reviews[0]).toMatchObject({
      status: "pending",
      maxWeight: 1_000,
      maxReps: 20,
      maxSetVolume: 20_000,
    })
  })
})

async function createSession({ reps, weight }: { reps: number; weight: number }) {
  const user = buildUser()
  const exerciseId = randomUUID()
  const sessionId = randomUUID()
  const logId = randomUUID()
  const startedAt = new Date("2026-07-18T10:00:00.000Z")

  await testDb.insert(users).values(user)
  await testDb.insert(exercise).values({
    id: exerciseId,
    name: "Bench press",
    description: "Completion safety test exercise",
    isPublic: false,
    userId: user.id!,
  })
  await testDb.insert(workoutSession).values({
    id: sessionId,
    userId: user.id!,
    startedAt,
  })
  await testDb.insert(workoutSessionLog).values({
    id: logId,
    exerciseId,
    order: 0,
    startedAt,
    workoutSessionId: sessionId,
  })
  await testDb.insert(workoutSessionLogFragment).values({
    duration: 30,
    endedAt: new Date(startedAt.getTime() + 30_000),
    order: 0,
    reps,
    restTime: 0,
    startedAt,
    weight,
    workoutSessionLogId: logId,
  })

  const session = await testDb.query.workoutSession.findFirst({
    where: (table, { eq }) => eq(table.id, sessionId),
    with: {
      workoutSessionLogs: {
        with: {
          exercise: true,
          workoutSessionLogFragments: true,
        },
      },
    },
  })

  if (!session) throw new Error("Test workout session was not created")
  return session
}
