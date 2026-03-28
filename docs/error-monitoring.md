# Error Monitoring

## Purpose

This project now separates three concerns:

- error handling: what the user sees
- error reporting: what developers receive
- incident response: how the team resolves a failure once it is visible

The goal is to give users a clean message for expected failures while still capturing unexpected bugs with enough context to debug production issues.

## Current Stack

### Next.js

- `@sentry/nextjs` is the primary monitoring layer.
- `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/sentry.server.config.ts`, and `src/sentry.edge.config.ts` initialize Sentry across browser, server, and edge runtimes.
- `src/app/global-error.tsx` captures uncaught App Router render failures.
- Segment boundaries such as `src/app/agents/[slug]/error.tsx` and `src/app/directory/error.tsx` capture route-level render failures and still let the user retry.

### Shared Error Extraction

- `src/lib/report-error.ts` normalizes thrown values before sending them to Sentry.
- It understands Convex application errors that carry `error.data.message` and `error.data.status`.
- It strips noisy `Uncaught Error:` prefixes so user-facing messages stay readable.

### API Routes

- Route handlers report unexpected server failures through `reportError(...)`.
- Known business failures use `getErrorMessage(...)` and `getErrorStatus(...)` so the route can return the intended status code instead of collapsing into a generic `500`.

### Convex

- Expected business-rule failures now use `appError(...)` from `convex/lib/errors.ts`.
- `appError(...)` throws a `ConvexError` with a structured payload:
  - `code`
  - `message`
  - `status`
- This lets the UI and route handlers distinguish expected failures from real bugs.

## How Errors Flow

### 1. Browser render failure

1. A React tree throws during render.
2. Next.js routes the failure into a segment `error.tsx` or `global-error.tsx`.
3. The user sees a fallback UI and can retry.
4. Sentry receives the exception with release, environment, stack trace, and tags.

### 2. Client action failure

1. A button click, form submit, or fetch call fails inside a `try/catch`.
2. The UI shows a friendly message using `getErrorMessage(...)`.
3. If the failure is unexpected, `reportHandledError(...)` sends it to Sentry with tags such as feature name and route.

### 3. API route failure

1. A route handler calls Clerk, Convex, or another service.
2. Expected failures return their known status and message.
3. Unexpected failures are reported with `reportError(...)`.
4. The API responds with a safe generic message for `5xx` cases.

### 4. Convex failure

1. Business logic hits a validation or authorization rule.
2. The function throws `appError(code, message, status)`.
3. The caller reads `error.data.message` and `error.data.status`.
4. The UI returns a useful message without leaking internal server details.

If Convex throws a plain `Error`, treat that as a real bug or server-side fault, not a normal user mistake.

## Expected vs Unexpected Errors

### Expected

These are normal outcomes and should usually not alert the team:

- invalid form input
- duplicate team invite
- expired claim link
- unauthorized access to another company
- trying to remove the company owner

These should return a clean `4xx` response and a readable message.

### Unexpected

These should be captured and investigated:

- null or undefined access
- broken deploy or bad release
- missing environment variables
- Clerk or Convex outages
- code paths that throw plain `Error` in normal business flows

These should usually return a generic `5xx` message to the user and a full report to Sentry.

## Environment Setup

Configure these in Vercel:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

Recommended:

- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
- `SENTRY_ENVIRONMENT`
- `SENTRY_RELEASE`

Notes:

- `NEXT_PUBLIC_SENTRY_DSN` is safe in the browser.
- `SENTRY_AUTH_TOKEN` is secret and used for source map upload during builds.
- Source maps matter because they turn minified production stack traces back into real TypeScript locations.

## Verification Checklist

After configuring env vars, verify in a preview deployment:

1. Trigger a route-level render error and confirm it appears in Sentry with readable frames.
2. Trigger an expected Convex business failure and confirm the UI shows the exact intended message.
3. Trigger an unexpected API failure and confirm the user gets a generic error while Sentry receives the real exception.
4. Confirm release and environment tags are present in Sentry.
5. Cross-check Vercel runtime logs for the same failure if deeper request context is needed.

## Resolution Workflow

When a production issue appears:

1. Open the Sentry issue and identify the route, environment, and release.
2. Decide whether it is expected behavior, a regression, or an infrastructure problem.
3. Reproduce locally or in preview with the same inputs if possible.
4. Fix the root cause.
5. Add or update a test at the cheapest layer that proves the behavior.
6. Redeploy and verify the issue stops occurring.

## Rules For Future Work

- Use `appError(...)` for expected business-rule failures in Convex.
- Use plain `Error` only for true server or programmer faults.
- In route handlers, only call `reportError(...)` for unexpected failures.
- In client code, prefer `getErrorMessage(...)` when showing any thrown error to the user.
- When a new workflow spans UI, route handler, and Convex, keep the status code and displayed message consistent across all three layers.

## Suggested Next Improvements

- Enable Convex exception reporting into the same Sentry project if the deployment plan supports it.
- Add alert rules for new production issues and error spikes.
- Add release health and performance tracing only after error volume is stable and useful.
