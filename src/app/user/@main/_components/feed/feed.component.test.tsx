import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { render } from "../../../../../../tests/support/render"
import Feed from "./index"

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
  useInfiniteQuery: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/user",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.searchParams,
}))

vi.mock("@/trpc/react", () => ({
  api: {
    feed: {
      getLatestPosts: {
        useInfiniteQuery: mocks.useInfiniteQuery,
      },
    },
  },
}))

vi.mock("./post-composer", () => ({ default: () => <div>Post composer</div> }))

describe("Feed", () => {
  beforeEach(() => {
    mocks.replace.mockReset()
    mocks.searchParams = new URLSearchParams()
    mocks.useInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [], nextCursor: undefined }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
    })
  })

  test("loads the community feed by default", () => {
    render(<Feed />)

    expect(mocks.useInfiniteQuery).toHaveBeenCalledWith(
      { limit: 10, scope: "community" },
      expect.objectContaining({ getNextPageParam: expect.any(Function) }),
    )
    expect(screen.getByText("Welcome to your training feed")).toBeInTheDocument()
  })

  test("stores the personal feed choice in the URL", async () => {
    const user = userEvent.setup()
    render(<Feed />)

    await user.click(screen.getByRole("radio", { name: "My posts" }))

    expect(mocks.replace).toHaveBeenCalledWith("/user?feed=mine", { scroll: false })
  })

  test("reads the personal feed choice from the URL", () => {
    mocks.searchParams = new URLSearchParams("feed=mine")

    render(<Feed />)

    expect(mocks.useInfiniteQuery).toHaveBeenCalledWith(
      { limit: 10, scope: "mine" },
      expect.objectContaining({ getNextPageParam: expect.any(Function) }),
    )
    expect(screen.getByText("You have not posted yet")).toBeInTheDocument()
  })
})
