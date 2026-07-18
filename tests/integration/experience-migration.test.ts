import { readFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, test } from "vitest"

import { badge } from "@/server/db/schema/badges"
import { exercise } from "@/server/db/schema/exercise"
import { experienceEvent, questClaim } from "@/server/db/schema/progression"
import { users } from "@/server/db/schema/user"
import {
  workoutSession,
  workoutSessionLog,
  workoutSessionLogFragment,
} from "@/server/db/schema/workout"
import { getUserProgression } from "@/server/services/progression"
import { buildUser } from "../factories/user"
import {
  testClient,
  testDb,
  truncateTestDatabase,
} from "../support/test-database"

describe("faster experience economy migration", () => {
  beforeEach(async () => truncateTestDatabase())

  test("reprices existing rewards and backfills completed workouts", async () => {
    const user = buildUser()
    const exerciseId = randomUUID()
    const sessionId = randomUUID()
    const logId = randomUUID()
    await testDb.insert(users).values(user)
    await testDb.insert(badge).values({
      id: "migration-test-badge",
      name: "Migration test badge",
      description: "Verifies achievement repricing.",
      valueToComplete: 1,
      valueName: "test",
      valueDescription: "Test progress",
      group: "weight_lifting",
      groupWeighting: 2,
      percentageOfUsersHasBadge: 0,
    })
    await testDb.insert(questClaim).values({
      userId: user.id!,
      questId: "daily-session",
      periodKey: "2026-07-12",
      experienceAwarded: 100,
    })
    await testDb.insert(experienceEvent).values([
      {
        userId: user.id!,
        source: "quest",
        sourceId: "daily-session:2026-07-12",
        amount: 100,
      },
      {
        userId: user.id!,
        source: "badge",
        sourceId: "migration-test-badge",
        amount: 150,
      },
    ])
    await testDb.insert(exercise).values({
      id: exerciseId,
      name: "Migration test lift",
      description: "Verifies workout XP backfill.",
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
      startedAt: new Date("2026-07-12T10:05:00.000Z"),
      endedAt: new Date("2026-07-12T10:05:30.000Z"),
    })
    await testDb.insert(workoutSessionLogFragment).values({
      order: 0,
      workoutSessionLogId: logId,
      reps: 10,
      weight: 80,
      duration: 999,
      restTime: 0,
      startedAt: new Date("2026-07-12T10:05:00.000Z"),
      endedAt: new Date("2026-07-12T10:05:30.000Z"),
    })

    const migration = readFileSync(
      "drizzle/0009_faster_experience_economy.sql",
      "utf8",
    )
    for (const statement of migration.split("--> statement-breakpoint")) {
      if (statement.trim()) await testClient.unsafe(statement)
    }

    const [claim] = await testDb.select().from(questClaim)
    const events = await testDb
      .select()
      .from(experienceEvent)
      .where(eq(experienceEvent.userId, user.id!))

    expect(claim?.experienceAwarded).toBe(300)
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "quest", amount: 300 }),
      expect.objectContaining({ source: "badge", amount: 2_250 }),
      expect.objectContaining({
        source: "workout",
        sourceId: sessionId,
        amount: 124,
      }),
    ]))
    await expect(getUserProgression(testDb, user.id!)).resolves.toMatchObject({
      level: 3,
      totalExperience: 2_674,
      experienceIntoLevel: 674,
    })
  })
})
