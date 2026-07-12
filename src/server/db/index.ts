import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Options } from "postgres";
import { env } from "@/env";

// Schemas
import * as userSchema from "./schema/user";
import * as bodySchema from "./schema/body"
import * as exerciseSchema from "./schema/exercise"
import * as workoutSchema from "./schema/workout"
import * as notifications from "./schema/notifications"
import * as badges from "./schema/badges"
import * as feed from "./schema/feed"
import * as billing from "./schema/billing"
import * as weight from "./schema/weight"
import * as progression from "./schema/progression"

import * as relations from "./schema/relations"


// Combined Schema
const schema = {
  ...userSchema,
  ...bodySchema,
  ...exerciseSchema,
  ...workoutSchema,
  ...notifications,
  ...badges,
  ...feed,
  ...billing,
  ...weight,
  ...progression,
  
  ...relations
}

export function createDatabase(
  connectionString: string,
  options: Options<Record<string, postgres.PostgresType>> = {},
) {
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    onnotice: () => undefined,
    ...options,
  })

  return {
    client,
    db: drizzle(client, { schema }),
  }
}

const ssl = env.DATABASE_SSL === "require" ? "require" : env.DATABASE_SSL === "true";
const productionDatabase = createDatabase(env.DATABASE_URL, { ssl })

export const db = productionDatabase.db
