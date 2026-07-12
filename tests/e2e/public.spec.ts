import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("landing page exposes the primary signup journey", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("link", { name: "Join GymQuest" }),
  ).toHaveAttribute("href", "/signup")
})

test("sign-in form validates required credentials", async ({ page }) => {
  await page.goto("/signin")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page.getByText("Enter your email or username.")).toBeVisible()
  await expect(page.getByText("Enter your password.")).toBeVisible()
})

test("public pages have no automatically detectable WCAG A/AA violations", async ({
  page,
}, testInfo) => {
  for (const route of ["/", "/signin", "/signup"]) {
    await page.goto(route)
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    await testInfo.attach(`axe-${route === "/" ? "home" : route.slice(1)}`, {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    })
    expect(result.violations).toEqual([])
  }
})
