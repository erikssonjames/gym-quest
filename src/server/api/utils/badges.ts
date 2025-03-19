import { Badge, badgeProgress, badgeProgressEvent } from "@/server/db/schema/badges";
import type { WorkoutSession, WorkoutSessionLog, WorkoutSessionLogFragment } from "@/server/db/schema/workout";
import { getCtxUserId } from "@/server/utils/user";
import type { TRPCContext } from "@/trpc/server";
import { BADGE_GROUP_RECORD, BADGE_GROUPS, type BadgeLiteral, type BadgeGroupName } from "@/variables/badges";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

type Session = WorkoutSession & {
  workoutSessionLogs: Array<
    WorkoutSessionLog & {
      workoutSessionLogFragments: Array<WorkoutSessionLogFragment>
    }
  >
}

const SOFT_LIMIT_WEIGHT = 100000

/**
 * The main entry point to handle badges progress after a new workout session is completed.
 */
export async function handleBadgeProgressFromWorkoutSession(
  ctx: NonNullable<TRPCContext>,
  session: Session
): Promise<Badge[]> {
  const userId = getCtxUserId(ctx);

  // Decide which badge groups we want to process
  const relevantBadgeGroups: BadgeGroupName[] = [
    "consistent_lifter",
    "frequent_lifter",
    "weight_lifting",
  ];

  // Collect badge IDs from those groups
  const relevantBadgeIds = BADGE_GROUPS.flatMap((group) => {
    return relevantBadgeGroups.includes(group.id)
      ? group.badges.map((b) => b.id)
      : [];
  });

  // Fetch current progress for this user for only those badges
  const usersCurrentProgress = await ctx.db.query.badgeProgress.findMany({
    where: and(
      inArray(badgeProgress.badgeId, relevantBadgeIds),
      eq(badgeProgress.userId, userId),
    ),
    with: {
      progressEvents: true,
      badge: true,
    },
  });

  // We'll collect any badges that get updated/unlocked
  const updatedBadges: Badge[] = [];

  // 1) Handle weight-lifting badges
  const weightLiftingUpdated = await updateWeightLiftingProgress(ctx, session, userId, usersCurrentProgress);
  updatedBadges.push(...weightLiftingUpdated);

  // 2) Handle frequent-lifter badges
  const frequentLifterUpdated = await updateFrequentLifterProgress(ctx, userId, usersCurrentProgress);
  updatedBadges.push(...frequentLifterUpdated);

  // 3) Handle consistent-lifter (consecutive-day) badges
  const consistentLifterUpdated = await updateConsistentLifterProgress(ctx, userId, usersCurrentProgress);
  updatedBadges.push(...consistentLifterUpdated);

  return updatedBadges;
}

// ------------------- Sub-Functions -------------------

/**
 * Handle "weight_lifting" badges (e.g., 1000kg, 5000kg, 10000kg, etc.).
 * - Checks for suspicious amounts
 * - Updates progress events
 * - Unlocks badges if needed
 */
async function updateWeightLiftingProgress(
  ctx: NonNullable<TRPCContext>,
  session: Session,
  userId: string,
  usersCurrentProgress: Array<{
    id: string;
    badgeId: string;
    completed: boolean;
    badge: Badge;
    progressEvents: Array<{ timestamp: Date; value: number }>;
  }>
): Promise<Badge[]> {
  const unlockedBadges: Badge[] = [];

  // 1) Calculate weight lifted in this session
  const weightLiftedThisSession = Math.max(
    session.workoutSessionLogs.reduce<number>((acc, log) => {
      return (
        acc +
        log.workoutSessionLogFragments.reduce<number>((sum, frag) => {
          return sum + frag.reps * frag.weight;
        }, 0)
      );
    }, 0),
    0,
  );

  if (weightLiftedThisSession > SOFT_LIMIT_WEIGHT) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Suspicious amount of weight lifted for this session. Please contact support.",
    });
  }

  // 2) Validate that the user’s completed weight-lifting badges are in correct group order
  const weightLiftingBadges = BADGE_GROUP_RECORD.weight_lifting.map((b) => b.id);
  const completedWeightLiftingBadges = usersCurrentProgress.filter(
    (p) => weightLiftingBadges.includes(p.badgeId as BadgeLiteral["id"]) && p.completed,
  );

  const validWeightLiftingCompletion = completedWeightLiftingBadges
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting)
    .every((badge, index) => {
      return badge.badge.groupWeighting === index;
    });

  if (!validWeightLiftingCompletion) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Seems like there is an error with your account (weight-lifting badges).",
    });
  }

  // 3) Figure out how many weight-lifting badges are not completed yet
  const nonCompleted = usersCurrentProgress
    .filter(
      (p) => weightLiftingBadges.includes(p.badgeId as BadgeLiteral["id"]) && !p.completed,
    )
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting);

  // 4) How much weight has the user previously lifted in total for these badges?
  const previousWeightLifted = usersCurrentProgress
    .filter((p) => weightLiftingBadges.includes(p.badgeId as BadgeLiteral["id"]))
    .reduce<number>((acc, p) => {
      return (
        acc +
        p.progressEvents.reduce<number>((sum, evt) => sum + (evt.value ?? 0), 0)
      );
    }, 0);

  // We'll use weightLeftSum to distribute the “new” weight from this session
  let weightLeftSum = weightLiftedThisSession;

  // 5) Update each incomplete badge in ascending order
  for (const progress of nonCompleted) {
    if (weightLeftSum <= 0) break;

    const target = progress.badge.valueToComplete;
    const missingToTarget = Math.max(target - previousWeightLifted, 0);
    const resultFromThisSession = missingToTarget - weightLiftedThisSession;

    // If result is <= 0, we unlocked the badge in this session
    if (resultFromThisSession <= 0) {
      // Subtract only the portion that actually unlocks it
      weightLeftSum -= missingToTarget;

      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: missingToTarget,
      });
      await unlockBadge(ctx, progress.badge);
      unlockedBadges.push(progress.badge);
    } else {
      // Did not unlock the badge, but we do add the partial event
      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: weightLeftSum,
      });
      weightLeftSum = 0;
    }
  }

  return unlockedBadges;
}

/**
 * Handle "frequent_lifter" badges (e.g., 5_workouts, 10_workouts, 25_workouts, etc.).
 * - Increments user’s "workout count"
 * - Unlocks next badge if target is reached
 */
async function updateFrequentLifterProgress(
  ctx: NonNullable<TRPCContext>,
  userId: string,
  usersCurrentProgress: Array<{
    id: string;
    badgeId: string;
    completed: boolean;
    badge: Badge;
    progressEvents: Array<{ timestamp: Date; value: number }>;
  }>
): Promise<Badge[]> {
  const unlockedBadges: Badge[] = [];

  // 1) Validate existing completions
  const workoutBadges = BADGE_GROUP_RECORD.frequent_lifter.map((b) => b.id);
  const completedWorkoutBadges = usersCurrentProgress.filter(
    (p) => workoutBadges.includes(p.badgeId as BadgeLiteral["id"]) && p.completed,
  );

  const validWorkoutCompletion = completedWorkoutBadges
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting)
    .every((badge, index) => badge.badge.groupWeighting === index);

  if (!validWorkoutCompletion) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Seems like there is an error with your account (frequent-lifter badges).",
    });
  }

  // 2) Find non-completed badges
  const nonCompletedWorkoutBadges = usersCurrentProgress
    .filter(
      (p) => workoutBadges.includes(p.badgeId as BadgeLiteral["id"]) && !p.completed,
    )
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting);

  // 3) Count how many workouts user already has
  const completedWorkouts = usersCurrentProgress
    .filter((p) => workoutBadges.includes(p.badgeId as BadgeLiteral["id"]))
    .reduce<number>((acc, p) => {
      return (
        acc +
        p.progressEvents.reduce<number>((sum, evt) => sum + (evt.value ?? 0), 0)
      );
    }, 0);

  // We only add "1" to the user’s total workouts for this session (assuming each new session = 1 new workout).
  // If you want to handle partial or multiple workouts differently, adjust as needed.
  let addedEvent = false; // so we only increment once

  for (const progress of nonCompletedWorkoutBadges) {
    if (addedEvent) break;

    const target = progress.badge.valueToComplete;
    // If user’s current total is already enough, unlock immediately
    if (completedWorkouts >= target) {
      await unlockBadge(ctx, progress.badge);
      unlockedBadges.push(progress.badge);
    }
    // If adding +1 hits or surpasses the target, unlock
    else if (completedWorkouts + 1 >= target) {
      addedEvent = true;
      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: 1,
      });
      await unlockBadge(ctx, progress.badge);
      unlockedBadges.push(progress.badge);
    }
    // Otherwise, just increment the count by +1, but don’t unlock
    else {
      addedEvent = true;
      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: 1,
      });
    }
  }

  return unlockedBadges;
}

/**
 * Handle "consistent_lifter" badges, i.e. counting consecutive workouts/day streaks.
 */
async function updateConsistentLifterProgress(
  ctx: NonNullable<TRPCContext>,
  userId: string,
  usersCurrentProgress: Array<{
    id: string;
    badgeId: string;
    completed: boolean;
    badge: Badge;
    progressEvents: Array<{ timestamp: Date; value: number }>;
  }>
): Promise<Badge[]> {
  const unlockedBadges: Badge[] = [];

  // 1) Validate existing completions
  const consistentBadges = BADGE_GROUP_RECORD.consistent_lifter.map((b) => b.id);
  const completedConsistentBadges = usersCurrentProgress.filter(
    (p) => consistentBadges.includes(p.badgeId as BadgeLiteral["id"]) && p.completed,
  );

  const validConsistentCompletion = completedConsistentBadges
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting)
    .every((badge, index) => badge.badge.groupWeighting === index);

  if (!validConsistentCompletion) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Seems like there is an error with your account (consistent-lifter badges).",
    });
  }

  // 2) Find all "consistent" progress rows & combine their events
  const consistentBadgesOnly = usersCurrentProgress.filter((p) =>
    consistentBadges.includes(p.badgeId as BadgeLiteral["id"]),
  );
  const allEvents = consistentBadgesOnly.flatMap((p) => p.progressEvents);
  const workoutsInARow = countConsecutiveWorkoutDays(allEvents);

  // 3) Check for any incomplete consistent-lifter badges
  const nonCompletedConsistentBadges = usersCurrentProgress
    .filter(
      (p) => consistentBadges.includes(p.badgeId as BadgeLiteral["id"]) && !p.completed,
    )
    .sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting);

  // 4) Possibly unlock the next "consecutive day" badge
  let addedConsistentEvent = false;
  for (const progress of nonCompletedConsistentBadges) {
    if (addedConsistentEvent) break;

    const target = progress.badge.valueToComplete;
    // If user’s streak is already >= target, unlock immediately
    if (workoutsInARow >= target) {
      await unlockBadge(ctx, progress.badge);
      unlockedBadges.push(progress.badge);
    }
    // If adding +1 day hits or surpasses the target, unlock
    else if (workoutsInARow + 1 >= target) {
      addedConsistentEvent = true;
      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: 1,
      });
      await unlockBadge(ctx, progress.badge);
      unlockedBadges.push(progress.badge);
    }
    // Otherwise, just add the day but don’t unlock
    else {
      addedConsistentEvent = true;
      await ctx.db.insert(badgeProgressEvent).values({
        badgeProgressId: progress.id,
        value: 1,
      });
    }
  }

  return unlockedBadges;
}

// ------------------- Shared Helpers -------------------

/**
 * Unlock a badge (set completed = true) for the current user.
 */
export async function unlockBadge(ctx: NonNullable<TRPCContext>, badgeToUnlock: Badge) {
  const userId = getCtxUserId(ctx);

  await ctx.db.update(badgeProgress).set({
    completed: true,
  }).where(
    and(eq(badgeProgress.badgeId, badgeToUnlock.id), eq(badgeProgress.userId, userId)),
  );
}

/**
 * Count how many consecutive days (including today) have at least 1 workout.
 * If there's a break on a given day, the streak is broken.
 */
function countConsecutiveWorkoutDays(
  progressEvents: Array<{ timestamp: Date; value: number }>
): number {
  // Put each event’s date (for which value>0) into a set
  const daysWithWorkouts = new Set<string>();
  for (const event of progressEvents) {
    if (event.value > 0) {
      const dateStr = event.timestamp.toISOString().split("T")[0]!;
      daysWithWorkouts.add(dateStr);
    }
  }

  // Start from 'today' and go backwards until we find a day that had 0 workouts
  let streak = 0;
  const current = new Date();

  while (true) {
    const dayStr = current.toISOString().split("T")[0]!;
    if (daysWithWorkouts.has(dayStr)) {
      streak++;
      current.setDate(current.getDate() - 1); // go one day back
    } else {
      break;
    }
  }
  return streak;
}