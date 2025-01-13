import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { exercise, exerciseMuscle, ExerciseZod, InsertExerciseZod } from "@/server/db/schema/exercise";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const exerciseRouter = createTRPCRouter({
  createExercise: protectedProcedure
    .input(z.object({
      ...InsertExerciseZod.shape,
      muscleIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, description, muscleIds } = input;

      const newExercise = await ctx.db.insert(exercise).values({
        name,
        description,
      }).returning({ id: exercise.id });

      const exerciseId = newExercise[0]?.id;

      if (!exerciseId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create exercise."
        });
      }

      if (muscleIds && muscleIds.length > 0) {
        await ctx.db.insert(exerciseMuscle).values(
          muscleIds.map((muscleId) => ({
            exerciseId,
            muscleId,
          }))
        );
      }

      return { id: exerciseId, name, description };
    }),

  getExercises: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.exercise.findMany({
      with: {
        exerciseMuscle: {
          with: {
            muscle: true,
          },
        },
      },
    });
  }),

  getExerciseById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const exerciseData = await ctx.db.query.exercise.findFirst({
        where: eq(exercise.id, id),
        with: {
          exerciseMuscle: {
            with: {
              muscle: true,
            },
          },
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
      const { id, name, description, muscleIds } = input;

      await ctx.db.update(exercise).set({
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
      }).where(eq(exercise.id, id));

      if (muscleIds) {
        await ctx.db.delete(exerciseMuscle).where(eq(exerciseMuscle.exerciseId, id));

        if (muscleIds.length > 0) {
          await ctx.db.insert(exerciseMuscle).values(
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
      const { id } = input;

      await ctx.db.delete(exerciseMuscle).where(eq(exerciseMuscle.exerciseId, id));
      await ctx.db.delete(exercise).where(eq(exercise.id, id));

      return { id };
    }),
});
