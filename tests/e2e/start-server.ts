import "../setup/env"

import { eq } from "drizzle-orm"

import { hashPassword } from "@/lib/hash"
import { userPrivateInformation, users } from "@/server/db/schema/user"
import { provisionUserRecords } from "@/server/services/user-provisioning"
import {
  closeTestDatabase,
  resetTestDatabase,
  testDb,
} from "../support/test-database"
import { e2eUsers } from "./e2e-users"

await resetTestDatabase()

for (const fixture of Object.values(e2eUsers)) {
  await testDb.insert(users).values({
    id: fixture.id,
    email: fixture.email,
    username: fixture.username,
    name: fixture.role === "admin" ? "E2E Admin" : "E2E User",
  })
  await provisionUserRecords(testDb, fixture.id, {
    password: await hashPassword(fixture.password),
  })

  if (fixture.role !== "user") {
    await testDb
      .update(userPrivateInformation)
      .set({ role: fixture.role })
      .where(eq(userPrivateInformation.userId, fixture.id))
  }
}

await closeTestDatabase()
await import("../../server")
