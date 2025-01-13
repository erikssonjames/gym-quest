import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

// Schemas
import * as userSchema from "./schema/user";
import * as bodySchema from "./schema/body"
import * as exerciseSchema from "./schema/exercise"
import * as workoutSchema from "./schema/workout"


// Combined Schema
const schema = {
    ...userSchema,
    ...bodySchema,
    ...exerciseSchema,
    ...workoutSchema
}

const connectionString = env.SUPABASE_URI;

const client = postgres(connectionString)
export const db = drizzle(client, { schema });
