import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { createCaller } from "@/server/api/root"
import {
  feedPost,
  feedPostComment,
  feedPostReaction,
  feedPostReport,
  feedQuestShare,
  userBlock,
} from "@/server/db/schema/feed"
import { experienceEvent, questClaim } from "@/server/db/schema/progression"
import {
  friendRequest,
  friendShip,
  userPrivateInformation,
  users,
  type NewUser,
  type UserRole,
} from "@/server/db/schema/user"
import { buildUser } from "../factories/user"
import { testDb, truncateTestDatabase } from "../support/test-database"

vi.mock("@/auth", () => ({ auth: vi.fn() }))

describe("friends feed social policies", () => {
  beforeEach(async () => truncateTestDatabase())

  test("shows friend posts, replaces reactions, and previews the latest three comments", async () => {
    const [alice, bob] = await insertUsers("Alice", "Bob")
    await testDb.insert(friendShip).values({ userOne: alice.id!, userTwo: bob.id! })
    const bobApi = callerFor(bob)
    const aliceApi = callerFor(alice)
    const { postId } = await bobApi.feed.createPost({ description: "Strong session today" })

    const firstPage = await aliceApi.feed.getLatestPosts({ limit: 10, scope: "friends" })
    expect(firstPage.items.map((post) => post.id)).toContain(postId)

    await expect(aliceApi.feed.setReaction({ postId, emoji: "💪" })).resolves.toEqual({ emoji: "💪" })
    await expect(aliceApi.feed.setReaction({ postId, emoji: "🔥" })).resolves.toEqual({ emoji: "🔥" })
    expect(await testDb.select().from(feedPostReaction)).toMatchObject([{ postId, userId: alice.id, emoji: "🔥" }])
    await expect(aliceApi.feed.setReaction({ postId, emoji: "🔥" })).resolves.toEqual({ emoji: null })
    expect(await testDb.select().from(feedPostReaction)).toHaveLength(0)

    await testDb.insert(feedPostComment).values([
      comment(postId, bob.id!, "First", "2026-07-18T10:01:00.000Z"),
      comment(postId, alice.id!, "Second", "2026-07-18T10:02:00.000Z"),
      comment(postId, bob.id!, "Third", "2026-07-18T10:03:00.000Z"),
      comment(postId, alice.id!, "Fourth", "2026-07-18T10:04:00.000Z"),
    ])

    const post = await aliceApi.feed.getPost(postId)
    expect(post.commentCount).toBe(4)
    expect(post.commentPreview.map((entry) => entry.content)).toEqual(["Second", "Third", "Fourth"])
    const comments = await aliceApi.feed.getComments({ postId, limit: 2 })
    expect(comments.items.map((entry) => entry.content)).toEqual(["First", "Second"])
    expect(comments.nextCursor).toBeDefined()
    await expect(aliceApi.feed.addComment({ postId, content: "x".repeat(501) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    })
  })

  test("keeps global pins separate and stable across friend-feed cursor pages", async () => {
    const [alice, bob, announcer, admin] = await insertUsers("Alice", "Bob", "Announcer", "Admin")
    await testDb.insert(friendShip).values({ userOne: alice.id!, userTwo: bob.id! })
    await testDb.insert(userPrivateInformation).values({ userId: admin.id!, role: "admin" })
    const aliceApi = callerFor(alice)
    const bobApi = callerFor(bob)
    const announcerApi = callerFor(announcer)
    const adminApi = callerFor(admin, "admin")

    const pinned = await announcerApi.feed.createPost({ description: "Service announcement" })
    await adminApi.feed.setPinned({ postId: pinned.postId, pinned: true })
    const older = await bobApi.feed.createPost({ description: "Older friend post" })
    const newer = await bobApi.feed.createPost({ description: "Newer friend post" })
    await testDb.update(feedPost).set({ createdAt: new Date("2026-07-18T09:00:00.000Z") }).where(eq(feedPost.id, older.postId))
    await testDb.update(feedPost).set({ createdAt: new Date("2026-07-18T10:00:00.000Z") }).where(eq(feedPost.id, newer.postId))

    const first = await aliceApi.feed.getLatestPosts({ limit: 1, scope: "friends" })
    expect(first.pinnedItems.map((post) => post.id)).toEqual([pinned.postId])
    expect(first.items.map((post) => post.id)).toEqual([newer.postId])
    expect(first.nextCursor).toBeDefined()

    const second = await aliceApi.feed.getLatestPosts({
      cursor: first.nextCursor,
      limit: 1,
      scope: "friends",
    })
    expect(second.pinnedItems).toEqual([])
    expect(second.items.map((post) => post.id)).toEqual([older.postId])
    await expect(aliceApi.feed.setPinned({ postId: newer.postId, pinned: true })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    })
  })

  test("reporting hides a post permanently for its reporter and moderation can remove it globally", async () => {
    const [alice, bob, admin] = await insertUsers("Alice", "Bob", "Admin")
    await testDb.insert(friendShip).values({ userOne: alice.id!, userTwo: bob.id! })
    await testDb.insert(userPrivateInformation).values({ userId: admin.id!, role: "admin" })
    const aliceApi = callerFor(alice)
    const bobApi = callerFor(bob)
    const adminApi = callerFor(admin, "admin")
    const { postId } = await bobApi.feed.createPost({ description: "A reportable post" })

    await aliceApi.feed.reportPost({ postId, reason: "spam", details: "Repeated promotion" })
    await expect(aliceApi.feed.getPost(postId)).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect((await aliceApi.feed.getLatestPosts({ limit: 10, scope: "friends" })).items).toHaveLength(0)
    expect(await testDb.select().from(feedPostReport)).toMatchObject([
      { postId, reporterId: alice.id, reason: "spam", status: "pending" },
    ])

    const queue = await adminApi.feed.getPendingReports()
    expect(queue).toHaveLength(1)
    expect(queue[0]?.reports).toHaveLength(1)
    await adminApi.feed.resolveReports({ postId, decision: "kept" })
    await expect(aliceApi.feed.getPost(postId)).rejects.toMatchObject({ code: "NOT_FOUND" })
    await expect(bobApi.feed.getPost(postId)).resolves.toMatchObject({ id: postId })

    await testDb.update(feedPostReport).set({ status: "pending", resolvedAt: null, resolvedBy: null })
    await adminApi.feed.resolveReports({ postId, decision: "removed" })
    await expect(bobApi.feed.getPost(postId)).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect(await testDb.query.feedPost.findFirst({ where: eq(feedPost.id, postId) })).toMatchObject({
      pinnedAt: null,
      removedBy: admin.id,
    })
  })

  test("blocking removes relationships and prevents feed, profile, and request access in both directions", async () => {
    const [alice, bob] = await insertUsers("Alice", "Bob")
    await testDb.insert(friendShip).values({ userOne: alice.id!, userTwo: bob.id! })
    await testDb.insert(friendRequest).values({ fromUserId: bob.id!, toUserId: alice.id! })
    const aliceApi = callerFor(alice)
    const bobApi = callerFor(bob)
    const { postId } = await bobApi.feed.createPost({ description: "Hidden after blocking" })

    await aliceApi.user.blockUser(bob.id!)
    expect(await testDb.select().from(friendShip)).toHaveLength(0)
    expect(await testDb.select().from(friendRequest)).toHaveLength(0)
    expect(await testDb.select().from(userBlock)).toHaveLength(1)
    expect(await aliceApi.user.getBlockedUsers()).toMatchObject([{ id: bob.id }])
    await expect(aliceApi.feed.getPost(postId)).rejects.toMatchObject({ code: "NOT_FOUND" })
    await expect(bobApi.user.getUserById(alice.id!)).rejects.toMatchObject({ code: "NOT_FOUND" })
    await expect(bobApi.user.sendFriendRequest(alice.id!)).rejects.toMatchObject({ code: "FORBIDDEN" })

    await aliceApi.user.unblockUser(bob.id!)
    expect(await testDb.select().from(friendShip)).toHaveLength(0)
    expect(await aliceApi.user.getBlockedUsers()).toEqual([])
  })
})

describe("quest completion sharing", () => {
  beforeEach(async () => truncateTestDatabase())

  test("shares an owned, valid quest claim once and preserves its snapshot", async () => {
    const [alice] = await insertUsers("Alice")
    const claimedAt = new Date("2026-07-18T12:00:00.000Z")
    const [claim] = await testDb.insert(questClaim).values({
      userId: alice.id!,
      questId: "daily-session",
      periodKey: "2026-07-18",
      experienceAwarded: 300,
      claimedAt,
    }).returning()
    await testDb.insert(experienceEvent).values({
      userId: alice.id!,
      source: "quest",
      sourceId: "daily-session:2026-07-18",
      amount: 300,
      createdAt: claimedAt,
    })
    const api = callerFor(alice)

    const first = await api.feed.createQuestShare({ questClaimId: claim!.id, description: "Quest cleared" })
    const duplicate = await api.feed.createQuestShare({ questClaimId: claim!.id })
    expect(duplicate).toEqual(first)
    const [share] = await testDb.select().from(feedQuestShare)
    expect(share?.snapshot).toMatchObject({
      title: "Answer the call",
      cadence: "daily",
      periodKey: "2026-07-18",
      experienceAwarded: 300,
    })

    await testDb.delete(questClaim).where(eq(questClaim.id, claim!.id))
    const [stableShare] = await testDb.select().from(feedQuestShare)
    expect(stableShare).toMatchObject({
      postId: first.postId,
      questClaimId: null,
      snapshot: { title: "Answer the call", experienceAwarded: 300 },
    })
  })

  test("rejects claims owned by another user or with an invalid period/source", async () => {
    const [alice, bob] = await insertUsers("Alice", "Bob")
    const [claim] = await testDb.insert(questClaim).values({
      userId: bob.id!,
      questId: "daily-session",
      periodKey: "2026-07-17",
      experienceAwarded: 300,
      claimedAt: new Date("2026-07-18T12:00:00.000Z"),
    }).returning()
    await testDb.insert(experienceEvent).values({
      userId: bob.id!,
      source: "quest",
      sourceId: "daily-session:2026-07-17",
      amount: 300,
    })

    await expect(callerFor(alice).feed.createQuestShare({ questClaimId: claim!.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    })
    await expect(callerFor(bob).feed.createQuestShare({ questClaimId: claim!.id })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    })
  })
})

function callerFor(user: NewUser, role: UserRole = "user") {
  return createCaller({
    db: testDb,
    headers: new Headers(),
    session: {
      expires: "2099-01-01T00:00:00.000Z",
      user: {
        email: user.email,
        id: user.id!,
        image: user.image ?? null,
        name: user.name ?? null,
        provider: "credentials",
        role,
        username: user.username ?? undefined,
      },
    },
  })
}

type TestUser = NewUser & { id: string }

async function insertUsers<const TNames extends readonly string[]>(...names: TNames) {
  const values = names.map((name) => buildUser({
    id: randomUUID(),
    name,
    username: name.toLowerCase(),
  }) as TestUser)
  await testDb.insert(users).values(values)
  return values as { [Index in keyof TNames]: TestUser }
}

function comment(postId: string, userId: string, content: string, createdAt: string) {
  return {
    postId,
    userId,
    content,
    createdAt: new Date(createdAt),
  }
}
