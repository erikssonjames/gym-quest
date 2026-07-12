import "./server"

import { afterAll, beforeAll } from "vitest"

import {
  closeTestDatabase,
  resetTestDatabase,
} from "../support/test-database"

beforeAll(async () => resetTestDatabase())
afterAll(async () => closeTestDatabase())
