import { and, count, eq, inArray, lt, lte, ne, or, sql } from "drizzle-orm"

import { getBadgeExperience, getLevelFromExperience } from "@/lib/experience"
import { type db } from "@/server/db"
import { badge, badgeProgress } from "@/server/db/schema/badges"
import { experienceEvent } from "@/server/db/schema/progression"
import { users } from "@/server/db/schema/user"
import { BADGE_GROUP_RECORD, getEarlyUserBadgeId } from "@/variables/badges"
import { SYSTEM_USER_ID } from "@/variables/auth"

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type DatabaseExecutor = typeof db | Transaction

export async function awardExperience(
  executor: DatabaseExecutor,
  input: { userId: string; source: string; sourceId: string; amount: number },
) {
  return await executor
    .insert(experienceEvent)
    .values(input)
    .onConflictDoNothing()
    .returning({ id: experienceEvent.id })
}

export async function ensureEarlyUserBadge(
  executor: DatabaseExecutor,
  userId: string,
) {
  if (userId === SYSTEM_USER_ID) return null

  const account = await executor.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, createdAt: true },
  })
  if (!account) return null

  const [{ value: signupRank } = { value: 0 }] = await executor
    .select({ value: count() })
    .from(users)
    .where(and(
      ne(users.id, SYSTEM_USER_ID),
      or(
        lt(users.createdAt, account.createdAt),
        and(eq(users.createdAt, account.createdAt), lte(users.id, account.id)),
      ),
    ))

  const earlyBadgeIds = BADGE_GROUP_RECORD.early_user.map((earlyBadge) => earlyBadge.id)
  const badgeId = getEarlyUserBadgeId(signupRank)
  await executor
    .update(badgeProgress)
    .set({ completed: false })
    .where(and(
      eq(badgeProgress.userId, userId),
      inArray(badgeProgress.badgeId, earlyBadgeIds),
    ))

  await executor
    .delete(experienceEvent)
    .where(and(
      eq(experienceEvent.userId, userId),
      eq(experienceEvent.source, "badge"),
      inArray(experienceEvent.sourceId, earlyBadgeIds),
      ...(badgeId ? [ne(experienceEvent.sourceId, badgeId)] : []),
    ))

  if (!badgeId) return null

  await executor
    .update(badgeProgress)
    .set({ completed: true })
    .where(and(
      eq(badgeProgress.userId, userId),
      eq(badgeProgress.badgeId, badgeId),
    ))

  return badgeId
}

export async function syncAchievementExperience(
  executor: DatabaseExecutor,
  userId: string,
) {
  const completedBadges = await executor
    .select({ id: badge.id, groupWeighting: badge.groupWeighting })
    .from(badgeProgress)
    .innerJoin(badge, eq(badge.id, badgeProgress.badgeId))
    .where(and(
      eq(badgeProgress.userId, userId),
      eq(badgeProgress.completed, true),
    ))

  if (completedBadges.length === 0) return

  await executor
    .insert(experienceEvent)
    .values(completedBadges.map((completedBadge) => ({
      userId,
      source: "badge",
      sourceId: completedBadge.id,
      amount: getBadgeExperience(completedBadge.groupWeighting),
    })))
    .onConflictDoNothing()
}

export async function getUserProgression(
  executor: DatabaseExecutor,
  userId: string,
) {
  await syncAchievementExperience(executor, userId)

  const [{ total } = { total: 0 }] = await executor
    .select({ total: sql<number>`coalesce(sum(${experienceEvent.amount}), 0)::int` })
    .from(experienceEvent)
    .where(eq(experienceEvent.userId, userId))

  return getLevelFromExperience(total)
}
