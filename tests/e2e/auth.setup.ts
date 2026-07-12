import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test as setup } from "@playwright/test"

import { e2eUsers } from "./e2e-users"

const directory = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.resolve(directory, "../../playwright/.auth/user.json")

setup("authenticate a normal user", async ({ page }) => {
  await page.goto("/signin")
  await page.getByLabel("Email or username").fill(e2eUsers.user.email)
  await page.getByLabel("Password").fill(e2eUsers.user.password)
  await page.getByRole("button", { name: "Sign in" }).click()

  await page.waitForURL(/\/user(?:\/|$)/)
  await expect(page).not.toHaveURL(/\/signin/)
  await page.context().storageState({ path: authFile })
})
