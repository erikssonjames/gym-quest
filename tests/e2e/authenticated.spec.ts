import { expect, test } from "@playwright/test"

test("an authenticated user can open the application dashboard", async ({
  page,
}) => {
  await page.goto("/user")

  await expect(page).not.toHaveURL(/\/signin/)
  await expect(page.locator("main")).toBeVisible()
})

test("a normal user cannot open an administrator page", async ({ page }) => {
  await page.goto("/user/billing")

  await expect(page).not.toHaveURL(/\/user\/billing$/)
})
