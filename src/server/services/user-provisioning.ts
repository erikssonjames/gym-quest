import { and, count, eq } from "drizzle-orm";

import { type db } from "@/server/db";
import { badge, badgeProgress } from "@/server/db/schema/badges";
import {
  userPrivateInformation,
  userProfile,
  userSettings,
  users,
} from "@/server/db/schema/user";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DatabaseExecutor = typeof db | Transaction;

export function getEarlyUserBadgeId(userNumber: number) {
  if (userNumber <= 10) return "0-10th_user";
  if (userNumber <= 50) return "11-50th_user";
  if (userNumber <= 100) return "51-100th_user";
  if (userNumber <= 500) return "101-500th_user";
  if (userNumber <= 1000) return "501-1000th_user";
  return null;
}

export async function ensureBadgeProgressRows(
  executor: DatabaseExecutor,
  userId: string,
) {
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

  const [{ value: userCount } = { value: 0 }] = await executor
    .select({ value: count() })
    .from(users);
  const badgeId = getEarlyUserBadgeId(userCount);
  if (!badgeId) return;

  await executor
    .update(badgeProgress)
    .set({ completed: true })
    .where(and(
      eq(badgeProgress.userId, userId),
      eq(badgeProgress.badgeId, badgeId),
    ));
}
