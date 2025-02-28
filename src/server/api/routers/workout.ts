import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
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
} from "@/server/db/schema/workout";
import { and, desc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { type TRPCContext } from "@/trpc/server";
import { getUserFriendsIds } from "../utils/friends";
import { emitServerSocketEvent } from "@/server/socket";
import { WorkoutEvent } from "@/socket/enums/workout";
import { getCtxUserId } from "@/server/utils/user";
import { exercise } from "@/server/db/schema/exercise";

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
    const userId = getCtxUserId(ctx)

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

  getFriendsActiveWorkoutSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const friendIds = await getUserFriendsIds(ctx)
      
      const activeFriendWorkouts = await ctx.db.query.workoutSession.findMany({
        where: and(
          inArray(workoutSession.userId, friendIds),
          isNull(workoutSession.endedAt)
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

      return session
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

      const foundWorkout = await ctx.db.query.workout.findFirst({
        where: or(
          and(
            eq(workout.userId, userId),
            eq(workout.id, input.workoutId)
          ),
          and(
            eq(workout.isPublic, true),
            eq(workout.id, input.workoutId)
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

      if (!foundWorkout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find the submitted workout."
        })
      }

      const createdWorkoutSession = (await ctx.db.insert(workoutSession).values({
        userId,
        workoutId: input.workoutId
      }).returning()).at(0)

      if (!createdWorkoutSession) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong."
        })
      }

      if (createdWorkoutSession) {
        const friends = await getUserFriendsIds(ctx)
        emitServerSocketEvent({
          event: WorkoutEvent.STARTED_NEW_WORKOUT,
          recipients: friends,
          payload: {
            workoutSession: createdWorkoutSession,
            sentAt: new Date(),
            userId
          }
        })
      }

      const orderedSets = foundWorkout.workoutSets.sort((a, b) => a.order - b.order)
      for (const [setIndex, set] of orderedSets.entries()) {
        for (const setCollection of set.workoutSetCollections) {
          const workoutSessionLogId = (await ctx.db.insert(workoutSessionLog).values({
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

            await ctx.db.insert(workoutSessionLogFragment).values({
              workoutSessionLogId,
              order: repCountIndex,
              reps: repCount,
              duration,
              weight
            })
          }
        }
      }

      return createdWorkoutSession.id
    }),
  
  startWorkoutSession: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input)
      const userId = getCtxUserId(ctx)

      await ctx.db.update(workoutSession).set({
        startedAt: new Date(),
        endedAt: null
      }).where(and(
        eq(workoutSession.userId, userId),
        eq(workoutSession.id, input),
        isNull(workoutSession.startedAt),
        isNull(workoutSession.endedAt)
      ))
    }),

  test: publicProcedure
    .query(async ({ ctx }) => {
      const userId = getCtxUserId(ctx)

      const foundWorkoutSession = await ctx.db.query.workoutSession.findFirst({
        with: {
          workout: true,
          workoutSessionLogs: {
            with: {
              exercise: true,
              workoutSessionLogFragments: true
            }
          }
        }
      })

      if (!foundWorkoutSession) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong."
        })
      }

      const foundWorkout = await ctx.db.query.workout.findFirst({
        where: or(
          and(
            eq(workout.userId, userId),
            eq(workout.id, foundWorkoutSession.workoutId)
          ),
          and(
            eq(workout.isPublic, true),
            eq(workout.id, foundWorkoutSession.workoutId)
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

      if (!foundWorkout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find the submitted workout."
        })
      }

      // const previousExerciseData = new Map<
      //   Exercise["id"],
      //   {
      //     values: Map<
      //       WorkoutSessionLogFragment["reps"],
      //       {
      //         lastSet: {
      //           duration?: number,
      //           weight?: number
      //         },
      //         lastFiveAverage?: number
      //       }
      //     >,
      //     repsLastSet: number
      //   }
      // >()

      const exerciseIds = foundWorkout.workoutSets.flatMap(set => {
        return set.workoutSetCollections.flatMap(setCollection => setCollection.exerciseId)
      })

      const exerciseToFragments = await ctx.db
        .select()
        .from(exercise)
        .where(inArray(exercise.id, exerciseIds))
        .innerJoin(
          workoutSessionLog, 
          and(
            eq(workoutSessionLog.exerciseId, exercise.id),
            isNotNull(workoutSessionLog.endedAt)
          )
        )
        .innerJoin(
          workoutSessionLogFragment,
          and(
            eq(workoutSessionLog.id, workoutSessionLogFragment.workoutSessionLogId),
            isNotNull(workoutSessionLogFragment.endedAt)
          )
        )
        .orderBy(desc(workoutSessionLogFragment.endedAt))
        .limit(5)


      return exerciseToFragments
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
        ))
      }
    }),

  endWorkoutSessionLog: protectedProcedure
    .input(z.object({
      sessionLogId: z.string(),
      sessionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await validateWorkoutSession(ctx, input.sessionId)

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

      await ctx.db.update(workoutSessionLogFragment)
        .set({ endedAt: new Date() })
        .where(and(
          eq(workoutSessionLogFragment.workoutSessionLogId, input.sessionLogId),
          isNull(workoutSessionLogFragment.endedAt)
        ))

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

      await ctx.db.update(workoutSessionLogFragment).set({
        startedAt: new Date(),
        endedAt: null
      }).where(eq(workoutSessionLogFragment.id, input.fragmentId))
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
        where: eq(workoutSessionLogFragment.id, input.fragment.id)
      })

      if (!fragment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This fragment does not exist."
        })
      }

      if (fragment?.startedAt === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't end a fragment that has not been started."
        })
      }

      await ctx.db.update(workoutSessionLogFragment).set({
        ...input.fragment,
        endedAt: new Date()
      }).where(eq(workoutSessionLogFragment.id, input.fragment.id))
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

      await ctx.db.update(workoutSession).set({ endedAt: new Date() }).where(eq(workoutSession.id, session.id))
    
      for (const sessionLog of session.workoutSessionLogs) {
        await ctx.db.update(workoutSessionLog).set({ endedAt: new Date() }).where(
          and(
            eq(workoutSessionLog.id, sessionLog.id),
            isNull(workoutSessionLog.endedAt)
          )
        )

        for (const sessionLogFragment of sessionLog.workoutSessionLogFragments) {
          await ctx.db.update(workoutSessionLogFragment).set({ endedAt: new Date() }).where(
            and(
              eq(workoutSessionLogFragment.id, sessionLogFragment.id),
              isNull(workoutSessionLogFragment.endedAt)
            )
          )
        }
      }

      emitServerSocketEvent({
        event: WorkoutEvent.ENDED_WORKOUT,
        recipients: await getUserFriendsIds(ctx),
        payload: {
          sentAt: new Date(),
          userId: userId
        }
      })

      return session.id
    })
});
