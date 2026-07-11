import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  out: './drizzle',
  schema: "./src/server/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === "require" ? "require" : env.DATABASE_SSL === "true",
  }
} satisfies Config;
