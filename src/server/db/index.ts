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

import * as relations from "./schema/relations"


// Combined Schema
const schema = {
  ...userSchema,
  ...bodySchema,
  ...exerciseSchema,
  ...workoutSchema,
  ...notifications,
  ...badges,
  
  ...relations
}

const connectionString = env.SUPABASE_URI;

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: 'require',
  onnotice: () => undefined
})
export const db = drizzle(client, { schema  });
