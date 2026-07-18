import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { createCaller } from "@/server/api/root"
import { feedWorkoutShare } from "@/server/db/schema/feed"
import { exercise } from "@/server/db/schema/exercise"
import { experienceEvent, workoutExperienceReview } from "@/server/db/schema/progression"
import { users, type NewUser } from "@/server/db/schema/user"
import {
  workout,
  workoutSession,
  workoutSessionLog,
  workoutSessionLogFragment,
} from "@/server/db/schema/workout"
import { createWorkoutShareSnapshot } from "@/server/services/workout-share"
import { buildUser } from "../factories/user"
import { testDb, truncateTestDatabase } from "../support/test-database"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

describe("workout completion sharing", () => {
  beforeEach(async () => truncateTestDatabase())

  test("persists metrics, actual XP levels, best set, and only strict eligible records", async () => {
    const alice = buildUser({ name: "Alice", username: "alice" })
    await testDb.insert(users).values(alice)
    const workoutId = randomUUID()
    const exerciseId = randomUUID()
    await testDb.insert(workout).values({
      id: workoutId,
      userId: alice.id!,
      name: "Upper power",
      description: "Workout sharing fixture",
      category: "strength",
      isPublic: false,
    })
    await testDb.insert(exercise).values({
      id: exerciseId,
      userId: alice.id!,
      name: "Bench press",
      description: "Workout sharing fixture",
      isPublic: false,
    })

    const baselineId = await insertSession({
      endedAt: "2026-07-15T10:30:00.000Z",
      exerciseId,
      sets: [{ reps: 10, weight: 80 }],
      userId: alice.id!,
      workoutId,
    })
    const tieId = await insertSession({
      endedAt: "2026-07-15T11:30:00.000Z",
      exerciseId,
      sets: [{ reps: 10, weight: 80 }],
      userId: alice.id!,
      workoutId,
    })
    await insertSession({
      endedAt: "2026-07-16T10:30:00.000Z",
      exerciseId,
      reviewStatus: "pending",
      sets: [{ reps: 10, weight: 200 }],
      userId: alice.id!,
      workoutId,
    })
    await insertSession({
      endedAt: "2026-07-17T10:30:00.000Z",
      exerciseId,
      reviewStatus: "rejected",
      sets: [{ reps: 10, weight: 300 }],
      userId: alice.id!,
      workoutId,
    })
    const currentId = await insertSession({
      endedAt: "2026-07-18T10:30:00.000Z",
      exerciseId,
      sets: [
        { reps: 10, weight: 90 },
        { reps: 12, weight: 85 },
        { reps: 20, skipped: true, weight: 100 },
      ],
      userId: alice.id!,
      workoutId,
    })
    await testDb.insert(experienceEvent).values([
      {
        userId: alice.id!,
        source: "quest",
        sourceId: "journey-five:lifetime",
        amount: 400,
        createdAt: new Date("2026-07-14T10:00:00.000Z"),
      },
      {
        userId: alice.id!,
        source: "workout",
        sourceId: currentId,
        amount: 700,
        createdAt: new Date("2026-07-18T10:30:01.000Z"),
      },
      {
        userId: alice.id!,
        source: "quest",
        sourceId: "future-source:2026-07-19",
        amount: 5_000,
        createdAt: new Date("2026-07-19T10:00:00.000Z"),
      },
    ])

    const baseline = await createWorkoutShareSnapshot(testDb, alice.id!, baselineId)
    expect(baseline.records).toEqual([])
    const tie = await createWorkoutShareSnapshot(testDb, alice.id!, tieId)
    expect(tie.records).toEqual([])

    const api = callerFor(alice)
    const first = await api.feed.createWorkoutShare({ sessionId: currentId, description: "New records" })
    const duplicate = await api.feed.createWorkoutShare({ sessionId: currentId })
    expect(duplicate).toEqual(first)

    const [share] = await testDb.select().from(feedWorkoutShare)
    expect(share?.snapshot).toMatchObject({
      workoutName: "Upper power",
      durationSeconds: 1_800,
      exerciseCount: 1,
      completedSetCount: 2,
      totalReps: 22,
      totalVolume: 1_920,
      experienceAwarded: 700,
      beforeLevel: 1,
      afterLevel: 2,
      bestSet: {
        exerciseName: "Bench press",
        reps: 12,
        weight: 85,
        volume: 1_020,
      },
    })
    expect(share?.snapshot.records).toEqual([
      expect.objectContaining({ metric: "weight", previousValue: 80, value: 90 }),
      expect.objectContaining({ metric: "set-volume", previousValue: 800, value: 1_020 }),
    ])

    await testDb.delete(workoutSession).where(eq(workoutSession.id, currentId))
    const [stableShare] = await testDb.select().from(feedWorkoutShare)
    expect(stableShare).toMatchObject({
      postId: first.postId,
      workoutSessionId: null,
      snapshot: { workoutName: "Upper power", experienceAwarded: 700 },
    })
  })

  test("rejects non-owners and current workouts with pending or rejected XP review", async () => {
    const alice = buildUser({ name: "Alice", username: "alice" })
    const bob = buildUser({ name: "Bob", username: "bob" })
    await testDb.insert(users).values([alice, bob])
    const exerciseId = randomUUID()
    await testDb.insert(exercise).values({
      id: exerciseId,
      userId: alice.id!,
      name: "Squat",
      description: "Review fixture",
      isPublic: false,
    })
    const pendingId = await insertSession({
      endedAt: "2026-07-18T10:30:00.000Z",
      exerciseId,
      reviewStatus: "pending",
      sets: [{ reps: 10, weight: 100 }],
      userId: alice.id!,
    })
    const rejectedId = await insertSession({
      endedAt: "2026-07-18T12:30:00.000Z",
      exerciseId,
      reviewStatus: "rejected",
      sets: [{ reps: 10, weight: 100 }],
      userId: alice.id!,
    })

    await expect(callerFor(bob).feed.createWorkoutShare({ sessionId: pendingId })).rejects.toMatchObject({
      code: "NOT_FOUND",
    })
    await expect(callerFor(alice).feed.createWorkoutShare({ sessionId: pendingId })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    })
    await expect(callerFor(alice).feed.createWorkoutShare({ sessionId: rejectedId })).rejects.toMatchObject({
      code: "FORBIDDEN",
    })
  })
})

async function insertSession({
  endedAt,
  exerciseId,
  reviewStatus,
  sets,
  userId,
  workoutId,
}: {
  endedAt: string
  exerciseId: string
  reviewStatus?: "pending" | "rejected"
  sets: Array<{ reps: number; skipped?: boolean; weight: number }>
  userId: string
  workoutId?: string
}) {
  const sessionId = randomUUID()
  const logId = randomUUID()
  const end = new Date(endedAt)
  const start = new Date(end.getTime() - 30 * 60 * 1_000)
  await testDb.insert(workoutSession).values({
    id: sessionId,
    userId,
    workoutId,
    startedAt: start,
    endedAt: end,
  })
  await testDb.insert(workoutSessionLog).values({
    id: logId,
    workoutSessionId: sessionId,
    exerciseId,
    order: 0,
    startedAt: start,
    endedAt: end,
  })
  await testDb.insert(workoutSessionLogFragment).values(sets.map((set, order) => ({
    workoutSessionLogId: logId,
    order,
    reps: set.reps,
    weight: set.weight,
    duration: set.skipped ? 0 : 30,
    restTime: 0,
    startedAt: set.skipped ? null : new Date(start.getTime() + order * 60_000),
    endedAt: set.skipped ? null : new Date(start.getTime() + order * 60_000 + 30_000),
  })))
  if (reviewStatus) {
    await testDb.insert(workoutExperienceReview).values({
      workoutSessionId: sessionId,
      userId,
      status: reviewStatus,
      proposedExperience: 500,
      reasons: ["Test review"],
      completedSetCount: sets.length,
      totalVolume: sets.reduce((total, set) => total + set.reps * set.weight, 0),
      maxWeight: Math.max(...sets.map((set) => set.weight)),
      maxReps: Math.max(...sets.map((set) => set.reps)),
      maxSetVolume: Math.max(...sets.map((set) => set.reps * set.weight)),
    })
  }
  return sessionId
}

function callerFor(user: NewUser) {
  return createCaller({
    db: testDb,
    headers: new Headers(),
    session: {
      expires: "2099-01-01T00:00:00.000Z",
      user: {
        email: user.email,
        id: user.id!,
        image: user.image ?? null,
        name: user.name ?? null,
        provider: "credentials",
        role: "user",
        username: user.username ?? undefined,
      },
    },
  })
}
