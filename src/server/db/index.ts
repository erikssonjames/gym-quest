import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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
  
  ...relations
}

const connectionString = env.DATABASE_URL;
const ssl = env.DATABASE_SSL === "require" ? "require" : env.DATABASE_SSL === "true";

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl,
  onnotice: () => undefined
})
export const db = drizzle(client, { schema  });
