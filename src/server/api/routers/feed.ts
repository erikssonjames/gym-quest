import { randomUUID } from "node:crypto"
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lt,
  notInArray,
  or,
} from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc"
import {
  CreateFeedPostZod,
  feedPost,
  feedPostComment,
  feedPostHidden,
  feedPostReaction,
  feedPostReport,
  feedQuestShare,
  feedWorkoutShare,
  FeedCommentZod,
  ShareFeedPostFieldsZod,
  type QuestShareSnapshot,
  type WorkoutShareSnapshot,
} from "@/server/db/schema/feed"
import { experienceEvent, questClaim } from "@/server/db/schema/progression"
import { workoutSession } from "@/server/db/schema/workout"
import {
  getBlockedUserIds,
  getFriendFeedAuthorIds,
  getHiddenPostIds,
  requireVisiblePost,
  type FeedDatabase,
} from "@/server/services/feed-access"
import { destroyFeedImage, uploadFeedImage } from "@/server/services/feed-images"
import { createWorkoutShareSnapshot } from "@/server/services/workout-share"
import { getCtxUserId } from "@/server/utils/user"
import { ALL_EMOJI_GROUPS } from "@/variables/emojis"
import { QUEST_DEFINITIONS } from "@/variables/quests"

const PUBLIC_USER_COLUMNS = {
  id: true,
  name: true,
  username: true,
  image: true,
  uploadedImage: true,
} as const

const ALLOWED_EMOJIS = new Set([
  "💪",
  "🔥",
  "👏",
  "❤️",
  "🎉",
  "😮",
  ...ALL_EMOJI_GROUPS.flatMap((group) => group.emojis.map((emoji) => emoji.emoji)),
])

const cursorZod = z.object({
  createdAt: z.date(),
  id: z.string().uuid(),
})

export const feedRouter = createTRPCRouter({
  getLatestPosts: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(10),
      scope: z.enum(["friends", "mine"]).default("friends"),
      cursor: cursorZod.optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const limit = input?.limit ?? 10
      const scope = input?.scope ?? "friends"
      const [authorIds, blockedIds, hiddenPostIds] = await Promise.all([
        getFriendFeedAuthorIds(ctx.db, userId),
        getBlockedUserIds(ctx.db, userId),
        getHiddenPostIds(ctx.db, userId),
      ])
      const cursorCondition = input?.cursor
        ? or(
            lt(feedPost.createdAt, input.cursor.createdAt),
            and(
              eq(feedPost.createdAt, input.cursor.createdAt),
              lt(feedPost.id, input.cursor.id),
            ),
          )
        : undefined
      const normalConditions = [
        isNull(feedPost.removedAt),
        scope === "mine" ? eq(feedPost.userId, userId) : inArray(feedPost.userId, authorIds),
        scope === "friends" ? isNull(feedPost.pinnedAt) : undefined,
        blockedIds.length ? notInArray(feedPost.userId, blockedIds) : undefined,
        hiddenPostIds.length ? notInArray(feedPost.id, hiddenPostIds) : undefined,
        cursorCondition,
      ].filter(Boolean)
      const rows = await ctx.db.query.feedPost.findMany({
        limit: limit + 1,
        orderBy: [desc(feedPost.createdAt), desc(feedPost.id)],
        where: and(...normalConditions),
        with: postRelations,
      })
      const hasMore = rows.length > limit
      const pageRows = rows.slice(0, limit)
      const lastItem = pageRows.at(-1)
      const pinnedRows = scope === "friends" && !input?.cursor
        ? await ctx.db.query.feedPost.findMany({
            orderBy: [desc(feedPost.pinnedAt), desc(feedPost.id)],
            where: and(
              isNull(feedPost.removedAt),
              isNotNull(feedPost.pinnedAt),
              blockedIds.length ? notInArray(feedPost.userId, blockedIds) : undefined,
              hiddenPostIds.length ? notInArray(feedPost.id, hiddenPostIds) : undefined,
            ),
            with: postRelations,
          })
        : []

      const [pinnedItems, items] = await Promise.all([
        hydratePosts(ctx.db, userId, pinnedRows),
        hydratePosts(ctx.db, userId, pageRows),
      ])

      return {
        pinnedItems,
        items,
        nextCursor: hasMore && lastItem
          ? { createdAt: lastItem.createdAt, id: lastItem.id }
          : undefined,
      }
    }),

  getPost: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: postId }) => {
      const userId = getCtxUserId(ctx)
      await requireVisiblePost(ctx.db, userId, postId)
      const post = await ctx.db.query.feedPost.findFirst({
        where: eq(feedPost.id, postId),
        with: postRelations,
      })
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." })
      return (await hydratePosts(ctx.db, userId, [post]))[0]!
    }),

  getComments: protectedProcedure
    .input(z.object({
      postId: z.string().uuid(),
      limit: z.number().int().min(1).max(50).default(20),
      cursor: cursorZod.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      await requireVisiblePost(ctx.db, userId, input.postId)
      const blockedIds = await getBlockedUserIds(ctx.db, userId)
      const rows = await ctx.db.query.feedPostComment.findMany({
        limit: input.limit + 1,
        orderBy: [asc(feedPostComment.createdAt), asc(feedPostComment.id)],
        where: and(
          eq(feedPostComment.postId, input.postId),
          blockedIds.length ? notInArray(feedPostComment.userId, blockedIds) : undefined,
          input.cursor
            ? or(
                gt(feedPostComment.createdAt, input.cursor.createdAt),
                and(
                  eq(feedPostComment.createdAt, input.cursor.createdAt),
                  gt(feedPostComment.id, input.cursor.id),
                ),
              )
            : undefined,
        ),
        with: { author: { columns: PUBLIC_USER_COLUMNS } },
      })
      const hasMore = rows.length > input.limit
      const items = rows.slice(0, input.limit)
      const lastItem = items.at(-1)

      return {
        items,
        nextCursor: hasMore && lastItem
          ? { createdAt: lastItem.createdAt, id: lastItem.id }
          : undefined,
      }
    }),

  createPost: protectedProcedure
    .input(CreateFeedPostZod)
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const postId = randomUUID()
      const uploaded = input.image
        ? await uploadFeedImage(input.image, userId, postId)
        : null

      try {
        await ctx.db.insert(feedPost).values({
          id: postId,
          userId,
          kind: "status",
          description: input.description?.trim() ?? null,
          ...uploaded,
        })
      } catch (error) {
        await destroyFeedImage(uploaded?.imagePublicId ?? null)
        throw error
      }

      return { postId }
    }),

  getWorkoutShareStatus: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input: sessionId }) => {
      const userId = getCtxUserId(ctx)
      const [session, shared] = await Promise.all([
        ctx.db.query.workoutSession.findFirst({
          where: and(eq(workoutSession.id, sessionId), eq(workoutSession.userId, userId)),
          with: { experienceReview: true },
        }),
        ctx.db.query.feedWorkoutShare.findFirst({
          where: eq(feedWorkoutShare.workoutSessionId, sessionId),
          columns: { postId: true },
        }),
      ])

      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Workout not found." })
      if (shared) return { status: "shared" as const, postId: shared.postId }
      if (!session.endedAt) return { status: "incomplete" as const, postId: null }
      if (session.experienceReview?.status === "pending") return { status: "pending" as const, postId: null }
      if (session.experienceReview?.status === "rejected") return { status: "rejected" as const, postId: null }
      return { status: "available" as const, postId: null }
    }),

  createWorkoutShare: protectedProcedure
    .input(ShareFeedPostFieldsZod.extend({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const ownedSession = await ctx.db.query.workoutSession.findFirst({
        where: and(
          eq(workoutSession.id, input.sessionId),
          eq(workoutSession.userId, userId),
        ),
        columns: { id: true },
      })
      if (!ownedSession) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workout not found." })
      }
      const existing = await ctx.db.query.feedWorkoutShare.findFirst({
        where: eq(feedWorkoutShare.workoutSessionId, input.sessionId),
        columns: { postId: true },
      })
      if (existing) return existing

      const snapshot = await createWorkoutShareSnapshot(ctx.db, userId, input.sessionId)
      const postId = randomUUID()
      const uploaded = input.image
        ? await uploadFeedImage(input.image, userId, postId)
        : null

      try {
        await ctx.db.transaction(async (tx) => {
          await tx.insert(feedPost).values({
            id: postId,
            userId,
            kind: "workout",
            description: input.description?.trim() ?? null,
            ...uploaded,
          })
          await tx.insert(feedWorkoutShare).values({
            postId,
            workoutSessionId: input.sessionId,
            snapshot,
          })
        })
      } catch (error) {
        await destroyFeedImage(uploaded?.imagePublicId ?? null)
        throw error
      }

      return { postId }
    }),

  getMyQuestShares: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    return await ctx.db
      .select({ questClaimId: feedQuestShare.questClaimId, postId: feedQuestShare.postId })
      .from(feedQuestShare)
      .innerJoin(questClaim, eq(questClaim.id, feedQuestShare.questClaimId))
      .where(eq(questClaim.userId, userId))
  }),

  createQuestShare: protectedProcedure
    .input(ShareFeedPostFieldsZod.extend({ questClaimId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const claim = await ctx.db.query.questClaim.findFirst({
        where: and(eq(questClaim.id, input.questClaimId), eq(questClaim.userId, userId)),
      })
      if (!claim) throw new TRPCError({ code: "NOT_FOUND", message: "Quest reward not found." })
      const existing = await ctx.db.query.feedQuestShare.findFirst({
        where: eq(feedQuestShare.questClaimId, claim.id),
        columns: { postId: true },
      })
      if (existing) return existing
      const definition = QUEST_DEFINITIONS.find((quest) => quest.id === claim.questId)
      if (!definition) throw new TRPCError({ code: "NOT_FOUND", message: "Quest definition not found." })
      const expectedPeriodKey = getQuestPeriodKey(definition.cadence, claim.claimedAt)
      const sourceEvent = await ctx.db.query.experienceEvent.findFirst({
        where: and(
          eq(experienceEvent.userId, userId),
          eq(experienceEvent.source, "quest"),
          eq(experienceEvent.sourceId, `${claim.questId}:${claim.periodKey}`),
        ),
      })
      if (
        claim.periodKey !== expectedPeriodKey ||
        !sourceEvent ||
        sourceEvent.amount !== claim.experienceAwarded
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This quest claim does not have a valid reward source.",
        })
      }

      const postId = randomUUID()
      const uploaded = input.image
        ? await uploadFeedImage(input.image, userId, postId)
        : null

      try {
        await ctx.db.transaction(async (tx) => {
          await tx.insert(feedPost).values({
            id: postId,
            userId,
            kind: "quest",
            description: input.description?.trim() ?? null,
            ...uploaded,
          })
          await tx.insert(feedQuestShare).values({
            postId,
            questClaimId: claim.id,
            snapshot: {
              questId: definition.id,
              title: definition.title,
              cadence: definition.cadence,
              target: definition.target,
              unit: definition.unit,
              periodKey: claim.periodKey,
              claimedAt: claim.claimedAt.toISOString(),
              experienceAwarded: claim.experienceAwarded,
            },
          })
        })
      } catch (error) {
        await destroyFeedImage(uploaded?.imagePublicId ?? null)
        throw error
      }

      return { postId }
    }),

  setReaction: protectedProcedure
    .input(z.object({ postId: z.string().uuid(), emoji: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      await requireVisiblePost(ctx.db, userId, input.postId)
      if (input.emoji && !ALLOWED_EMOJIS.has(input.emoji)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Choose an emoji from the reaction picker." })
      }

      const existing = await ctx.db.query.feedPostReaction.findFirst({
        where: and(eq(feedPostReaction.postId, input.postId), eq(feedPostReaction.userId, userId)),
      })
      if (!input.emoji || existing?.emoji === input.emoji) {
        await ctx.db.delete(feedPostReaction).where(and(
          eq(feedPostReaction.postId, input.postId),
          eq(feedPostReaction.userId, userId),
        ))
        return { emoji: null }
      }

      await ctx.db.insert(feedPostReaction).values({
        postId: input.postId,
        userId,
        emoji: input.emoji,
      }).onConflictDoUpdate({
        target: [feedPostReaction.postId, feedPostReaction.userId],
        set: { emoji: input.emoji, updatedAt: new Date() },
      })
      return { emoji: input.emoji }
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.string().uuid(), content: FeedCommentZod }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      await requireVisiblePost(ctx.db, userId, input.postId)
      const [comment] = await ctx.db.insert(feedPostComment).values({
        postId: input.postId,
        userId,
        content: input.content.trim(),
      }).returning()
      return comment
    }),

  reportPost: protectedProcedure
    .input(z.object({
      postId: z.string().uuid(),
      reason: z.enum(["spam", "harassment", "hate-or-abuse", "unsafe-or-misleading", "other"]),
      details: z.string().trim().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const post = await requireVisiblePost(ctx.db, userId, input.postId)
      if (post.userId === userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot report your own post." })
      }

      await ctx.db.transaction(async (tx) => {
        await tx.insert(feedPostReport).values({
          postId: input.postId,
          reporterId: userId,
          reason: input.reason,
          details: input.details || null,
        }).onConflictDoNothing()
        await tx.insert(feedPostHidden).values({
          postId: input.postId,
          userId,
        }).onConflictDoNothing()
      })
      return { hidden: true }
    }),

  setPinned: adminProcedure
    .input(z.object({ postId: z.string().uuid(), pinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(feedPost).set({
        pinnedAt: input.pinned ? new Date() : null,
        pinnedBy: input.pinned ? getCtxUserId(ctx) : null,
      }).where(and(eq(feedPost.id, input.postId), isNull(feedPost.removedAt))).returning({ id: feedPost.id })
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." })
      return { pinned: input.pinned }
    }),

  getPendingReports: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.feedPostReport.findMany({
      where: eq(feedPostReport.status, "pending"),
      orderBy: [asc(feedPostReport.createdAt)],
      with: {
        reporter: { columns: PUBLIC_USER_COLUMNS },
        post: {
          with: postRelations,
        },
      },
    })
    const groups = new Map<string, {
      post: (typeof rows)[number]["post"]
      reports: Array<Omit<(typeof rows)[number], "post">>
    }>()

    rows.forEach(({ post, ...report }) => {
      const current = groups.get(post.id) ?? { post, reports: [] }
      current.reports.push(report)
      groups.set(post.id, current)
    })
    return [...groups.values()]
  }),

  resolveReports: adminProcedure
    .input(z.object({ postId: z.string().uuid(), decision: z.enum(["kept", "removed"]) }))
    .mutation(async ({ ctx, input }) => {
      const moderatorId = getCtxUserId(ctx)
      const post = await ctx.db.query.feedPost.findFirst({ where: eq(feedPost.id, input.postId) })
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." })

      await ctx.db.transaction(async (tx) => {
        await tx.update(feedPostReport).set({
          status: input.decision,
          resolvedAt: new Date(),
          resolvedBy: moderatorId,
        }).where(and(eq(feedPostReport.postId, input.postId), eq(feedPostReport.status, "pending")))

        if (input.decision === "removed") {
          await tx.update(feedPost).set({
            removedAt: new Date(),
            removedBy: moderatorId,
            pinnedAt: null,
            pinnedBy: null,
          }).where(eq(feedPost.id, input.postId))
        }
      })
      if (input.decision === "removed") await destroyFeedImage(post.imagePublicId)
      return { decision: input.decision }
    }),
})

const postRelations = {
  author: { columns: PUBLIC_USER_COLUMNS },
  workoutShare: true,
  questShare: true,
} as const

async function hydratePosts<TRow extends {
  id: string
  workoutShare: { snapshot: WorkoutShareSnapshot } | null
  questShare: { snapshot: QuestShareSnapshot } | null
}>(database: FeedDatabase, userId: string, rows: TRow[]) {
  if (rows.length === 0) return []
  const postIds = rows.map((row) => row.id)
  const blockedIds = await getBlockedUserIds(database, userId)
  const [comments, reactions] = await Promise.all([
    database.query.feedPostComment.findMany({
      where: and(
        inArray(feedPostComment.postId, postIds),
        blockedIds.length ? notInArray(feedPostComment.userId, blockedIds) : undefined,
      ),
      orderBy: [asc(feedPostComment.createdAt), asc(feedPostComment.id)],
      with: { author: { columns: PUBLIC_USER_COLUMNS } },
    }),
    database.query.feedPostReaction.findMany({
      where: and(
        inArray(feedPostReaction.postId, postIds),
        blockedIds.length ? notInArray(feedPostReaction.userId, blockedIds) : undefined,
      ),
      orderBy: [asc(feedPostReaction.emoji)],
    }),
  ])

  return rows.map(({ workoutShare, questShare, ...post }) => {
    const postComments = comments.filter((comment) => comment.postId === post.id)
    const postReactions = reactions.filter((reaction) => reaction.postId === post.id)
    const reactionCounts = new Map<string, number>()
    postReactions.forEach((reaction) => {
      reactionCounts.set(reaction.emoji, (reactionCounts.get(reaction.emoji) ?? 0) + 1)
    })

    return {
      ...post,
      workout: workoutShare?.snapshot ?? null,
      quest: questShare?.snapshot ?? null,
      reactionGroups: [...reactionCounts.entries()]
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((left, right) => right.count - left.count || left.emoji.localeCompare(right.emoji)),
      viewerReaction: postReactions.find((reaction) => reaction.userId === userId)?.emoji ?? null,
      commentCount: postComments.length,
      commentPreview: postComments.slice(-3),
    }
  })
}

function getQuestPeriodKey(cadence: "daily" | "weekly" | "journey", claimedAt: Date) {
  if (cadence === "journey") return "lifetime"
  const periodStart = new Date(Date.UTC(
    claimedAt.getUTCFullYear(),
    claimedAt.getUTCMonth(),
    claimedAt.getUTCDate(),
  ))
  if (cadence === "weekly") {
    const daysSinceMonday = (periodStart.getUTCDay() + 6) % 7
    periodStart.setUTCDate(periodStart.getUTCDate() - daysSinceMonday)
  }
  return periodStart.toISOString().slice(0, 10)
}
