# Testing Gym Quest

Gym Quest uses three complementary test layers:

- Vitest in Node for domain logic, security rules, and backend services.
- Vitest with jsdom and Testing Library for interactive client components.
- Vitest against an isolated PostgreSQL database for persistence and tRPC integration.
- Playwright against the complete application for App Router, authentication, and accessibility flows.

Tests require Node.js 20 or newer. Node.js 22 is used in CI.

## Fast tests

Run the unit and component suites without Docker or an application server:

```bash
npm test
```

Use watch mode while developing:

```bash
npm run test:watch
```

Generate the HTML, text, and LCOV coverage reports:

```bash
npm run test:coverage
```

The HTML report is written to `coverage/index.html`. Coverage intentionally focuses on domain, AI, and service code instead of using UI markup to inflate a global percentage.

## PostgreSQL integration tests

Integration tests never use the database configured in `.env`. They use `TEST_DATABASE_URL`, which defaults to the disposable PostgreSQL service in `compose.test.yaml`.

```bash
npm run db:test:up
npm run test:integration
npm run db:test:down
```

The integration setup drops and recreates the `public` schema before applying every Drizzle migration. Its connection is hard-coded to the test service unless `TEST_DATABASE_URL` is explicitly supplied. Never point `TEST_DATABASE_URL` at a development, staging, or production database.

Database integration files belong in `tests/integration`. Keep them serial unless each worker receives its own database. Use factories from `tests/factories` and truncate between tests so order does not matter.

## Browser tests

Install the Chromium test browser once:

```bash
npx playwright install chromium
```

Then run:

```bash
npm run db:test:up
npm run test:e2e
npm run db:test:down
```

Playwright starts the custom application server on port `4100`, resets the isolated test database, applies migrations, and creates deterministic user and admin fixtures. It does not load `.env` or use the development database. Authentication state is written to `playwright/.auth`, which is ignored by Git.

For interactive debugging, use:

```bash
npm run test:e2e:ui
```

Failure artifacts are written to `test-results`, and the HTML report is written to `playwright-report`.

## Naming and placement

- `*.test.ts`: Node unit tests colocated with their source.
- `*.component.test.tsx`: jsdom component tests colocated with their source.
- `tests/integration/*.test.ts`: PostgreSQL-backed tests.
- `tests/e2e/*.spec.ts`: browser journeys.
- `tests/e2e/*.setup.ts`: Playwright authentication or environment setup.

Component tests should query elements by accessible role, name, or label and interact through `userEvent`. Avoid asserting Tailwind classes, component internals, or Radix/shadcn implementation details. Async Server Components belong in Playwright rather than jsdom.

## Test doubles

The shared MSW server is configured in `tests/support/mock-server.ts`. Unit and component tests fail on unhandled network requests. Add request handlers inside the test that owns the external interaction and reset them automatically after each test.

Prefer small injected adapters for SDK-style services such as Stripe, Resend, Cloudinary, clocks, IDs, and socket emission. Use MSW for HTTP services such as Gemini. No test should contact a real third-party service.

## Before opening a pull request

Run the layers affected by the change:

```bash
npm run typecheck
npm test
```

For persistence changes, also run the integration suite. For pages, authentication, navigation, or Server Component changes, also run Playwright. CI runs all layers independently and uploads coverage and browser diagnostics.
