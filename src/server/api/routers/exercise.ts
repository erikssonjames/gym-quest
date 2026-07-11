import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { exercise, exercisePublicRequest, exerciseToMuscle, ExerciseZod, InsertExerciseZod } from "@/server/db/schema/exercise";
import { and, eq, isNull, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { requireOwnedExercise, requireReadableExercise } from "../policies/resources";

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

      return ctx.db.transaction(async (tx) => {
        const newExercise = await tx.insert(exercise).values({
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

        if (muscleIds.length > 0) {
          await tx.insert(exerciseToMuscle).values(
            muscleIds.map((muscleId) => ({
              exerciseId,
              muscleId,
            }))
          );
        }

        if (requestToBePublic) {
          await tx.insert(exercisePublicRequest).values({ exerciseId })
        }

        return { id: exerciseId, name, description };
      })
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
      where: and(
        isNull(exercise.archivedAt),
        or(
          eq(exercise.userId, userId),
          eq(exercise.isPublic, true)
        )
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

  getExerciseById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      await requireReadableExercise(ctx, id)
      const exerciseData = await ctx.db.query.exercise.findFirst({
        where: and(eq(exercise.id, id), isNull(exercise.archivedAt)),
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
      await requireOwnedExercise(ctx, id)

      await ctx.db.transaction(async (tx) => {
        await tx.update(exercise).set({
          ...(name ? { name } : {}),
          ...(description ? { description } : {})
        }).where(and(eq(exercise.id, id), eq(exercise.userId, userId)));

        await tx.delete(exerciseToMuscle).where(eq(exerciseToMuscle.exerciseId, id));

        if (muscleIds.length > 0) {
          await tx.insert(exerciseToMuscle).values(
            muscleIds.map((muscleId) => ({
              exerciseId: id,
              muscleId,
            }))
          );
        }
      })

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
      await requireOwnedExercise(ctx, id)

      await ctx.db.update(exercise)
        .set({ archivedAt: new Date(), isPublic: false })
        .where(and(eq(exercise.id, id), eq(exercise.userId, userId)));

      return { id };
    }),
});
