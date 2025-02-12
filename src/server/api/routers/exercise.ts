import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { exercise, exercisePublicRequest, exerciseToMuscle, ExerciseZod, InsertExerciseZod } from "@/server/db/schema/exercise";
import { and, eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const exerciseRouter = createTRPCRouter({
  createExercise: protectedProcedure
    .input(z.object({
      ...InsertExerciseZod.shape,
      requestToBePublic: z.boolean().optional(),
      muscleIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to access this resource."
        });
      }

      const { name, description, muscleIds, requestToBePublic } = input;

      const newExercise = await ctx.db.insert(exercise).values({
        name,
        description,
        userId
      }).returning({ id: exercise.id });

      const exerciseId = newExercise[0]?.id;

      if (!exerciseId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create exercise."
        });
      }

      if (muscleIds && muscleIds.length > 0) {
        await ctx.db.insert(exerciseToMuscle).values(
          muscleIds.map((muscleId) => ({
            exerciseId,
            muscleId,
          }))
        );
      }

      if (requestToBePublic) {
        await ctx.db.insert(exercisePublicRequest).values({ exerciseId })
      }

      return { id: exerciseId, name, description };
    }),

  getExercises: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authorized to access this resource."
      });
    }

    const exercises = await ctx.db.query.exercise.findMany({
      where: or(
        eq(exercise.userId, userId),
        eq(exercise.isPublic, true)
      ),
      with: {
        muscles: {
          with: {
            muscle: true,
          }
        },
        requestToBePublic: true
      },
    });

    return exercises.map(exercise => ({
      ...exercise,
      muscles: exercise.muscles.map(m => m.muscle)
    }))
  }),

  getExerciseById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const exerciseData = await ctx.db.query.exercise.findFirst({
        where: eq(exercise.id, id),
        with: {
          muscles: true
        },
      });

      if (!exerciseData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exercise not found."
        });
      }

      return exerciseData;
    }),

  updateExercise: protectedProcedure
    .input(z.object({
      ...ExerciseZod.shape,
      muscleIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to access this resource."
        });
      }

      const { id, name, description, muscleIds } = input;

      await ctx.db.update(exercise).set({
        ...(name ? { name } : {}),
        ...(description ? { description } : {})
      }).where(and(eq(exercise.id, id), eq(exercise.userId, userId)));

      if (muscleIds) {
        await ctx.db.delete(exerciseToMuscle).where(eq(exerciseToMuscle.exerciseId, id));

        if (muscleIds.length > 0) {
          await ctx.db.insert(exerciseToMuscle).values(
            muscleIds.map((muscleId) => ({
              exerciseId: id,
              muscleId,
            }))
          );
        }
      }

      return { id, name, description };
    }),

  deleteExercise: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to access this resource."
        });
      }

      const { id } = input;

      await ctx.db.delete(exerciseToMuscle).where(eq(exerciseToMuscle.exerciseId, id));
      await ctx.db.delete(exercise).where(and(eq(exercise.id, id), eq(exercise.userId, userId)));

      return { id };
    }),
});
