import { type db } from "@/server/db";
import { badge, badgeProgress } from "@/server/db/schema/badges";
import { BADGE_DEFINITIONS } from "@/variables/badges";
import { getEarlyUserBadgeId } from "@/variables/badges";
import { ensureEarlyUserBadge } from "@/server/services/progression";
import {
  userPrivateInformation,
  userProfile,
  userSettings,
} from "@/server/db/schema/user";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DatabaseExecutor = typeof db | Transaction;

export { getEarlyUserBadgeId };

export async function ensureBadgeProgressRows(
  executor: DatabaseExecutor,
  userId: string,
) {
  await executor
    .insert(badge)
    .values(BADGE_DEFINITIONS)
    .onConflictDoNothing();

  const badges = await executor.select({ id: badge.id }).from(badge);
  if (badges.length === 0) return;

  await executor
    .insert(badgeProgress)
    .values(badges.map(({ id }) => ({ badgeId: id, userId, completed: false })))
    .onConflictDoNothing();
}

export async function provisionUserRecords(
  executor: DatabaseExecutor,
  userId: string,
  options: { password?: string; awardEarlyUserBadge?: boolean } = {},
) {
  await executor.insert(userPrivateInformation).values({
    userId,
    password: options.password,
    role: "user",
  }).onConflictDoNothing();
  await executor.insert(userProfile).values({ userId }).onConflictDoNothing();
  await executor.insert(userSettings).values({ userId }).onConflictDoNothing();
  await ensureBadgeProgressRows(executor, userId);

  if (!options.awardEarlyUserBadge) return;

  await ensureEarlyUserBadge(executor, userId);
}
