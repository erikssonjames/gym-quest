import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
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
  CreateWorkoutSessionLogZod,
  workoutSessionLog,
  CreateWorkoutSessionLogFragmentZod,
  workoutSessionLogFragment,
  WorkoutSessionLogFragmentZod,
  WorkoutSessionLogZod,
} from "@/server/db/schema/workout";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { type TRPCContext } from "@/trpc/server";

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
    where: and(eq(workoutSession.userId, userId), eq(workoutSession.id, workoutSessionId))
  })

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to update this resource"
    })
  }
}

export const workoutRouter = createTRPCRouter({
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

      const workoutResponse = await ctx.db
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
        const createdSets = await ctx.db
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
          const createSetCollection = await ctx.db.insert(workoutSetCollection).values({
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
      const fullWorkout = await ctx.db.query.workout.findFirst({
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
    }),

  getWorkouts: protectedProcedure.query(async ({ ctx }) => {
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
      where: or(eq(workout.userId, userId), inArray(workout.id, savedWorkoutIdsArray)),
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
      where: eq(workout.isPublic, true),
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

      const workoutData = await ctx.db.query.workout.findFirst({
        where: and(eq(workout.id, id), eq(workout.userId, userId)),
        with: {
          workoutSets: {
            with: {
              workoutSetCollections: true
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
      const { id, workoutSets, ...workoutData } = input;
  
      // 🔹 1️⃣ Update the workout itself
      await ctx.db.update(workout).set(workoutData).where(eq(workout.id, id));
  
      // 🔹 2️⃣ Fetch existing sets from the database
      const existingSets = await ctx.db
        .select({ id: workoutSet.id })
        .from(workoutSet)
        .where(eq(workoutSet.workoutId, id));
  
      const existingSetIds = new Set(existingSets.map((set) => set.id));
      const newSetIds = new Set(workoutSets.map((set) => set.id).filter(Boolean)); // Ensure we only compare existing sets
  
      // 🔹 3️⃣ Find and delete removed sets
      const setsToDelete = [...existingSetIds].filter((setId) => !newSetIds.has(setId));
  
      if (setsToDelete.length > 0) {
        await ctx.db.delete(workoutSetCollection).where(
          inArray(workoutSetCollection.workoutSetId, setsToDelete)
        );
  
        await ctx.db.delete(workoutSet).where(inArray(workoutSet.id, setsToDelete));
      }
  
      // 🔹 4️⃣ Upsert new sets and collections
      for (const [setIndex, set] of workoutSets.entries()) {
        const { workoutSetCollections, id: setId, ...setData } = set;
  
        let finalSetId = setId;
  
        if (!setId) {
          // Create new set if it doesn't exist
          const createdSet = await ctx.db
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
          await ctx.db.update(workoutSet).set({ ...setData, order: setIndex }).where(eq(workoutSet.id, setId));
        }

        // Ensure finalSetId always has a value
        if (!finalSetId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Workout set ID is missing.",
          });
        }
  
        // 🔹 5️⃣ Handle SetCollections (delete missing ones)
        const existingCollections = await ctx.db
          .select({ id: workoutSetCollection.id })
          .from(workoutSetCollection)
          .where(eq(workoutSetCollection.workoutSetId, finalSetId));
  
        const existingCollectionIds = new Set(existingCollections.map((c) => c.id));
        const newCollectionIds = new Set(workoutSetCollections.map((c) => c.id).filter(Boolean));
  
        const collectionsToDelete = [...existingCollectionIds].filter(
          (cId) => !newCollectionIds.has(cId)
        );
  
        if (collectionsToDelete.length > 0) {
          await ctx.db.delete(workoutSetCollection).where(inArray(workoutSetCollection.id, collectionsToDelete));
        }
  
        // 🔹 6️⃣ Insert or update SetCollections
        for (const [setCollectionIndex, collection] of workoutSetCollections.entries()) {
          if (!collection.id) {
            await ctx.db.insert(workoutSetCollection).values({
              ...collection,
              workoutSetId: finalSetId,
              order: setCollectionIndex
            });
          } else {
            await ctx.db
              .update(workoutSetCollection)
              .set({ ...collection, order: setCollectionIndex })
              .where(eq(workoutSetCollection.id, collection.id));
          }
        }
      }
  
      return { id, ...workoutData };
    }),
  
  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.db.delete(workout).where(eq(workout.id, id));

      return { id };
    }),

  addWorkoutReview: protectedProcedure
    .input(InsertWorkoutReviewZod)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(workoutReview).values(input);
    }),

  getWorkoutReviews: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { workoutId } = input;

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

      const alreadySaved = await ctx.db.query.workoutToUser.findFirst({
        where: and(eq(workoutToUser.workoutId, workoutId), eq(workoutToUser.userId, userId))
      })

      if (alreadySaved) {
        await ctx.db.delete(workoutToUser).where(and(eq(workoutToUser.workoutId, workoutId), eq(workoutToUser.userId, userId)))
      } else {
        await ctx.db.insert(workoutToUser).values({ userId, workoutId })
      }
    }),

  getActiveWorkoutSession: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

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

      const exerciseIds = session.workout.workoutSets.flatMap(set => {
        return set.workoutSetCollections.map(col => col.exercise.id)
      })

      const prevSessionsIds = (await ctx.db
        .select({ id: workoutSessionLog.id })
        .from(workoutSessionLog)
        .innerJoin(workoutSession, eq(workoutSession.id, workoutSessionLog.workoutSessionId))
        .where(and(inArray(workoutSessionLog.exerciseId, exerciseIds), eq(workoutSession.userId, userId))))
        .map(v => v.id)

      const previousSessionLogs = await ctx.db.query.workoutSessionLog.findMany({
        where: inArray(workoutSessionLog.id, prevSessionsIds),
        with: {
          workoutSessionLogFragments: {
            columns: {
              reps: true,
              weight: true,
              duration: true,
              endedAt: true,
              skipped: true            }
          }
        },
        orderBy: [desc(workoutSessionLog.startedAt)],
        columns: {
          exerciseId: true,
        }
      })

      const exerciseTargetMap = new Map(
        previousSessionLogs.map(
          log => ([
            log.exerciseId,
            log.workoutSessionLogFragments
              .filter(f => !f.skipped && !f.endedAt && f.reps !== null)
              .map(fragment => ({
                targetReps: fragment.reps!, targetWeight: fragment.weight, targetDuration: fragment.duration
              }))
              .sort((a, b) => {
                if (a.targetReps === b.targetReps) {
                  return (a.targetWeight ?? 0) - (b.targetWeight ?? 0) - (a.targetDuration ?? 0) - (b.targetDuration ?? 0)
                }
                return a.targetReps - b.targetReps
              })
          ])
        )
      )

      const setsWithTarget = session.workout.workoutSets.map(set => {
        return {
          ...set,
          workoutSetCollections: set.workoutSetCollections.map(col => ({
            ...col,
            target: 
              col.reps.map(rep => exerciseTargetMap.get(col.exerciseId)?.find(target => target.targetReps === rep) ?? undefined)
          }))
        }
      })

      return {
        ...session,
        workout: {
          ...session.workout,
          workoutSets: setsWithTarget
        }
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
        where: eq(workoutSession.userId, userId),
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
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      await ctx.db.delete(workoutSession).where(eq(workoutSession.userId, userId))
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

  addWorkoutSession: protectedProcedure
    .input(CreateWorkoutSessionZod)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      const activeSessions = await ctx.db.query.workoutSession.findMany({
        where: and(eq(workoutSession.userId, userId), isNull(workoutSession.endedAt))
      })

      if (activeSessions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Looks like you already have an active workout."
        })
      }

      return (await ctx.db.insert(workoutSession).values({ ...input, userId }).returning({ id: workoutSession.id })).at(0)
    }),

  addWorkoutSessionLog: protectedProcedure
    .input(CreateWorkoutSessionLogZod)
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.workoutSessionId)

      const createdLog = await ctx.db.insert(workoutSessionLog).values(input).returning({ id: workoutSessionLog.id })

      if (!createdLog[0]?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong."
        })
      }

      await ctx.db.insert(workoutSessionLogFragment).values({
        startedAt: new Date(),
        workoutSessionLogId: createdLog[0].id,
      })
    }),

  startWorkoutSessionLogs: protectedProcedure
    .input(z.array(CreateWorkoutSessionLogZod).min(1))
    .mutation(async ({ ctx, input }) => {
      for (const sessionLog of input) {
        await validateWorkoutSession(ctx, sessionLog.workoutSessionId)

        const createdLog = await ctx.db.insert(workoutSessionLog).values(sessionLog).returning({ id: workoutSessionLog.id })

        if (!createdLog[0]?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong."
          })
        }
  
        await ctx.db.insert(workoutSessionLogFragment).values({
          startedAt: new Date(),
          workoutSessionLogId: createdLog[0].id,
        })
      }
    }),

  endWorkoutSessionLog: protectedProcedure
    .input(z.object({
      log: WorkoutSessionLogZod.omit({
        startedAt: true,
        endedAt: true,
        exerciseId: true,
        workoutSetCollectionId: true
      }),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      const activeFragments = await ctx.db.query.workoutSessionLogFragment.findMany({
        where: and(
          eq(workoutSessionLogFragment.workoutSessionLogId, input.log.id),
          isNull(workoutSessionLogFragment.endedAt)
        ),
        columns: {
          id: true
        }
      })

      const toBeEndedFragmentsIds = activeFragments.map(f => f.id)

      await ctx.db.update(workoutSessionLogFragment)
        .set({ endedAt: new Date() })
        .where(inArray(workoutSessionLogFragment.id, toBeEndedFragmentsIds))

      await ctx.db.update(workoutSessionLog).set({
        ...input.log,
        endedAt: new Date()
      }).where(eq(workoutSessionLog.id, input.log.id))
    }),

  addWorkoutSessionLogFragment: protectedProcedure
    .input(z.object({
      fragment: CreateWorkoutSessionLogFragmentZod,
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

      await ctx.db.insert(workoutSessionLogFragment).values(input.fragment)
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

      await ctx.db.update(workoutSessionLogFragment).set({
        ...input.fragment,
        endedAt: new Date()
      }).where(eq(workoutSessionLogFragment.id, input.fragment.id))
    }),

  endWorkoutSessions: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to fetch this resource"
        })
      }

      const activeSessions = await ctx.db.query.workoutSession.findMany({
        where: and(eq(workoutSession.userId, userId), isNull(workoutSession.endedAt)),
        with: {
          workoutSessionLogs: true,
        }
      })

      const toBeDeleted = activeSessions.filter(session => session.workoutSessionLogs.length === 0)
      const toBeEnded = activeSessions.filter(session => !toBeDeleted.some(s => s.id === session.id))

      for (const session of toBeDeleted) {
        await ctx.db.delete(workoutSession).where(eq(workoutSession.id, session.id))
      }

      for (const session of toBeEnded) {
        await ctx.db.update(workoutSession).set({ endedAt: new Date() }).where(eq(workoutSession.id, session.id))
      }

      return toBeEnded.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime()).at(0)?.id
    })
});
