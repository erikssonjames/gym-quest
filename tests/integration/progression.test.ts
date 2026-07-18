import { randomUUID } from "node:crypto"
import { beforeEach, describe, expect, test } from "vitest"

import {
  awardExperience,
  awardWorkoutExperience,
  getUserProgression,
} from "@/server/services/progression"
import { experienceEvent } from "@/server/db/schema/progression"
import { users } from "@/server/db/schema/user"
import { buildUser } from "../factories/user"
import {
  testDb,
  truncateTestDatabase,
} from "../support/test-database"

describe("progression persistence", () => {
  beforeEach(async () => truncateTestDatabase())

  test("awards a source once and calculates the persisted level", async () => {
    const user = buildUser()
    await testDb.insert(users).values(user)

    const firstAward = await awardExperience(testDb, {
      userId: user.id!,
      source: "quest",
      sourceId: "daily-workout:2026-07-12",
      amount: 750,
    })
    const duplicateAward = await awardExperience(testDb, {
      userId: user.id!,
      source: "quest",
      sourceId: "daily-workout:2026-07-12",
      amount: 750,
    })

    expect(firstAward).toHaveLength(1)
    expect(duplicateAward).toHaveLength(0)
    await expect(getUserProgression(testDb, user.id!)).resolves.toMatchObject({
      level: 2,
      totalExperience: 750,
      experienceIntoLevel: 250,
    })

    const persistedEvents = await testDb.select().from(experienceEvent)
    expect(persistedEvents).toHaveLength(1)
  })

  test("awards each completed workout once and combines progression sources", async () => {
    const user = buildUser()
    const sessionId = randomUUID()
    const startedAt = new Date("2026-07-12T10:00:00.000Z")
    const session = {
      workoutSessionLogs: [{
        workoutSessionLogFragments: Array.from({ length: 8 }, () => ({
          reps: 10,
          weight: 80,
          startedAt,
          endedAt: new Date(startedAt.getTime() + 30_000),
        })),
      }],
    }
    await testDb.insert(users).values(user)

    const firstAward = await awardWorkoutExperience(testDb, {
      session,
      sessionId,
      userId: user.id!,
    })
    const duplicateAward = await awardWorkoutExperience(testDb, {
      session,
      sessionId,
      userId: user.id!,
    })
    await awardExperience(testDb, {
      userId: user.id!,
      source: "quest",
      sourceId: "daily-session:2026-07-12",
      amount: 300,
    })

    expect(firstAward.total).toBe(792)
    expect(duplicateAward.total).toBe(792)
    await expect(getUserProgression(testDb, user.id!)).resolves.toMatchObject({
      level: 2,
      totalExperience: 1_092,
      experienceIntoLevel: 592,
    })

    const persistedEvents = await testDb.select().from(experienceEvent)
    expect(persistedEvents).toHaveLength(2)
  })
})
