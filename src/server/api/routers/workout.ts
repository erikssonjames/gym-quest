import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  workout,
  workoutReview,
  InsertWorkoutZod,
  InsertWorkoutReviewZod,
  CreateWorkoutInputZod,
  workoutSet,
  InsertWorkoutSetZod,
  InsertWorkoutSetCollectionZod,
  workoutSetCollection,
  type FullWorkout,
  workoutToUser,
  workoutSession,
  CreateWorkoutSessionZod,
  workoutSessionLog,
  workoutSessionLogFragment,
  WorkoutSessionLogFragmentZod,
  type WorkoutSessionLogFragment,
  WorkoutSessionLogZod,
  InsertWorkoutSessionLogFragmentZod,
  type WorkoutSessionLog,
  InsertWorkoutSessionLogZod,
} from "@/server/db/schema/workout";
import { and, desc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { type TRPCContext } from "@/trpc/server";
import { getUserFriendsIds } from "../utils/friends";
import { emitServerSocketEvent } from "@/server/socket";
import { WorkoutEvent } from "@/socket/enums/workout";
import { getCtxUserId } from "@/server/utils/user";
import { type Exercise, exercise } from "@/server/db/schema/exercise";
import { handleBadgeProgressFromWorkoutSession } from "../utils/badges";
import { requireOwnedWorkout, requireReadableWorkout } from "../policies/resources";
import { notification, workoutReviewNotification } from "@/server/db/schema/notifications";
import { WorkoutNotifications } from "@/socket/enums/notifications";
import { WorkoutAiChatInputZod } from "@/server/ai/workout-schema";
import { GeminiNotConfiguredError, generateWorkoutAiResponse, resolveWorkoutDraft } from "@/server/ai/gemini";
import { workoutAiDailyLimiter, workoutAiMinuteLimiter } from "@/server/limiters";
import { AiQuotaExceededError, estimateWorkoutAiTokens, finalizeAiTokens, releaseAiTokens, reserveAiTokens } from "@/server/services/ai-usage";
import { getEffectiveBillingPlan } from "@/server/services/billing-catalog";

function sortWorkoutResponse (workouts: Array<FullWorkout>) {
  return workouts.map(w => {
    return {
      ...w,
      workoutSets: w.workoutSets.map(wSet => {
        return {
          ...wSet,
          workoutSetCollections: wSet.workoutSetCollections.sort((a, b) => a.order - b.order)
        }
      }).sort((a, b) => a.order - b.order)
    }
  })
}

async function validateWorkoutSession (ctx: NonNullable<TRPCContext>, workoutSessionId: string) {
  const userId = ctx.session?.user.id

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to fetch this resource"
    })
  }

  const session = await ctx.db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, userId),
      eq(workoutSession.id, workoutSessionId),
      isNull(workoutSession.endedAt)
    )
  })

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to update this resource"
    })
  }
}

function validateSessionLogs(sessionLogs: WorkoutSessionLog[]): boolean {
  if (!sessionLogs.length) {
    // Decide if empty array is valid or not. Typically, you'd want at least one entry (order=0).
    return false;
  }

  // 1. Gather all order values
  const allOrders = sessionLogs.map((log) => log.order);

  // 2. Create a sorted set of unique order values
  const uniqueOrders = Array.from(new Set(allOrders)).sort((a, b) => a - b);

  // 3. Check that the first order is 0
  if (uniqueOrders[0] !== 0) {
    return false;
  }

  // 4. Check that each unique order matches its index (i.e. 0, 1, 2, 3, …)
  for (let i = 0; i < uniqueOrders.length; i++) {
    if (uniqueOrders[i] !== i) {
      return false;
    }
  }

  // Passed all checks
  return true;
}

function fixMissingGaps(sessionLogs: WorkoutSessionLog[]): WorkoutSessionLog[] {
  // 1) Sort logs by ascending order
  sessionLogs.sort((a, b) => a.order - b.order);

  // 2) Extract the unique (sorted) old orders
  const oldUniqueOrders = Array.from(
    new Set(sessionLogs.map((log) => log.order))
  );

  // 3) Build a map { oldOrder -> newOrder } for contiguous 0..N
  const orderMap = new Map<number, number>();
  oldUniqueOrders.forEach((oldOrder, index) => {
    orderMap.set(oldOrder, index);
  });

  // 4) Reassign each log's order based on that map
  sessionLogs.forEach((log) => {
    log.order = orderMap.get(log.order)!;
  });

  return sessionLogs;
}

function editableSessionLogValues(sessionLog: WorkoutSessionLog) {
  return {
    order: sessionLog.order,
    exerciseId: sessionLog.exerciseId,
    startedAt: sessionLog.startedAt,
    endedAt: sessionLog.endedAt,
  }
}

function editableFragmentValues(fragment: {
  order: number
  reps: number
  weight: number
  duration: number
  restTime?: number
  startedAt?: Date | null
  endedAt?: Date | null
}) {
  return {
    order: fragment.order,
    reps: fragment.reps,
    weight: fragment.weight,
    duration: fragment.duration,
    restTime: fragment.restTime ?? 0,
    startedAt: fragment.startedAt ?? null,
    endedAt: fragment.endedAt ?? null,
  }
}

export const workoutRouter = createTRPCRouter({
  aiChat: protectedProcedure
    .input(WorkoutAiChatInputZod)
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)

      try {
        await workoutAiMinuteLimiter.consume(userId)
        await workoutAiDailyLimiter.consume(userId)
      } catch {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "AI assistant limit reached. Please wait before sending another request.",
        })
      }

      const { plan } = await getEffectiveBillingPlan(userId, ctx.db)
      const estimatedTokens = estimateWorkoutAiTokens(input.messages, plan.key === "pro" ? "pro" : "free")
      let reservation
      try {
        reservation = await reserveAiTokens({
          userId,
          estimatedTokens,
          database: ctx.db,
        })
      } catch (error) {
        if (error instanceof AiQuotaExceededError) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Your monthly AI token limit has been reached. Upgrade or wait for your next billing period.",
          })
        }
        throw error
      }

      let exerciseCatalog
      try {
        const catalogRows = await ctx.db.query.exercise.findMany({
          where: and(
            isNull(exercise.archivedAt),
            or(eq(exercise.userId, userId), eq(exercise.isPublic, true)),
          ),
          columns: {
            id: true,
            name: true,
          },
          with: {
            muscles: {
              with: {
                muscle: {
                  columns: { name: true },
                },
              },
            },
          },
        })

        exerciseCatalog = catalogRows.map((catalogExercise) => ({
          id: catalogExercise.id,
          name: catalogExercise.name,
          muscles: catalogExercise.muscles.map(({ muscle }) => muscle.name),
        }))
      } catch (error) {
        await releaseAiTokens(reservation, ctx.db)
        console.error("Could not load the workout AI exercise catalog", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The workout AI could not load your exercise library.",
        })
      }

      const requestId = crypto.randomUUID()
      let response
      try {
        const generated = await generateWorkoutAiResponse({
          messages: input.messages,
          exerciseCatalog,
          planKey: reservation.planKey,
        })
        await finalizeAiTokens(reservation, requestId, generated.usage, ctx.db)
        response = generated.response
      } catch (error) {
        await releaseAiTokens(reservation, ctx.db)

        if (error instanceof GeminiNotConfiguredError) {
          throw new TRPCError({
            code: "SERVICE_UNAVAILABLE",
            message: "The workout AI is not configured on the server yet.",
          })
        }

        console.error("Workout AI request failed", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The workout AI could not complete that request.",
        })
      }

      if (response.phase !== "draft" || !response.draft) {
        return {
          phase: response.phase,
          assistantMessage: response.assistantMessage,
          draft: null,
        }
      }

      const draft = resolveWorkoutDraft(response.draft, exerciseCatalog)
      if (!draft) {
        return {
          phase: "clarifying" as const,
          assistantMessage: "I could not match every suggested exercise to your library. Please confirm the exercise names from the picker, or ask me to use different exercises.",
          draft: null,
        }
      }

      return {
        phase: "draft" as const,
        assistantMessage: response.assistantMessage,
        draft,
      }
    }),

  createWorkout: protectedProcedure
    .input(CreateWorkoutInputZod)
    .mutation(async ({ ctx, input }) => {
      const { workoutSets, ...workoutData } = input;
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED"
        })
      }

      return ctx.db.transaction(async (tx) => {
        const workoutResponse = await tx
          .insert(workout)
          .values({ ...workoutData, userId })
          .returning({ id: workout.id });

        if (!workoutResponse[0]?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workout."
          });
        }

        const workoutId = workoutResponse[0].id;

        for (const [setIndex, set] of workoutSets.entries()) {
          const { workoutSetCollections, ...setData } = set;
          const createdSets = await tx
            .insert(workoutSet)
            .values({ ...setData, workoutId, order: setIndex })
            .returning({ id: workoutSet.id });

          if (!createdSets[0]?.id) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create workout set."
            });
          }

          const setId = createdSets[0].id;

          for (const [setCollectionIndex, setCollection] of workoutSetCollections.entries()) {
            const createSetCollection = await tx.insert(workoutSetCollection).values({
              ...setCollection, workoutSetId: setId, order: setCollectionIndex
            }).returning({ id: workoutSetCollection.id })

            if (!createSetCollection[0]?.id) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create workout set."
              });
            }
          }
        }

        // Fetch the full workout with all sets and reps
        const fullWorkout = await tx.query.workout.findFirst({
          where: eq(workout.id, workoutId),
          with: {
          
          },
        });

        if (!fullWorkout) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch the full workout."
          });
        }

        return fullWorkout
      })
    }),

  getWorkouts: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)

    const savedWorkoutIds = await ctx.db
      .select({ id: workout.id })
      .from(workout)
      .innerJoin(workoutToUser, eq(workout.id, workoutToUser.workoutId))
      .where(eq(workoutToUser.userId, userId));

    const savedWorkoutIdsArray = savedWorkoutIds.map(sw => sw.id)

    const workouts = await ctx.db.query.workout.findMany({
      where: and(
        isNull(workout.archivedAt),
        or(eq(workout.userId, userId), inArray(workout.id, savedWorkoutIdsArray)),
      ),
      with: {
        workoutSets: {
          with: {
            workoutSetCollections: true
          }
        }
      },
    });
    
    return sortWorkoutResponse(workouts).map(w => ({
      ...w,
      saved: savedWorkoutIdsArray.includes(w.id)
    }))
  }),

  getPublicWorkouts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authorized to fetch this resource"
      });
    }

    const savedWorkoutIds = await ctx.db
      .select({ id: workout.id })
      .from(workout)
      .innerJoin(workoutToUser, eq(workout.id, workoutToUser.workoutId))
      .where(eq(workoutToUser.userId, userId));

    const savedWorkoutIdsArray = savedWorkoutIds.map(sw => sw.id)

    const workouts = await ctx.db.query.workout.findMany({
      where: and(eq(workout.isPublic, true), isNull(workout.archivedAt)),
      with: {
        workoutSets: {
          with: {
            workoutSetCollections: true
          }
        }
      },
    });
    
    return sortWorkoutResponse(workouts).map(w => {
      return {
        ...w,
        saved: savedWorkoutIdsArray.includes(w.id)
      }
    })
  }),

  getWorkoutById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session?.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        });
      }

      await requireReadableWorkout(ctx, id)
      const workoutData = await ctx.db.query.workout.findFirst({
        where: and(
          eq(workout.id, id),
          isNull(workout.archivedAt),
          or(eq(workout.userId, userId), eq(workout.isPublic, true)),
        ),
        with: {
          workoutSets: {
            with: {
              workoutSetCollections: {
                with: {
                  exercise: true,
                },
              }
            }
          }
        },
      });

      if (!workoutData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found."
        });
      }

      return workoutData;
    }),

  updateWorkout: protectedProcedure
    .input(
      InsertWorkoutZod.extend({
        id: z.string(),
        workoutSets: z.array(
          InsertWorkoutSetZod.extend({
            workoutSetCollections: z.array(InsertWorkoutSetCollectionZod.extend({
              workoutSetId: z.string().optional()
            }).omit({ order: true }))
          }).omit({ order: true })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, workoutSets } = input;
      const workoutData = {
        name: input.name,
        description: input.description,
        category: input.category,
        isPublic: input.isPublic,
      }
      await requireOwnedWorkout(ctx, id)
      return ctx.db.transaction(async (tx) => {
  
        // 🔹 1️⃣ Update the workout itself
        await tx.update(workout).set(workoutData).where(eq(workout.id, id));
  
        // 🔹 2️⃣ Fetch existing sets from the database
        const existingSets = await tx
          .select({ id: workoutSet.id })
          .from(workoutSet)
          .where(eq(workoutSet.workoutId, id));
  
        const existingSetIds = new Set(existingSets.map((set) => set.id));
        const newSetIds = new Set(
          workoutSets
            .map((set) => set.id)
            .filter((setId): setId is string => Boolean(setId)),
        );

        if ([...newSetIds].some((setId) => !existingSetIds.has(setId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A workout set does not belong to this workout.",
          })
        }
  
        // 🔹 3️⃣ Find and delete removed sets
        const setsToDelete = [...existingSetIds].filter((setId) => !newSetIds.has(setId));
  
        if (setsToDelete.length > 0) {
          await tx.delete(workoutSetCollection).where(
            inArray(workoutSetCollection.workoutSetId, setsToDelete)
          );
  
          await tx.delete(workoutSet).where(inArray(workoutSet.id, setsToDelete));
        }
  
        // 🔹 4️⃣ Upsert new sets and collections
        for (const [setIndex, set] of workoutSets.entries()) {
          const { workoutSetCollections, id: setId, ...setData } = set;
  
          let finalSetId = setId;
  
          if (!setId) {
          // Create new set if it doesn't exist
            const createdSet = await tx
              .insert(workoutSet)
              .values({ ...setData, workoutId: id, order: setIndex })
              .returning({ id: workoutSet.id });
  
            if (!createdSet[0]?.id) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create workout set."
              });
            }
            finalSetId = createdSet[0].id;
          } else {
          // Update existing set
            await tx.update(workoutSet).set({ ...setData, order: setIndex }).where(and(
              eq(workoutSet.id, setId),
              eq(workoutSet.workoutId, id),
            ));
          }

          // Ensure finalSetId always has a value
          if (!finalSetId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Workout set ID is missing.",
            });
          }
  
          // 🔹 5️⃣ Handle SetCollections (delete missing ones)
          const existingCollections = await tx
            .select({ id: workoutSetCollection.id })
            .from(workoutSetCollection)
            .where(eq(workoutSetCollection.workoutSetId, finalSetId));
  
          const existingCollectionIds = new Set(existingCollections.map((c) => c.id));
          const newCollectionIds = new Set(
            workoutSetCollections
              .map((collection) => collection.id)
              .filter((collectionId): collectionId is string => Boolean(collectionId)),
          );

          if ([...newCollectionIds].some((collectionId) => !existingCollectionIds.has(collectionId))) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A set entry does not belong to this workout set.",
            })
          }
  
          const collectionsToDelete = [...existingCollectionIds].filter(
            (cId) => !newCollectionIds.has(cId)
          );
  
          if (collectionsToDelete.length > 0) {
            await tx.delete(workoutSetCollection).where(inArray(workoutSetCollection.id, collectionsToDelete));
          }
  
          // 🔹 6️⃣ Insert or update SetCollections
          for (const [setCollectionIndex, collection] of workoutSetCollections.entries()) {
            if (!collection.id) {
              await tx.insert(workoutSetCollection).values({
                ...collection,
                workoutSetId: finalSetId,
                order: setCollectionIndex
              });
            } else {
              await tx
                .update(workoutSetCollection)
                .set({ ...collection, order: setCollectionIndex })
                .where(and(
                  eq(workoutSetCollection.id, collection.id),
                  eq(workoutSetCollection.workoutSetId, finalSetId),
                ));
            }
          }
        }
  
        return { id, ...workoutData };
      })
    }),
  
  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      await requireOwnedWorkout(ctx, id)

      await ctx.db.update(workout)
        .set({ archivedAt: new Date(), isPublic: false })
        .where(eq(workout.id, id));

      return { id };
    }),

  addWorkoutReview: protectedProcedure
    .input(InsertWorkoutReviewZod.omit({ userId: true, createdAt: true }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const reviewedWorkout = await requireReadableWorkout(ctx, input.workoutId)
      const review = await ctx.db.transaction(async (tx) => {
        const createdReview = (await tx.insert(workoutReview).values({
          ...input,
          userId,
          createdAt: new Date().toISOString().slice(0, 10),
        }).returning()).at(0)

        if (!createdReview) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create the review.",
          })
        }

        if (reviewedWorkout.userId !== userId) {
          const createdNotification = (await tx.insert(notification).values({
            userId: reviewedWorkout.userId,
          }).returning({ id: notification.id })).at(0)

          if (!createdNotification) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Could not create the review notification.",
            })
          }

          await tx.insert(workoutReviewNotification).values({
            notificationId: createdNotification.id,
            workoutReviewId: createdReview.id,
          })
        }

        return createdReview
      })

      if (reviewedWorkout.userId !== userId) {
        emitServerSocketEvent({
          event: WorkoutNotifications.NEW_WORKOUT_REVIEW,
          recipients: reviewedWorkout.userId,
          payload: {
            review,
            userId,
            sentAt: new Date(),
          },
        })
      }

      return review
    }),

  getWorkoutReviews: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { workoutId } = input;
      await requireReadableWorkout(ctx, workoutId)

      return await ctx.db.query.workoutReview.findMany({
        where: eq(workoutReview.workoutId, workoutId),
      });
    }),

  saveWorkoutToFavourites: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { workoutId } = input
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        });
      }

      await requireReadableWorkout(ctx, workoutId)

      const alreadySaved = await ctx.db.query.workoutToUser.findFirst({
        where: and(eq(workoutToUser.workoutId, workoutId), eq(workoutToUser.userId, userId))
      })

      if (alreadySaved) {
        await ctx.db.delete(workoutToUser).where(and(eq(workoutToUser.workoutId, workoutId), eq(workoutToUser.userId, userId)))
      } else {
        await ctx.db.insert(workoutToUser).values({ userId, workoutId })
      }
    }),

  getFriendsActiveWorkoutSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const friendIds = await getUserFriendsIds(ctx)
      
      const activeFriendWorkouts = await ctx.db.query.workoutSession.findMany({
        where: and(
          inArray(workoutSession.userId, friendIds),
          isNull(workoutSession.endedAt),
          isNotNull(workoutSession.startedAt)
        )
      })

      return activeFriendWorkouts
    }),

  getActiveWorkoutSession: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = getCtxUserId(ctx)

      const session = await ctx.db.query.workoutSession.findFirst({
        where: and(eq(workoutSession.userId, userId), isNull(workoutSession.endedAt)),
        with: {
          workoutSessionLogs: {
            with: {
              exercise: true,
              workoutSessionLogFragments: true
            }
          },
          workout: {
            with: {
              workoutSets: {
                with: {
                  workoutSetCollections: {
                    with: {
                      exercise: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!session) return null

      const foundWorkout = session.workoutId
        ? await ctx.db.query.workout.findFirst({
          where: or(
            and(
              eq(workout.userId, userId),
              eq(workout.id, session.workoutId)
            ),
            and(
              eq(workout.isPublic, true),
              eq(workout.id, session.workoutId)
            )
          ),
          with: {
            workoutSets: {
              with: {
                workoutSetCollections: {
                  with: {
                    exercise: true
                  }
                }
              }
            }
          },
        })
        : null

      if (session.workoutId && !foundWorkout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find the submitted workout."
        })
      }

      const exerciseIds = [...new Set(
        session.workoutSessionLogs.map(log => log.exerciseId)
      )]

      if (exerciseIds.length === 0) {
        return {
          ...session,
          previousData: {}
        }
      }

      const exercisesToFragment = await ctx.db
        .select({
          exercise: {
            name: exercise.name,
            id: exercise.id
          },
          fragment: workoutSessionLogFragment
        })
        .from(exercise)
        .where(inArray(exercise.id, exerciseIds))
        .innerJoin(
          workoutSessionLog, 
          eq(workoutSessionLog.exerciseId, exercise.id)
        )
        .innerJoin(
          workoutSession,
          and(
            eq(workoutSession.id, workoutSessionLog.workoutSessionId),
            eq(workoutSession.userId, userId),
            isNotNull(workoutSession.endedAt)
          )
        )
        .innerJoin(
          workoutSessionLogFragment,
          and(
            eq(workoutSessionLog.id, workoutSessionLogFragment.workoutSessionLogId),
            isNotNull(workoutSessionLogFragment.startedAt),
            isNotNull(workoutSessionLogFragment.endedAt)
          )
        )
        .orderBy(desc(workoutSessionLogFragment.endedAt))

      const exerciseToFragments = exercisesToFragment
        .reduce<Map<Exercise["id"], Array<WorkoutSessionLogFragment>>>((acc, curr) => {
          if (!acc.has(curr.exercise.id)) {
            acc.set(curr.exercise.id, [])
          }

          acc.get(curr.exercise.id)!.push(curr.fragment)

          return acc
        }, new Map())

      const previousExerciseData: Record<
        Exercise["id"],
        {
          repsToValues: Record<
            WorkoutSessionLogFragment["reps"],
            {
              lastSet: {
                duration?: number,
                weight?: number,
              },
              lastFiveAverage?: {
                duration?: number,
                weight?: number,
              }
            }
          >,
          orderToReps: Record<
            WorkoutSessionLogFragment["order"],
            WorkoutSessionLogFragment["reps"]
          >
        }
        > = {}

      for (const [exerciseId, fragments] of exerciseToFragments.entries()) {
        previousExerciseData[exerciseId] = {
          orderToReps: {},
          repsToValues: {}
        }
        const repsToFragments: Record<WorkoutSessionLogFragment["reps"], Array<WorkoutSessionLogFragment>> = {}
        const orderToFragments: Record<WorkoutSessionLogFragment["order"], Array<WorkoutSessionLogFragment>> = {}
        fragments.forEach(f => {
          if (!(f.reps in repsToFragments)) {
            repsToFragments[f.reps] = []
          }
          repsToFragments[f.reps]!.push(f)

          if (!(f.order in orderToFragments)) {
            orderToFragments[f.order] = []
          }
          orderToFragments[f.order]!.push(f)
        })

        for (const [reps, fragmentsWithReps] of Object.entries(repsToFragments)) {
          const sortedFragments = fragmentsWithReps.sort(
            (a, b) => b.endedAt!.getTime() - a.endedAt!.getTime()
          )

          const lastFragment = sortedFragments.at(0)
          const lastFive = sortedFragments.slice(0, 5)
          const lastFiveWeightAverage = lastFive.length > 0 
            ? lastFive.reduce<number>((acc, curr) => {
              return acc + curr.weight
            }, 0) / lastFive.length
            : undefined
          const lastFiveDurationAverage = lastFive.length > 0 
            ? lastFive.reduce<number>((acc, curr) => {
              return acc + curr.duration
            }, 0) / lastFive.length
            : undefined

          previousExerciseData[exerciseId].repsToValues[Number(reps)] = {
            lastSet: {
              duration: lastFragment?.duration,
              weight: lastFragment?.weight
            },
            lastFiveAverage: {
              duration: lastFiveDurationAverage,
              weight: lastFiveWeightAverage
            }
          }
        }

        for (const [order, fragmentsWithOrder] of Object.entries(orderToFragments)) {
          const sortedFragments = fragmentsWithOrder.sort(
            (a, b) => b.endedAt!.getTime() - a.endedAt!.getTime()
          )

          const lastFragmentWithOrder = sortedFragments.at(0)
          if (lastFragmentWithOrder) {
            previousExerciseData[exerciseId].orderToReps[Number(order)] = lastFragmentWithOrder.reps
          }
        }
      }
      
      return {
        ...session,
        previousData: previousExerciseData
      }
    }),

  getWorkoutSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      return await ctx.db.query.workoutSession.findMany({
        where: and(
          eq(workoutSession.userId, userId),
          isNotNull(workoutSession.endedAt)
        ),
        orderBy: desc(workoutSession.endedAt),
        with: {
          workout: true,
          workoutSessionLogs: {
            with: {
              exercise: {
                columns: {
                  name: true
                }
              },
              workoutSessionLogFragments: true
            }
          }
        }
      })
    }),

  deleteWorkoutSession: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      await ctx.db.delete(workoutSession).where(and(
        eq(workoutSession.userId, userId),
        eq(workoutSession.id, input)
      ))
    }),
  
  getWorkoutSessionById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      const sessionId = input

      const session = await ctx.db.query.workoutSession.findFirst({
        where: and(eq(workoutSession.id, sessionId), eq(workoutSession.userId, userId)),
        with: {
          workoutSessionLogs: {
            with: {
              exercise: true,
              workoutSessionLogFragments: true
            }
          },
          workout: true
        }
      })

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find the requested resource."
        })
      }

      if (!session.endedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This workout is still active."
        })
      }

      return session
    }),

  createWorkoutSession: protectedProcedure
    .input(CreateWorkoutSessionZod)
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)

      const hasActiveWorkoutSession = await ctx.db.query.workoutSession.findFirst({
        where: and(
          isNull(workoutSession.endedAt),
          eq(workoutSession.userId, userId)
        )
      })

      if (hasActiveWorkoutSession) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please finish your active workout before starting a new one."
        })
      }

      const foundWorkout = input.workoutId
        ? await ctx.db.query.workout.findFirst({
          where: and(
            eq(workout.id, input.workoutId),
            isNull(workout.archivedAt),
            or(
              eq(workout.userId, userId),
              eq(workout.isPublic, true),
            ),
          ),
          with: {
            workoutSets: {
              with: {
                workoutSetCollections: {
                  with: {
                    exercise: true
                  }
                }
              }
            }
          },
        })
        : null

      if (input.workoutId && !foundWorkout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find the submitted workout."
        })
      }

      return ctx.db.transaction(async (tx) => {
        const createdWorkoutSession = (await tx.insert(workoutSession).values({
          userId,
          workoutId: input.workoutId ?? null
        }).returning()).at(0)

        if (!createdWorkoutSession) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong."
          })
        }

        if (!foundWorkout) return createdWorkoutSession.id

        const orderedSets = foundWorkout.workoutSets.sort((a, b) => a.order - b.order)
        for (const [setIndex, set] of orderedSets.entries()) {
          for (const setCollection of set.workoutSetCollections) {
            const workoutSessionLogId = (await tx.insert(workoutSessionLog).values({
              exerciseId: setCollection.exerciseId,
              order: setIndex,
              workoutSessionId: createdWorkoutSession.id,
            }).returning({ id: workoutSessionLog.id })).at(0)?.id

            if (!workoutSessionLogId) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong."
              })
            }

            for (const [repCountIndex, repCount] of setCollection.reps.entries()) {
              const duration = setCollection.duration.at(repCountIndex) ?? 0
              const weight = setCollection.weight.at(repCountIndex) ?? 0
              const restTime = setCollection.restTime.at(repCountIndex) ?? 0

              await tx.insert(workoutSessionLogFragment).values({
                workoutSessionLogId,
                order: repCountIndex,
                reps: repCount,
                duration,
                weight,
                restTime
              })
            }
          }
        }

        return createdWorkoutSession.id
      })
    }),
  
  startWorkoutSession: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input)
      const userId = getCtxUserId(ctx)

      const startedAt = new Date()
      const updatedSession = (await ctx.db.update(workoutSession).set({
        startedAt,
        endedAt: null
      }).where(and(
        eq(workoutSession.userId, userId),
        eq(workoutSession.id, input),
        isNull(workoutSession.startedAt),
        isNull(workoutSession.endedAt)
      )).returning()).at(0)

      if (!updatedSession) return

      emitServerSocketEvent({
        event: WorkoutEvent.STARTED_NEW_WORKOUT,
        recipients: await getUserFriendsIds(ctx),
        payload: {
          workoutSession: updatedSession,
          sentAt: startedAt,
          userId
        }
      })
    }),

  startWorkoutSessionLog: protectedProcedure
    .input(z.object({
      workoutSessionId: z.string(),
      workoutSessionLogId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.workoutSessionId)

      const { workoutSessionId, workoutSessionLogId } = input

      await ctx.db.update(workoutSessionLog).set({
        startedAt: new Date(),
        endedAt: null
      }).where(and(
        eq(workoutSessionLog.workoutSessionId, workoutSessionId),
        eq(workoutSessionLog.id, workoutSessionLogId)
      ))
    }),

  startWorkoutSessionLogs: protectedProcedure
    .input(z.array(z.object({
      workoutSessionId: z.string(),
      workoutSessionLogId: z.string()
    })).min(1))
    .mutation(async ({ ctx, input }) => {
      for (const { workoutSessionId, workoutSessionLogId } of input) {
        await validateWorkoutSession(ctx, workoutSessionId)

        await ctx.db.update(workoutSessionLog).set({
          startedAt: new Date(),
          endedAt: null
        }).where(and(
          eq(workoutSessionLog.workoutSessionId, workoutSessionId),
          eq(workoutSessionLog.id, workoutSessionLogId),
          isNull(workoutSessionLog.startedAt),
          isNull(workoutSessionLog.endedAt)
        ))
      }
    }),

  swapSessionLogPositions: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      fragments: z.array(z.object({
        id: z.string(),
        order: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      await ctx.db.transaction(async (tx) => {
        for (const fragment of input.fragments) {
          const { id, order } = fragment
          await tx.update(workoutSessionLog).set({
            order
          }).where(and(
            eq(workoutSessionLog.id, id),
            eq(workoutSessionLog.workoutSessionId, input.sessionId)
          ))
        }
      })
    }),

  addSessionLogs: protectedProcedure
    .input(
      z.array(
        z.object({
          sessionLog: InsertWorkoutSessionLogZod,
          fragments: z.array(
            InsertWorkoutSessionLogFragmentZod.omit({
              workoutSessionLogId: true
            })
          )
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const sessionIds = new Set(input.map(o => o.sessionLog.workoutSessionId))

      if (sessionIds.size > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trying to edit sessionLogs from different session."
        })
      }

      const sessionId = sessionIds.values().next().value

      if (!sessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid data sent to endpoint."
        })
      }

      await validateWorkoutSession(ctx, sessionId)

      await ctx.db.transaction(async (tx) => {
        for (const { fragments, sessionLog } of input) {
          const sessionLogId = (await tx.insert(workoutSessionLog).values(sessionLog).returning({
            id: workoutSessionLog.id
          })).at(0)?.id

          if (!sessionLogId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Could not create session log."
            })
          }

          for (const fragment of fragments) {
            await tx.insert(workoutSessionLogFragment).values({
              ...fragment,
              workoutSessionLogId: sessionLogId
            })
          }
        }
      })

    }),

  editSessionLogs: protectedProcedure
    .input(
      z.object({
        previousLogs: z.array(
          z.object({
            sessionLog: WorkoutSessionLogZod,
            fragments: z.array(
              z.union([
                WorkoutSessionLogFragmentZod,
                InsertWorkoutSessionLogFragmentZod
              ])
            )
          })
        ),
        newLogs: z.array(
          z.object({
            sessionLog: WorkoutSessionLogZod,
            fragments: z.array(
              z.union([
                WorkoutSessionLogFragmentZod,
                InsertWorkoutSessionLogFragmentZod
              ])
            )
          })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionIds = new Set([
        ...input.previousLogs.map(o => o.sessionLog.workoutSessionId),
        ...input.newLogs.map(o => o.sessionLog.workoutSessionId)
      ])

      if (sessionIds.size > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trying to edit sessionLogs from different session."
        })
      }

      const sessionId = sessionIds.values().next().value

      if (!sessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid data sent to endpoint."
        })
      }

      await validateWorkoutSession(ctx, sessionId)

      const submittedExistingIds = [
        ...new Set(input.previousLogs.map(({ sessionLog }) => sessionLog.id)),
      ]
      if (submittedExistingIds.length > 0) {
        const ownedLogs = await ctx.db
          .select({ id: workoutSessionLog.id })
          .from(workoutSessionLog)
          .where(and(
            eq(workoutSessionLog.workoutSessionId, sessionId),
            inArray(workoutSessionLog.id, submittedExistingIds),
          ))

        if (ownedLogs.length !== submittedExistingIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A session log does not belong to this workout session.",
          })
        }
      }

      await ctx.db.transaction(async (tx) => {
        const { newLogs, previousLogs } = input
        const logsToBeDeleted = previousLogs.filter(pl => {
          return !newLogs.some(nl => nl.sessionLog.id === pl.sessionLog.id)
        })
        const logsToBeUpdated = newLogs.filter(nl => {
          return previousLogs.some(pl => nl.sessionLog.id === pl.sessionLog.id)
        })
        const logsToBeAdded = newLogs.filter(nl => {
          return !previousLogs.some(pl => nl.sessionLog.id === pl.sessionLog.id)
        })

        // Delete logs
        for (const { sessionLog } of logsToBeDeleted) {
          const deleted = await tx.delete(workoutSessionLog).where(eq(
            workoutSessionLog.id, sessionLog.id
          )).returning()
  
          if (deleted.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You can't edit a session log that doesn't exist."
            })
          }
        }


        // Update logs
        for (const { sessionLog, fragments } of logsToBeUpdated) {
          const sessionLogId = sessionLog.id
          const sessionLogData = editableSessionLogValues(sessionLog)
          await tx.delete(workoutSessionLogFragment).where(eq(
            workoutSessionLogFragment.workoutSessionLogId, sessionLogId
          ))

          await tx.update(workoutSessionLog).set(sessionLogData).where(and(
            eq(workoutSessionLog.id, sessionLogId),
            eq(workoutSessionLog.workoutSessionId, sessionId),
          ))
          
          for (const fragment of fragments) {
            await tx.insert(workoutSessionLogFragment).values({
              ...editableFragmentValues(fragment),
              workoutSessionLogId: sessionLogId,
            })
          }
        }

        // Create new logs 
        for (const { sessionLog, fragments } of logsToBeAdded) {
          const sessionLogData = editableSessionLogValues(sessionLog)
          const insertedWorkoutSessionLog = await tx
            .insert(workoutSessionLog)
            .values({ ...sessionLogData, workoutSessionId: sessionId })
            .returning({ id: workoutSessionLog.id })
          const sessionLogId = insertedWorkoutSessionLog.at(0)?.id
        
          if (!sessionLogId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong creating the sets."
            })
          }

          for (const fragment of fragments) {
            await tx.insert(workoutSessionLogFragment).values({
              ...editableFragmentValues(fragment),
              workoutSessionLogId: sessionLogId
            })
          }
        }

        const sessionLogs = await tx.query.workoutSessionLog.findMany({
          where: eq(workoutSessionLog.workoutSessionId, sessionId)
        })

        const valid = validateSessionLogs(sessionLogs)

        if (!valid) {
          const fixedMissingGaps = fixMissingGaps(sessionLogs)

          for (const log of fixedMissingGaps) {
            await tx.update(workoutSessionLog).set({
              order: log.order
            }).where(eq(
              workoutSessionLog.id, log.id
            ))
          }
        }
      })
    }),

  deleteSessionLogs: protectedProcedure
    .input(z.array(
      z.object({
        sessionLogId: z.string(),
        sessionId: z.string(),
      })
    ))
    .mutation(async ({ ctx, input }) => {
      const sessionIds = new Set(input.map(o => o.sessionId))

      if (sessionIds.size > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trying to edit sessionLogs from different session."
        })
      }

      const sessionId = sessionIds.values().next().value

      if (!sessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid data sent to endpoint."
        })
      }

      await validateWorkoutSession(ctx, sessionId)

      await ctx.db.transaction(async (tx) => {
        for (const { sessionId, sessionLogId } of input) {
          const deleted = await tx.delete(workoutSessionLog).where(and(
            eq(workoutSessionLog.workoutSessionId, sessionId),
            eq(workoutSessionLog.id, sessionLogId)
          )).returning()

          if (deleted.length === 0) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Could not delete session logs."
            })
          }
        }
      })
      
    }),

  endWorkoutSessionLog: protectedProcedure
    .input(z.object({
      sessionLogId: z.string(),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      const sessionLog = await ctx.db.query.workoutSessionLog.findFirst({
        where: and(
          eq(workoutSessionLog.id, input.sessionLogId),
          eq(workoutSessionLog.workoutSessionId, input.sessionId)
        )
      })

      if (!sessionLog) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find this exercise in the active workout."
        })
      }

      const activeFragments = await ctx.db.query.workoutSessionLogFragment.findMany({
        where: and(
          eq(workoutSessionLogFragment.workoutSessionLogId, input.sessionLogId),
          isNotNull(workoutSessionLogFragment.startedAt),
          isNull(workoutSessionLogFragment.endedAt)
        )
      })

      if (activeFragments.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cant end this session since you have active sets in it."
        })
      }

      const remainingFragments = await ctx.db.query.workoutSessionLogFragment.findMany({
        where: and(
          eq(workoutSessionLogFragment.workoutSessionLogId, input.sessionLogId),
          isNull(workoutSessionLogFragment.endedAt)
        )
      })

      if (remainingFragments.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This exercise still has planned sets."
        })
      }

      await ctx.db.update(workoutSessionLog).set({
        endedAt: new Date()
      }).where(eq(workoutSessionLog.id, input.sessionLogId))
    }),

  startWorkoutSessionLogFragment: protectedProcedure
    .input(z.object({
      fragmentId: z.string(),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      const fragment = await ctx.db.query.workoutSessionLogFragment.findFirst({
        where: eq(workoutSessionLogFragment.id, input.fragmentId),
        with: {
          workoutSessionLog: true
        }
      })

      if (!fragment || fragment.workoutSessionLog.workoutSessionId !== input.sessionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find this set in the active workout."
        })
      }

      await ctx.db.update(workoutSessionLogFragment).set({
        startedAt: new Date(),
        endedAt: null
      }).where(and(
        eq(workoutSessionLogFragment.id, input.fragmentId),
        isNull(workoutSessionLogFragment.startedAt),
        isNull(workoutSessionLogFragment.endedAt)
      ))
    }),

  skipWorkoutSessionLogFragment: protectedProcedure
    .input(z.object({
      fragmentId: z.string(),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      const fragment = await ctx.db.query.workoutSessionLogFragment.findFirst({
        where: eq(workoutSessionLogFragment.id, input.fragmentId),
        with: {
          workoutSessionLog: true
        }
      })

      if (!fragment || fragment.workoutSessionLog.workoutSessionId !== input.sessionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find this set in the active workout."
        })
      }

      await ctx.db.update(workoutSessionLogFragment).set({
        endedAt: new Date()
      }).where(and(
        eq(workoutSessionLogFragment.id, input.fragmentId),
        isNull(workoutSessionLogFragment.startedAt),
        isNull(workoutSessionLogFragment.endedAt)
      ))

      const remainingFragments = await ctx.db.query.workoutSessionLogFragment.findMany({
        where: and(
          eq(workoutSessionLogFragment.workoutSessionLogId, fragment.workoutSessionLogId),
          isNull(workoutSessionLogFragment.endedAt)
        )
      })

      if (remainingFragments.length === 0) {
        await ctx.db.update(workoutSessionLog).set({
          endedAt: new Date()
        }).where(eq(workoutSessionLog.id, fragment.workoutSessionLogId))
      }
    }),

  endWorkoutSessionLogFragment: protectedProcedure
    .input(z.object({
      fragment: WorkoutSessionLogFragmentZod.omit({
        startedAt: true,
        endedAt: true
      }),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      const fragment = await ctx.db.query.workoutSessionLogFragment.findFirst({
        where: eq(workoutSessionLogFragment.id, input.fragment.id),
        with: {
          workoutSessionLog: true
        }
      })

      if (!fragment || fragment.workoutSessionLog.workoutSessionId !== input.sessionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find this set in the active workout."
        })
      }

      if (fragment.startedAt === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't end a fragment that has not been started."
        })
      }

      await ctx.db.update(workoutSessionLogFragment).set({
        reps: input.fragment.reps,
        weight: input.fragment.weight,
        duration: input.fragment.duration,
        endedAt: new Date()
      }).where(and(
        eq(workoutSessionLogFragment.id, input.fragment.id),
        isNotNull(workoutSessionLogFragment.startedAt),
        isNull(workoutSessionLogFragment.endedAt)
      ))

      const remainingFragments = await ctx.db.query.workoutSessionLogFragment.findMany({
        where: and(
          eq(workoutSessionLogFragment.workoutSessionLogId, fragment.workoutSessionLogId),
          isNull(workoutSessionLogFragment.endedAt)
        )
      })

      if (remainingFragments.length === 0) {
        await ctx.db.update(workoutSessionLog).set({
          endedAt: new Date()
        }).where(eq(workoutSessionLog.id, fragment.workoutSessionLogId))
      }
    }),

  endWorkoutSession: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const sessionId = input

      await validateWorkoutSession(ctx, sessionId)

      const session = await ctx.db.query.workoutSession.findFirst({
        where: and(
          eq(workoutSession.userId, userId),
          eq(workoutSession.id, sessionId),
          isNull(workoutSession.endedAt),
        ),
        with: {
          workoutSessionLogs: {
            with: {
              workoutSessionLogFragments: true
            }
          },
        }
      })

      if (!session) return null

      const endedAt = new Date()

      await ctx.db.update(workoutSession).set({
        startedAt: session.startedAt ?? endedAt,
        endedAt
      }).where(eq(workoutSession.id, session.id))

      emitServerSocketEvent({
        event: WorkoutEvent.ENDED_WORKOUT,
        recipients: await getUserFriendsIds(ctx),
        payload: {
          sentAt: endedAt,
          userId: userId
        }
      })

      const performedSession = {
        ...session,
        workoutSessionLogs: session.workoutSessionLogs.map(log => ({
          ...log,
          workoutSessionLogFragments: log.workoutSessionLogFragments.filter(fragment => (
            fragment.startedAt !== null && fragment.endedAt !== null
          ))
        }))
      }
      const performedSetCount = performedSession.workoutSessionLogs.reduce(
        (count, log) => count + log.workoutSessionLogFragments.length,
        0
      )

      if (performedSetCount > 0) {
        try {
          await handleBadgeProgressFromWorkoutSession(ctx, performedSession)
        } catch (error) {
          console.error("Could not update badge progress for workout session", error)
        }
      }


      return session.id
    })
});
