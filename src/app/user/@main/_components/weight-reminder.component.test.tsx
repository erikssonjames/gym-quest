import { screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { render } from "../../../../../tests/support/render"
import WeightReminder from "./weight-reminder"

const mocks = vi.hoisted(() => ({
  useReminderQuery: vi.fn(),
}))

vi.mock("@/trpc/react", () => ({
  api: {
    weight: {
      getReminderStatus: {
        useQuery: mocks.useReminderQuery,
      },
    },
  },
}))

describe("WeightReminder", () => {
  test("stays hidden after weight has already been logged", () => {
    mocks.useReminderQuery.mockReturnValue({
      data: { shouldRemind: false },
    })

    const { container } = render(<WeightReminder />)

    expect(container).toBeEmptyDOMElement()
  })

  test("links to weight tracking when a log is due", () => {
    mocks.useReminderQuery.mockReturnValue({
      data: { shouldRemind: true },
    })

    render(<WeightReminder />)

    const reminder = screen.getByRole("link", { name: "Log weight" })

    expect(reminder).toHaveAttribute("href", "/user/progress/weight")
    expect(reminder).toHaveClass("h-10", "bg-primary")
  })
})
