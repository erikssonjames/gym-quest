import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { render } from "../../../../../../tests/support/render"
import type { RouterOutputs } from "@/trpc/react"
import FeedPost from "./feed-post"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}))

vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: { alt: string; src: string }) => (
    // The image stub keeps this component test independent from Next's image optimizer.
    <img alt={alt} src={src} {...props} />
  ),
}))

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      feed: {
        getLatestPosts: { invalidate: vi.fn() },
        getPost: { invalidate: vi.fn() },
      },
    }),
    feed: {
      setReaction: {
        useMutation: () => ({ isPending: false, mutate: mocks.mutate }),
      },
    },
  },
}))

vi.mock("./emoji-reaction-picker", () => ({
  EmojiReactionPicker: () => <button type="button">Choose reaction</button>,
}))
vi.mock("./post-actions", () => ({
  PostActions: () => <button type="button">Post controls</button>,
}))
vi.mock("./post-comments", () => ({
  PostComments: () => <div>Comments</div>,
}))

type FeedPostItem = RouterOutputs["feed"]["getLatestPosts"]["items"][number]

describe("FeedPost", () => {
  beforeEach(() => mocks.mutate.mockReset())

  test("renders an image-only pinned post with author fallback and canonical link", () => {
    render(<FeedPost post={post({
      description: null,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/feed/photo.webp",
      imageWidth: 1200,
      imageHeight: 800,
      pinnedAt: new Date("2026-07-18T12:05:00.000Z"),
    })} />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("A")).toBeInTheDocument()
    expect(screen.getByText("Pinned")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Training update from Alice" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ago$/ })).toHaveAttribute("href", "/user/posts/00000000-0000-4000-8000-000000000010")
  })

  test("renders a workout summary with XP, level-up, metrics, best set, and three feed records", () => {
    render(<FeedPost post={post({
      kind: "workout",
      workout: {
        workoutName: "Upper power",
        completedAt: "2026-07-18T12:00:00.000Z",
        durationSeconds: 3_600,
        exerciseCount: 4,
        completedSetCount: 12,
        totalReps: 96,
        totalVolume: 8_500,
        experienceAwarded: 950,
        beforeLevel: 2,
        afterLevel: 3,
        bestSet: { exerciseName: "Bench press", reps: 5, weight: 100, volume: 500 },
        records: [
          record("Bench press", "weight", 100),
          record("Squat", "set-volume", 1_200),
          record("Deadlift", "weight", 160),
          record("Row", "set-volume", 800),
        ],
      },
    })} />)

    expect(screen.getByText((_, element) => (
      element?.tagName === "P" && element.textContent?.replaceAll(/\s+/g, " ").trim() === "+950 XP"
    ))).toBeInTheDocument()
    expect(screen.getByText("Level 3")).toBeInTheDocument()
    expect(screen.getByText("1h 0m")).toBeInTheDocument()
    expect(screen.getByText("Bench press · 100 kg × 5")).toBeInTheDocument()
    expect(screen.getByText("+1 more on the full post")).toBeInTheDocument()
    expect(screen.queryByText("Row")).not.toBeInTheDocument()
  })

  test("shows every workout record on the permalink and renders quest shares", () => {
    const workoutPost = post({
      kind: "workout",
      workout: {
        workoutName: "Record day",
        completedAt: "2026-07-18T12:00:00.000Z",
        durationSeconds: 900,
        exerciseCount: 1,
        completedSetCount: 4,
        totalReps: 20,
        totalVolume: 2_000,
        experienceAwarded: 300,
        beforeLevel: 1,
        afterLevel: 1,
        bestSet: null,
        records: [
          record("Bench press", "weight", 100),
          record("Squat", "set-volume", 1_200),
          record("Deadlift", "weight", 160),
          record("Row", "set-volume", 800),
        ],
      },
    })
    const { rerender } = render(<FeedPost full post={workoutPost} />)
    expect(screen.getByText("Row")).toBeInTheDocument()

    rerender(<FeedPost post={post({
      kind: "quest",
      quest: {
        questId: "daily-session",
        title: "Answer the call",
        cadence: "daily",
        target: 1,
        unit: "workout",
        periodKey: "2026-07-18",
        claimedAt: "2026-07-18T12:00:00.000Z",
        experienceAwarded: 300,
      },
    })} />)
    expect(screen.getByText("Daily quest complete")).toBeInTheDocument()
    expect(screen.getByText("Answer the call")).toBeInTheDocument()
    expect(screen.getByText("+300 XP")).toBeInTheDocument()
  })
})

function post(overrides: Partial<FeedPostItem> = {}) {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    userId: "00000000-0000-4000-8000-000000000011",
    kind: "status",
    description: "A training update",
    imageUrl: null,
    imagePublicId: null,
    imageWidth: null,
    imageHeight: null,
    createdAt: new Date("2026-07-18T12:00:00.000Z"),
    pinnedAt: null,
    pinnedBy: null,
    removedAt: null,
    removedBy: null,
    author: {
      id: "00000000-0000-4000-8000-000000000011",
      name: "Alice",
      username: null,
      image: null,
      uploadedImage: null,
    },
    workout: null,
    quest: null,
    reactionGroups: [],
    viewerReaction: null,
    commentCount: 0,
    commentPreview: [],
    ...overrides,
  } as FeedPostItem
}

function record(
  exerciseName: string,
  metric: "weight" | "set-volume",
  value: number,
) {
  return {
    exerciseId: exerciseName.toLowerCase().replaceAll(" ", "-"),
    exerciseName,
    metric,
    previousValue: value - 10,
    value,
    weight: value,
    reps: 5,
  }
}
