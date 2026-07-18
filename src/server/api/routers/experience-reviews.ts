import { TRPCError } from "@trpc/server"
import { and, asc, eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, adminProcedure } from "@/server/api/trpc"
import { handleBadgeProgressFromWorkoutSession } from "@/server/api/utils/badges"
import { workoutExperienceReview } from "@/server/db/schema/progression"
import { users } from "@/server/db/schema/user"
import { workout, workoutSession } from "@/server/db/schema/workout"
import { awardWorkoutExperience } from "@/server/services/progression"

export const experienceReviewsRouter = createTRPCRouter({
  getPending: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: workoutExperienceReview.id,
        workoutSessionId: workoutExperienceReview.workoutSessionId,
        userId: workoutExperienceReview.userId,
        userName: users.name,
        userEmail: users.email,
        workoutName: workout.name,
        sessionStartedAt: workoutSession.startedAt,
        sessionEndedAt: workoutSession.endedAt,
        proposedExperience: workoutExperienceReview.proposedExperience,
        reasons: workoutExperienceReview.reasons,
        completedSetCount: workoutExperienceReview.completedSetCount,
        totalVolume: workoutExperienceReview.totalVolume,
        maxWeight: workoutExperienceReview.maxWeight,
        maxReps: workoutExperienceReview.maxReps,
        maxSetVolume: workoutExperienceReview.maxSetVolume,
        createdAt: workoutExperienceReview.createdAt,
      })
      .from(workoutExperienceReview)
      .innerJoin(users, eq(users.id, workoutExperienceReview.userId))
      .innerJoin(workoutSession, eq(workoutSession.id, workoutExperienceReview.workoutSessionId))
      .leftJoin(workout, eq(workout.id, workoutSession.workoutId))
      .where(eq(workoutExperienceReview.status, "pending"))
      .orderBy(asc(workoutExperienceReview.createdAt))
  }),

  resolve: adminProcedure
    .input(z.object({
      reviewId: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.query.workoutExperienceReview.findFirst({
        where: eq(workoutExperienceReview.id, input.reviewId),
        with: {
          workoutSession: {
            with: {
              workoutSessionLogs: {
                with: {
                  exercise: true,
                  workoutSessionLogFragments: true,
                },
              },
            },
          },
        },
      })

      if (!review?.workoutSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The workout review could not be found.",
        })
      }

      const resolved = await ctx.db.transaction(async (tx) => {
        const [updatedReview] = await tx
          .update(workoutExperienceReview)
          .set({
            status: input.decision,
            reviewedAt: new Date(),
            reviewedBy: ctx.session.user.id,
          })
          .where(and(
            eq(workoutExperienceReview.id, input.reviewId),
            eq(workoutExperienceReview.status, "pending"),
          ))
          .returning({ id: workoutExperienceReview.id })

        if (!updatedReview) return null

        if (input.decision === "approved") {
          await awardWorkoutExperience(tx, {
            session: review.workoutSession,
            sessionId: review.workoutSessionId,
            userId: review.userId,
          })
        }

        return updatedReview
      })

      if (!resolved) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This workout has already been reviewed.",
        })
      }

      if (input.decision === "approved") {
        const performedSession = {
          ...review.workoutSession,
          workoutSessionLogs: review.workoutSession.workoutSessionLogs.map((log) => ({
            ...log,
            workoutSessionLogFragments: log.workoutSessionLogFragments.filter((fragment) => (
              fragment.startedAt !== null && fragment.endedAt !== null
            )),
          })),
        }

        try {
          await handleBadgeProgressFromWorkoutSession(ctx.db, review.userId, performedSession)
        } catch (error) {
          console.error("Could not update badge progress after XP review approval", error)
        }
      }

      return { decision: input.decision, reviewId: input.reviewId }
    }),
})
