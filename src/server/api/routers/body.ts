import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { muscleGroup, muscle, MuscleGroupZod, InsertMuscleZod, MuscleZod, InsertMuscleGroupZod } from "@/server/db/schema/body";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const bodyRouter = createTRPCRouter({
  createMuscleGroup: protectedProcedure
    .input(InsertMuscleGroupZod)
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;

      const newMuscleGroup = await ctx.db.insert(muscleGroup).values({
        name,
        description,
      }).returning({ id: muscleGroup.id });

      const muscleGroupId = newMuscleGroup[0]?.id;

      if (!muscleGroupId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create muscle group."
        });
      }

      return { id: muscleGroupId, name, description };
    }),

  getMuscleGroups: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.muscleGroup.findMany();
  }),

  getMuscleGroupById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const muscleGroupData = await ctx.db.query.muscleGroup.findFirst({
        where: eq(muscleGroup.id, id),
        with: {
          muscle: true,
        },
      });

      if (!muscleGroupData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Muscle group not found."
        });
      }

      return muscleGroupData;
    }),

  updateMuscleGroup: protectedProcedure
    .input(MuscleGroupZod)
    .mutation(async ({ ctx, input }) => {
      const { id, name, description } = input;

      await ctx.db.update(muscleGroup).set({
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
      }).where(eq(muscleGroup.id, id));

      return { id, name, description };
    }),

  deleteMuscleGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const musclesLinked = await ctx.db.query.muscle.findFirst({
        where: eq(muscle.muscleGroupId, id),
      });

      if (musclesLinked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a muscle group with associated muscles."
        });
      }

      await ctx.db.delete(muscleGroup).where(eq(muscleGroup.id, id));

      return { id };
    }),

  createMuscle: protectedProcedure
    .input(InsertMuscleZod)
    .mutation(async ({ ctx, input }) => {
      const { name, latinName, muscleGroupId, description } = input;

      const newMuscle = await ctx.db.insert(muscle).values({
        name,
        latinName,
        muscleGroupId,
        description,
      }).returning({ id: muscle.id });

      const muscleId = newMuscle[0]?.id;

      if (!muscleId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create muscle."
        });
      }

      return { id: muscleId, name, latinName, description };
    }),

  getMuscles: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.muscle.findMany({
      with: {
        muscleGroup: true,
      },
    });
  }),

  getMuscleById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const muscleData = await ctx.db.query.muscle.findFirst({
        where: eq(muscle.id, id),
        with: {
          muscleGroup: true,
        },
      });

      if (!muscleData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Muscle not found."
        });
      }

      return muscleData;
    }),

  updateMuscle: protectedProcedure
    .input(MuscleZod)
    .mutation(async ({ ctx, input }) => {
      const { id, name, latinName, description, muscleGroupId } = input;

      await ctx.db.update(muscle).set({
        ...(name ? { name } : {}),
        ...(latinName ? { latinName } : {}),
        ...(description ? { description } : {}),
        ...(muscleGroupId ? { muscleGroupId } : {}),
      }).where(eq(muscle.id, id));

      return { id, name, latinName, description, muscleGroupId };
    }),

  deleteMuscle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.db.delete(muscle).where(eq(muscle.id, id));

      return { id };
    }),
});
