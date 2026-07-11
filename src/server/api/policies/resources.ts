import { TRPCError } from "@trpc/server";
import { and, eq, isNull, or } from "drizzle-orm";

import type { TRPCContext } from "@/trpc/server";
import { exercise } from "@/server/db/schema/exercise";
import { workout } from "@/server/db/schema/workout";
import { getCtxUserId } from "@/server/utils/user";

type Context = NonNullable<TRPCContext>;

export async function requireOwnedWorkout(ctx: Context, workoutId: string) {
  const userId = getCtxUserId(ctx);
  const found = await ctx.db.query.workout.findFirst({
    where: and(
      eq(workout.id, workoutId),
      eq(workout.userId, userId),
      isNull(workout.archivedAt),
    ),
  });

  if (!found) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workout not found.",
    });
  }

  return found;
}

export async function requireReadableWorkout(ctx: Context, workoutId: string) {
  const userId = getCtxUserId(ctx);
  const found = await ctx.db.query.workout.findFirst({
    where: and(
      eq(workout.id, workoutId),
      isNull(workout.archivedAt),
      or(eq(workout.userId, userId), eq(workout.isPublic, true)),
    ),
  });

  if (!found) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workout not found.",
    });
  }

  return found;
}

export async function requireOwnedExercise(ctx: Context, exerciseId: string) {
  const userId = getCtxUserId(ctx);
  const found = await ctx.db.query.exercise.findFirst({
    where: and(
      eq(exercise.id, exerciseId),
      eq(exercise.userId, userId),
      isNull(exercise.archivedAt),
    ),
  });

  if (!found) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Exercise not found.",
    });
  }

  return found;
}

export async function requireReadableExercise(ctx: Context, exerciseId: string) {
  const userId = getCtxUserId(ctx);
  const found = await ctx.db.query.exercise.findFirst({
    where: and(
      eq(exercise.id, exerciseId),
      isNull(exercise.archivedAt),
      or(eq(exercise.userId, userId), eq(exercise.isPublic, true)),
    ),
  });

  if (!found) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Exercise not found.",
    });
  }

  return found;
}
