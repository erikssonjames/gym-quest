import { describe, expect, test } from "vitest"

import {
  CreateFeedPostZod,
  FeedCommentZod,
  ShareFeedPostFieldsZod,
} from "./feed"

describe("feed post validation", () => {
  test("requires a caption or picture for a status post", () => {
    expect(CreateFeedPostZod.safeParse({}).success).toBe(false)
    expect(CreateFeedPostZod.safeParse({ description: "Progress update" }).success).toBe(true)
    expect(CreateFeedPostZod.safeParse({
      image: {
        name: "progress.png",
        type: "image/png",
        base64: "data:image/png;base64,aW1hZ2U=",
      },
    }).success).toBe(true)
  })

  test("allows structured shares without a caption or picture and rejects unsupported images", () => {
    expect(ShareFeedPostFieldsZod.safeParse({}).success).toBe(true)
    expect(CreateFeedPostZod.safeParse({
      image: {
        name: "progress.gif",
        type: "image/gif",
        base64: "data:image/gif;base64,aW1hZ2U=",
      },
    }).success).toBe(false)
  })

  test("limits comments to 500 trimmed characters", () => {
    expect(FeedCommentZod.safeParse("x".repeat(500)).success).toBe(true)
    expect(FeedCommentZod.safeParse("x".repeat(501)).success).toBe(false)
    expect(FeedCommentZod.safeParse("   ").success).toBe(false)
  })
})
