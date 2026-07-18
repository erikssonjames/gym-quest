import { randomUUID } from "node:crypto"
import { beforeEach, describe, expect, test } from "vitest"

import { exercise } from "@/server/db/schema/exercise"
import {
  workoutSession,
  workoutSessionLog,
  workoutSessionLogFragment,
} from "@/server/db/schema/workout"
import { users } from "@/server/db/schema/user"
import { workoutExperienceReview } from "@/server/db/schema/progression"
import { getQuestBoard } from "@/server/services/quests"
import { buildUser } from "../factories/user"
import { testDb, truncateTestDatabase } from "../support/test-database"

describe("quest workout eligibility", () => {
  beforeEach(async () => truncateTestDatabase())

  test("workout quests ignore empty sessions and count performed sets", async () => {
    const now = new Date("2026-07-12T12:00:00.000Z")
    const user = buildUser()
    const exerciseId = randomUUID()
    const emptySessionId = randomUUID()
    await testDb.insert(users).values(user)
    await testDb.insert(exercise).values({
      id: exerciseId,
      name: "Test lift",
      description: "Used to verify quest progress.",
      isPublic: false,
      userId: user.id!,
    })
    await testDb.insert(workoutSession).values({
      id: emptySessionId,
      userId: user.id!,
      startedAt: new Date("2026-07-12T09:00:00.000Z"),
      endedAt: new Date("2026-07-12T09:30:00.000Z"),
    })

    const emptyBoard = await getQuestBoard(testDb, user.id!, now)
    expect(emptyBoard.quests.find((quest) => quest.id === "daily-session")).toMatchObject({
      current: 0,
      completed: false,
      experience: 300,
    })

    const performedSessionId = randomUUID()
    const logId = randomUUID()
    await testDb.insert(workoutSession).values({
      id: performedSessionId,
      userId: user.id!,
      startedAt: new Date("2026-07-12T10:00:00.000Z"),
      endedAt: new Date("2026-07-12T10:30:00.000Z"),
    })
    await testDb.insert(workoutSessionLog).values({
      id: logId,
      order: 0,
      workoutSessionId: performedSessionId,
      exerciseId,
      startedAt: new Date("2026-07-12T10:05:00.000Z"),
      endedAt: new Date("2026-07-12T10:06:00.000Z"),
    })
    await testDb.insert(workoutSessionLogFragment).values({
      order: 0,
      workoutSessionLogId: logId,
      reps: 10,
      weight: 80,
      duration: 30,
      restTime: 0,
      startedAt: new Date("2026-07-12T10:05:00.000Z"),
      endedAt: new Date("2026-07-12T10:05:30.000Z"),
    })

    const performedBoard = await getQuestBoard(testDb, user.id!, now)
    expect(performedBoard.quests.find((quest) => quest.id === "daily-session")).toMatchObject({
      current: 1,
      completed: true,
      experience: 300,
    })
    expect(performedBoard.quests.find((quest) => quest.id === "daily-sets")).toMatchObject({
      current: 1,
      completed: false,
      experience: 400,
    })
  })

  test("workout quests exclude flagged sessions until an admin approves them", async () => {
    const now = new Date("2026-07-12T12:00:00.000Z")
    const user = buildUser()
    const exerciseId = randomUUID()
    const sessionId = randomUUID()
    const logId = randomUUID()
    await testDb.insert(users).values(user)
    await testDb.insert(exercise).values({
      id: exerciseId,
      name: "Flagged lift",
      description: "Used to verify review eligibility.",
      isPublic: false,
      userId: user.id!,
    })
    await testDb.insert(workoutSession).values({
      id: sessionId,
      userId: user.id!,
      startedAt: new Date("2026-07-12T10:00:00.000Z"),
      endedAt: new Date("2026-07-12T10:30:00.000Z"),
    })
    await testDb.insert(workoutSessionLog).values({
      id: logId,
      order: 0,
      workoutSessionId: sessionId,
      exerciseId,
    })
    await testDb.insert(workoutSessionLogFragment).values({
      order: 0,
      workoutSessionLogId: logId,
      reps: 20,
      weight: 1_000,
      duration: 30,
      restTime: 0,
      startedAt: new Date("2026-07-12T10:05:00.000Z"),
      endedAt: new Date("2026-07-12T10:05:30.000Z"),
    })
    const [review] = await testDb.insert(workoutExperienceReview).values({
      workoutSessionId: sessionId,
      userId: user.id!,
      proposedExperience: 172,
      reasons: ["Implausible set"],
      completedSetCount: 1,
      totalVolume: 20_000,
      maxWeight: 1_000,
      maxReps: 20,
      maxSetVolume: 20_000,
    }).returning()

    const pendingBoard = await getQuestBoard(testDb, user.id!, now)
    expect(pendingBoard.quests.find((quest) => quest.id === "daily-session")?.current).toBe(0)

    await testDb.update(workoutExperienceReview).set({ status: "approved" })
    const approvedBoard = await getQuestBoard(testDb, user.id!, now)
    expect(approvedBoard.quests.find((quest) => quest.id === "daily-session")?.current).toBe(1)
    expect(review).toBeDefined()
  })
})
