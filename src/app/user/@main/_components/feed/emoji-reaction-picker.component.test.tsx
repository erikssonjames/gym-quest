import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest"

import { render } from "../../../../../../tests/support/render"
import { EmojiReactionPicker } from "./emoji-reaction-picker"

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterAll(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView
})

describe("EmojiReactionPicker", () => {
  test("selects a quick reaction and lets the active reaction toggle off", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<EmojiReactionPicker onChange={onChange} value={null} />)

    await user.click(screen.getByRole("button", { name: "Choose an emoji reaction" }))
    await user.click(screen.getByRole("radio", { name: "React with 💪" }))
    expect(onChange).toHaveBeenLastCalledWith("💪")

    rerender(<EmojiReactionPicker onChange={onChange} value="💪" />)
    await user.click(screen.getByRole("button", { name: "Choose an emoji reaction" }))
    await user.click(screen.getByRole("radio", { name: "React with 💪" }))
    expect(onChange).toHaveBeenLastCalledWith("💪")
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  test("searches the complete categorized picker by emoji name", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EmojiReactionPicker onChange={onChange} value={null} />)

    await user.click(screen.getByRole("button", { name: "Choose an emoji reaction" }))
    await user.type(screen.getByPlaceholderText("Search reactions..."), "Fire")
    await user.click(screen.getByRole("option", { name: "Fire" }))

    expect(onChange).toHaveBeenCalledWith("🔥")
  })
})
