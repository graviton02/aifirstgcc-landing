# Testing Strategy

## First Principles

Test the cheapest layer that can prove the behavior.

- Use unit tests for pure logic and normalization.
- Use component tests for UI state, rendering, and interactions.
- Use Convex integration tests when the behavior spans tables, auth, and workflow transitions.
- Use API route tests when request parsing, auth, and server orchestration matter.
- Use Playwright only for real browser confidence across routing, deployment, and integration boundaries.

This keeps pull requests fast while still protecting the workflows that matter most.

## Commands

- `npm run test:unit`
  Runs pure logic and hook tests.
- `npm run test:component`
  Runs React component and app-surface tests.
- `npm run test:api`
  Runs Next route-handler tests in a Node environment.
- `npm run test:convex`
  Runs Convex workflow and auth-sensitive integration tests with `convex-test`.
- `npm run test:e2e`
  Runs the Playwright browser suite.
- `npm run test:e2e:smoke`
  Runs the preview-safe Playwright smoke tests tagged with `@smoke`.
- `npm run test:coverage`
  Runs the Vitest suite with V8 coverage output in [coverage/](/Users/graviton02/Development/Orbys360%20Landing%20Page/Orbys360-dev/coverage).
- `npm run test:ci`
  Runs the fast PR-blocking suite with coverage.

## Suite Layout

- `tests/lib`
  Pure utilities, normalization, validation, and helper logic.
- `tests/hooks`
  Hook behavior and client-side state transitions.
- `tests/components`
  React components and UI workflows.
- `tests/app`
  App-level page and flow tests.
- `tests/api`
  Route handlers and server request/response behavior.
- `tests/convex`
  Convex mutations, queries, and workflow integration tests.
- `e2e`
  Browser-level Playwright tests.

## GitHub Actions

### `ci.yml`

Runs on pull requests and pushes to `main`.

- installs dependencies with Node 22
- runs `lint`
- runs `build`
- runs `test:ci`
- uploads the Vitest coverage artifact

This is the blocking workflow. Keep it fast.

### `e2e-preview.yml`

Runs on pull requests and manually.

- expects a repository variable named `PLAYWRIGHT_BASE_URL`
- waits for that preview or staging URL to respond
- runs Playwright smoke tests
- uploads traces, screenshots, videos, and the HTML report

This starts as non-blocking so flaky browser issues do not stop shipping while the suite matures.

### `nightly.yml`

Runs on a schedule and manually.

- uses the same `PLAYWRIGHT_BASE_URL`
- runs the full Playwright suite
- uploads the Playwright artifacts for debugging

Use this to grow broader regression coverage without slowing down every PR.

## Environment and Data

Keep browser tests on a dedicated preview or staging environment with stable seed data.

Recommended fixtures:

- one provider without a company
- one provider with an approved company and a pending agent
- one admin account
- one GCC user with shortlist and provider-request history

Recommended repository configuration:

- Repository variable: `PLAYWRIGHT_BASE_URL`
- Optional repository variables for build parity:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`

Add secrets only when a workflow truly needs them.

## Rollout Strategy

1. Keep `ci.yml` as the required gate.
2. Let preview E2E report signal before making it required.
3. Expand Convex and API coverage around approval, claim, shortlist, and contact workflows.
4. Grow Playwright coverage only after preview data and auth fixtures are stable.
