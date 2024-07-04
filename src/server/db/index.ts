import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

// Schemas
import * as userSchema from "./schema/user";
import * as postsSchema from "./schema/posts";

// Combined Schema
const schema = {
    ...userSchema,
    ...postsSchema
}

const connectionString = env.SUPABASE_URI;

const client = postgres(connectionString)
export const db = drizzle(client, { schema });
