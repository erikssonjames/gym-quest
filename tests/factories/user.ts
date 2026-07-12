import { randomUUID } from "node:crypto"

import type { NewUser } from "@/server/db/schema/user"

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = overrides.id ?? randomUUID()

  return {
    id,
    email: `test-${id}@example.com`,
    name: "Test User",
    username: `user-${id.slice(0, 8)}`,
    ...overrides,
  }
}
