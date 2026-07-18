# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Local database

Gym Quest includes an isolated PostgreSQL 16 service in `compose.yaml`. It
binds to host port `55432`, so it can run alongside projects using the
standard PostgreSQL port.

1. Copy `.env.example` to `.env` and fill in the non-database secrets.
2. Start PostgreSQL, apply migrations, and load development data:

```bash
npm run db:setup
```

3. Start the application:

```bash
npm run dev
```

Local signup uses `EMAIL_DELIVERY_MODE="console"`. Verification codes are
printed in the development server terminal instead of being sent externally.
Set the mode to `resend` and configure `EMAIL_FROM` with an address on a
verified Resend domain when testing real delivery or deploying.

Useful database commands:

```bash
npm run db:up       # Start this project's PostgreSQL service
npm run db:down     # Stop it without deleting its data
npm run db:migrate  # Apply pending Drizzle migrations
npm run db:seed     # Idempotently load default development data
npm run db:catalog  # Import only the public exercise and muscle catalog
npm run db:logs     # Follow PostgreSQL logs
```

To update a hosted catalog without touching seeded users, badges, or workouts,
run the production command in the hosted environment where `DATABASE_URL` and
`DATABASE_SSL` are already injected. `PRODUCTION_DATABASE_URL` and
`PRODUCTION_DATABASE_SSL` can be supplied as explicit overrides when running
the import from a separate administration environment.

```bash
npm run db:catalog:production
```

The production command refuses local database URLs, stops on conflicting
global names, preserves user-owned records, and verifies catalog counts inside
the transaction before committing.

The default connection is:

```env
DATABASE_URL="postgres://gym_quest:gym_quest_dev@localhost:55432/gym_quest"
DATABASE_SSL="false"
```

Set `GYM_QUEST_DB_PORT` before running Compose to use another host port.
Hosted PostgreSQL connections can still replace `DATABASE_URL` and set
`DATABASE_SSL` to `true` or `require`.

## AI and subscriptions

The workout planner calls Gemini only from the backend. Keep `GEMINI_API_KEY`
server-only and never expose it through a `NEXT_PUBLIC_` variable. The default
free model is `gemini-2.5-flash-lite`; Pro uses `GEMINI_ADVANCED_MODEL` and a
larger monthly allowance.

To enable subscriptions:

1. Create a Stripe Pro product with monthly and annual recurring prices.
2. Put the product and price IDs in the Stripe variables in `.env` and set
   the matching currency and amounts in minor units.
3. Configure a Stripe webhook at `/api/stripe/webhook` for checkout completion,
   subscription lifecycle, and invoice paid/failed events.
4. Apply the billing migration with `npm run db:migrate`.

The app stores subscription state, idempotent webhook events, AI token usage,
estimated Gemini cost, and an owner revenue ledger in PostgreSQL. Stripe is the
payment source of truth; the ledger is the reconciliation layer for tax, fees,
refunds, and future payout reporting.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
