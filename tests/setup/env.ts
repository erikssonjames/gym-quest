export const testEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    "postgres://gym_quest_test:gym_quest_test@localhost:55433/gym_quest_test",
  DATABASE_SSL: "false",
  AUTH_SECRET: "test-auth-secret",
  AUTH_DISCORD_ID: "test-discord-id",
  AUTH_DISCORD_SECRET: "test-discord-secret",
  AUTH_EMAIL_SECRET: "test-email-secret",
  RESEND_API_KEY: "test-resend-key",
  EMAIL_DELIVERY_MODE: "console",
  EMAIL_FROM: "Gym Quest Tests <tests@example.com>",
  SERVER_SOCKET_KEY: "test-socket-secret",
  HOST_URL: "http://127.0.0.1:3000",
  GEMINI_API_KEY: "test-gemini-key",
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
  STRIPE_BILLING_CURRENCY: "sek",
  STRIPE_PRO_MONTHLY_AMOUNT: "9900",
  STRIPE_PRO_ANNUAL_AMOUNT: "99900",
  STRIPE_TAX_ENABLED: "false",
} as const

Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: testEnvironment.DATABASE_URL,
  DATABASE_SSL: "false",
})

for (const [name, value] of Object.entries(testEnvironment)) {
  process.env[name] ??= value
}
