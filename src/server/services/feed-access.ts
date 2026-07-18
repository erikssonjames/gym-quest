import { and, eq, or } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

import { type db } from "@/server/db"
import { feedPost, feedPostHidden, userBlock } from "@/server/db/schema/feed"
import { friendShip } from "@/server/db/schema/user"

export type FeedDatabase = typeof db

export async function getBlockedUserIds(database: FeedDatabase, userId: string) {
  const rows = await database
    .select({ blockerId: userBlock.blockerId, blockedId: userBlock.blockedId })
    .from(userBlock)
    .where(or(eq(userBlock.blockerId, userId), eq(userBlock.blockedId, userId)))

  return rows.map((row) => row.blockerId === userId ? row.blockedId : row.blockerId)
}

export async function getFriendFeedAuthorIds(database: FeedDatabase, userId: string) {
  const [friendships, blockedIds] = await Promise.all([
    database
      .select({ userOne: friendShip.userOne, userTwo: friendShip.userTwo })
      .from(friendShip)
      .where(or(eq(friendShip.userOne, userId), eq(friendShip.userTwo, userId))),
    getBlockedUserIds(database, userId),
  ])
  const blocked = new Set(blockedIds)

  return [
    userId,
    ...friendships
      .map((row) => row.userOne === userId ? row.userTwo : row.userOne)
      .filter((friendId) => !blocked.has(friendId)),
  ]
}

export async function getHiddenPostIds(database: FeedDatabase, userId: string) {
  const rows = await database
    .select({ postId: feedPostHidden.postId })
    .from(feedPostHidden)
    .where(eq(feedPostHidden.userId, userId))

  return rows.map((row) => row.postId)
}

export async function requireVisiblePost(database: FeedDatabase, userId: string, postId: string) {
  const [post, authorIds, blockedIds, hidden] = await Promise.all([
    database.query.feedPost.findFirst({ where: eq(feedPost.id, postId) }),
    getFriendFeedAuthorIds(database, userId),
    getBlockedUserIds(database, userId),
    database.query.feedPostHidden.findFirst({
      where: and(eq(feedPostHidden.postId, postId), eq(feedPostHidden.userId, userId)),
      columns: { postId: true },
    }),
  ])

  if (
    !post ||
    post.removedAt ||
    hidden ||
    blockedIds.includes(post.userId) ||
    (!post.pinnedAt && !authorIds.includes(post.userId))
  ) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." })
  }

  return post
}
