import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_SSL: z.enum(["false", "true", "require"]).default("false"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    AUTH_EMAIL_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    EMAIL_DELIVERY_MODE: z.enum(["console", "resend"]),
    EMAIL_FROM: z.string().min(1),
    SERVER_SOCKET_KEY: z.string(),
    HOST_URL: z.string().url(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
    GEMINI_ADVANCED_MODEL: z.string().optional(),
    GEMINI_BASE_URL: z.string().url().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    STRIPE_PRO_ANNUAL_PRICE_ID: z.string().optional(),
    STRIPE_BILLING_CURRENCY: z.string().length(3).default("sek"),
    STRIPE_PRO_MONTHLY_AMOUNT: z.coerce.number().int().positive().default(9900),
    STRIPE_PRO_ANNUAL_AMOUNT: z.coerce.number().int().positive().default(99900),
    STRIPE_TAX_ENABLED: z.enum(["false", "true"]).default("false"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_SSL: process.env.DATABASE_SSL,
    NODE_ENV: process.env.NODE_ENV,
    HOST_URL: process.env.HOST_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    AUTH_EMAIL_SECRET: process.env.AUTH_EMAIL_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SERVER_SOCKET_KEY: process.env.SERVER_SOCKET_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_ADVANCED_MODEL: process.env.GEMINI_ADVANCED_MODEL,
    GEMINI_BASE_URL: process.env.GEMINI_BASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_PRODUCT_ID: process.env.STRIPE_PRO_PRODUCT_ID,
    STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    STRIPE_BILLING_CURRENCY: process.env.STRIPE_BILLING_CURRENCY,
    STRIPE_PRO_MONTHLY_AMOUNT: process.env.STRIPE_PRO_MONTHLY_AMOUNT,
    STRIPE_PRO_ANNUAL_AMOUNT: process.env.STRIPE_PRO_ANNUAL_AMOUNT,
    STRIPE_TAX_ENABLED: process.env.STRIPE_TAX_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
