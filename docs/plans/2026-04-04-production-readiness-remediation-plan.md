# Production Readiness Remediation Plan

> Drafted: 2026-04-04
> Status: Open
> Scope: Full pre-launch stabilization, security hardening, deployment readiness, and release validation

## Goal

Make Orbys360 production ready by clearing all hard launch blockers, hardening the highest-risk surfaces, and establishing repeatable release gates that must pass before launch.

## Current Assessment

The application is not production ready in its current state.

The highest-risk blockers are:

- build, lint, typecheck, and CI test failures
- production auth still wired to a Clerk dev tenant
- weak admin authentication and session handling
- unpatched dependency vulnerabilities
- insufficient E2E coverage for core business flows
- public write surfaces without abuse controls
- deployment and environment configuration drift

## Remediation Principles

1. Fix release blockers before feature work.
2. Move from implicit behavior to explicit environment and auth validation.
3. Eliminate risky public-side trust assumptions.
4. Make CI and preview verification trustworthy enough to block bad deploys.
5. Separate engineering work from user-owned setup and security decisions.

## Recommended Execution Order

### Phase 0: Release Freeze and Baseline

Objective:
Stop shipping new changes until the release gates are reliable again.

Tasks:

- Freeze non-critical feature work until P0 items are cleared.
- Create a dedicated production-readiness branch.
- Capture a clean baseline run of:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
  - `npm run test:ci`
  - `npm run test:e2e:smoke`
  - `npm audit --omit=dev`
- Mark all current failing checks as launch blockers.
- Ensure every fix in this plan adds or updates tests where practical.

Done when:

- the team is working against one prioritized remediation backlog
- no new launch-affecting work merges without passing updated gates

User actions:

- approve a short release freeze
- decide whether launch date moves if P0 work is not completed on time

---

## Workstream 1: Restore Build and Test Health

Priority: P0

Why this matters:

If lint, typecheck, build, or CI tests fail on a clean checkout, the repo is not shippable.

Primary repo areas:

- `package.json`
- `convex/gcc.ts`
- `src/app/provider/setup/_components/shared.tsx`
- `tests/components/reviews/ReviewsSection.test.tsx`
- `tests/components/reachout/ReachoutRequestButton.test.tsx`
- `tests/components/dashboard/AgentsTab.test.tsx`
- `tests/components/agent-detail/PublicMetadata.test.tsx`
- `tests/app/provider/setup.page.test.tsx`

Engineering tasks:

- Fix the current ESLint errors and make `npm run lint` pass.
- Fix the current TypeScript errors and make `npx tsc --noEmit` pass.
- Fix the current Next production build failure and make `npm run build` pass.
- Stabilize failing Vitest suites so `npm run test:ci` passes on a clean checkout.
- Review all currently failing tests and classify each failure:
  - true product bug
  - stale test after intended UI change
  - broken test harness or mocking
- Remove or refactor any test assumptions that are now inconsistent with the current UI copy or auth wrapper behavior.
- Ensure the provider setup flow tests reflect the current stepper and submit flow.
- Ensure Clerk-dependent component tests have a consistent mocking pattern or wrapper provider.
- Add one CI job or command locally that runs lint, typecheck, build, and test in the same order used before release.

Acceptance criteria:

- `npm run lint` passes
- `npx tsc --noEmit` passes
- `npm run build` passes
- `npm run test:ci` passes
- a clean install can reproduce the same green result

User actions:

- none required unless product behavior changed intentionally and the expected UX needs confirmation

---

## Workstream 2: Move Auth and Identity to Production-Safe Configuration

Priority: P0

Why this matters:

The current Convex auth configuration is tied to a Clerk dev tenant. That is not acceptable for a real production launch.

Primary repo areas:

- `convex/auth.config.ts`
- `middleware.ts`
- `src/auth/useUserRole.ts`
- `src/app/onboarding/page.tsx`
- `src/app/api/provider-org/sync/route.ts`
- `src/app/api/set-role/route.ts`
- claim and activation flows

Engineering tasks:

- Replace the hard-coded Clerk dev domain in `convex/auth.config.ts` with production-safe configuration.
- Decide whether auth config should be:
  - environment-specific at build/deploy time, or
  - generated from environment variables, if supported by the Convex setup being used
- Verify Clerk-issued tokens are accepted by the production Convex deployment.
- Audit all auth-sensitive routes and dashboards:
  - `/dashboard`
  - `/gcc-dashboard`
  - `/shortlist`
  - `/compare`
  - `/onboarding`
  - `/admin`
- Confirm middleware protection is correct for both page routes and API routes.
- Add explicit tests for:
  - unauthenticated access
  - wrong-role access
  - valid provider and GCC paths

Role-model hardening:

- Remove the generic "set any role you ask for" pattern in `/api/set-role`.
- Replace it with verified server-side transitions only.
- Provider role should be assigned only after a valid provider setup path is created or a real company membership exists.
- GCC role should be assigned only after GCC onboarding succeeds.
- Audit every place where `publicMetadata.role` is written and make sure the write is tied to validated business state.

Acceptance criteria:

- production Clerk app and production Convex deployment authenticate correctly
- role assignment is derived from server-validated state
- no public endpoint allows arbitrary role elevation by an authenticated user
- route protection is covered by tests

User actions:

- create or provide a production Clerk application
- create or provide a production Convex deployment
- provide the production Clerk domain, publishable key, and secret key
- confirm the final role model:
  - can one user be both GCC and provider?
  - can users switch roles after onboarding?
  - should role changes require manual review?

---

## Workstream 3: Redesign Admin Authentication and Authorization

Priority: P0

Why this matters:

The admin surface currently uses a password-only flow backed by a token stored in `sessionStorage`. That is too weak for a public production admin console.

Primary repo areas:

- `src/app/admin/page.tsx`
- `convex/admin.ts`
- `middleware.ts`
- admin tabs and admin actions

Engineering tasks:

- Decide on the target admin model. Recommended options:
  - Clerk-authenticated admin users plus allowlist and organization role checks
  - Clerk-authenticated admin users plus second factor enforcement
  - internal-only admin behind Vercel protection or IP allowlist plus Clerk auth
- Remove or heavily reduce reliance on password-only local admin auth.
- If any custom admin session remains:
  - move it to secure httpOnly cookies
  - add expiration, rotation, and logout invalidation
  - add CSRF protection where relevant
- Protect `/admin` at middleware level in addition to in-app checks.
- Add login rate limiting for admin auth attempts.
- Add audit logging for admin actions:
  - claim approval
  - company approval/rejection
  - agent approval/rejection
  - review moderation
  - team member changes if performed by admin
- Document how admin access is granted and revoked.

Acceptance criteria:

- admin is not reachable by anonymous users
- admin auth does not rely on browser-readable tokens alone
- admin actions are attributable to a real operator identity
- failed login attempts are rate-limited

User actions:

- decide who should be admins
- decide whether admin stays internet-exposed or internal-only
- decide whether MFA is mandatory
- provide the list of initial admin accounts or emails

Current status as of 2026-04-06:

- `/admin` is now protected by Clerk auth and server-side allowlist checks.
- Convex admin access currently supports:
  - `ADMIN_CLERK_EMAILS`
  - `ADMIN_CLERK_USER_IDS`
- The old password-hash-based admin flow has been removed from the active dev setup.
- A development admin account was created for testing:
  - email: `admin@orbys360.com`
- That development account was allowlisted on the current Convex dev deployment by both email and Clerk user ID.

Follow-up user actions before production:

- Create the real production Clerk admin account for `admin@orbys360.com`.
- Set a new password directly in Clerk. Do not store it in repo files or env vars.
- Enable MFA for the production admin account.
- Add `admin@orbys360.com` to the production Convex allowlist with `ADMIN_CLERK_EMAILS`.
- Optionally also add the production Clerk user ID to `ADMIN_CLERK_USER_IDS`.
- Verify the production admin can sign in through Clerk and load `/admin`.

---

## Workstream 4: Fix Output-Safety and Injection Risks

Priority: P0

Why this matters:

The app injects JSON-LD with `dangerouslySetInnerHTML` on pages that include provider-controlled content. That must be made safe before production.

Primary repo areas:

- `src/app/agents/[slug]/page.tsx`
- `src/app/companies/[slug]/page.tsx`
- `src/app/categories/[slug]/page.tsx`
- `src/app/directory/page.tsx`
- `src/lib/json-ld.ts`

Engineering tasks:

- Introduce a single helper for safe JSON script serialization.
- Escape at minimum:
  - `<`
  - `>`
  - `&`
  - Unicode line separator characters if needed
- Replace all inline `JSON.stringify(...)` uses inside script tags with the safe helper.
- Add tests that include malicious content like `</script>` inside fields such as:
  - company name
  - company description
  - agent tagline
  - review content if ever added to structured data
- Review the rest of the repo for other `dangerouslySetInnerHTML` usage and document why each remaining use is safe.

Acceptance criteria:

- structured data still renders correctly
- injected script-breaking payloads are neutralized
- tests prove the escaping behavior

User actions:

- none required

Current status as of 2026-04-06:

- A shared `serializeJsonLd(...)` helper now escapes script-breaking characters before JSON-LD is injected.
- Structured-data pages were updated to use the shared serializer instead of raw `JSON.stringify(...)`.
- Regression tests now cover `</script>` breakout payloads and Unicode separator escaping.

---

## Workstream 5: Patch Vulnerable Dependencies and Reduce Supply Chain Risk

Priority: P0

Why this matters:

Known critical and high vulnerabilities should not go live if patched versions are available.

Primary repo areas:

- `package.json`
- `package-lock.json`

Engineering tasks:

- Upgrade `next` to a patched release at or above the advisory-fixed version.
- Upgrade or replace `jspdf`.
- Ensure the transitive `dompurify` issue is removed after dependency changes.
- Upgrade Clerk packages if they pull the vulnerable backend range.
- Re-run `npm audit --omit=dev`.
- If a vulnerable dependency is unused in production code, remove it instead of carrying it.
- After upgrades, rerun:
  - lint
  - typecheck
  - build
  - test:ci
  - e2e smoke

Acceptance criteria:

- no critical vulnerabilities in production dependencies
- no unresolved high vulnerabilities without an explicit accepted risk and compensating control
- updated lockfile committed

User actions:

- approve dependency upgrade work if version changes carry UI or behavior risk
- confirm whether any temporarily accepted risk is allowed for launch

Current status as of 2026-04-06:

- `next` was upgraded to `16.2.2`.
- `jspdf` was upgraded to `4.2.1`.
- Clerk packages were upgraded to patched versions and now resolve `@clerk/backend@3.2.4`.
- Transitive vulnerable packages are pinned with overrides:
  - `dompurify@^3.3.3`
  - `rollup@^4.60.1`
- `npm audit --omit=dev --json` now reports zero production vulnerabilities.
- Post-upgrade verification passed:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run test:ci`
  - `npm run build`
  - `npm run test:e2e:smoke`

---

## Workstream 6: Return Correct 404s and Tighten SEO/Indexing Behavior

Priority: P1

Why this matters:

Invalid dynamic pages currently render plain content instead of proper `404`s. That harms SEO, caching correctness, and observability.

Primary repo areas:

- `src/app/companies/[slug]/page.tsx`
- `src/app/categories/[slug]/page.tsx`
- any similar dynamic pages

Engineering tasks:

- Replace plain "not found" renders with `notFound()`.
- Add tests for missing agent, company, and category slugs.
- Review sitemap generation for pages that should never be included.
- Verify `robots.ts`, metadata, and sitemap output after these changes.

Acceptance criteria:

- invalid slugs return real `404`s
- route behavior is covered by tests
- sitemap contains only intended pages

User actions:

- none required

Current status as of 2026-04-06:

- Company and category pages now use `notFound()` instead of returning placeholder `200` content for invalid slugs.
- Regression tests were added for missing company and category routes.
- Build, lint, and typecheck remain green after the route changes.

---

## Workstream 7: Harden Public Write Surfaces Against Abuse

Priority: P1

Why this matters:

Public and semi-public submission endpoints are attractive spam targets even if they look small.

Primary repo areas:

- `convex/earlyAccess.ts`
- `src/components/sections/InterestCapture.tsx`
- reachout and review submission flows

Engineering tasks:

- Normalize email input before storage:
  - trim
  - lowercase
- Add server-side rate limiting for:
  - early access signup
  - admin login
  - any anonymous or low-friction public submission
- Add bot protection to early access capture. Recommended:
  - Cloudflare Turnstile, or
  - another lightweight CAPTCHA with acceptable UX
- Consider adding a honeypot field for low-cost spam filtering.
- Review whether reachout and review flows need additional per-user throttling.
- Remove or replace the hard-coded "37 spots remaining" claim unless it is connected to real data.

Acceptance criteria:

- duplicate email behavior is deterministic
- bot and burst abuse is limited
- marketing copy does not make false live claims

User actions:

- choose the anti-bot provider
- provide keys for the chosen provider
- decide whether the "Founding 100" count is real and should be dynamic or should be replaced with non-numeric copy

---

## Workstream 8: Clean Up Deployment Configuration and Add Security Headers

Priority: P1

Why this matters:

Production deploy behavior should be explicit and minimal. Unclear or stale config is a release risk.

Primary repo areas:

- `vercel.json`
- `next.config.ts`
- Vercel project settings

Engineering tasks:

- Validate whether `vercel.json` is needed at all.
- If the current rewrite to `/index.html` is stale, remove it.
- Confirm the app behaves correctly on Vercel without SPA-style catch-all rewrites.
- Add security headers in Next config or Vercel config:
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `X-Frame-Options` or equivalent frame-ancestors CSP policy
  - `X-Content-Type-Options`
  - `Permissions-Policy`
  - `Strict-Transport-Security` if handled at the platform edge
- Tune CSP for actual dependencies:
  - Clerk
  - Convex
  - Sentry
  - Google Fonts
  - analytics endpoints if used
- Add `turbopack.root` or equivalent root configuration if the multi-lockfile warning persists.

Acceptance criteria:

- deploy config is intentional and documented
- no stale rewrite logic remains
- key browser security headers are present in production responses

User actions:

- confirm the production domain list that CSP must allow
- confirm whether Google Fonts will remain or should be self-hosted

Current status as of 2026-04-06:

- The stale `vercel.json` SPA rewrite to `/index.html` was removed.
- Baseline security headers were added in `next.config.ts`:
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Permissions-Policy`
  - production-only `Strict-Transport-Security`
- `turbopack.root` is now pinned to the workspace root, and the multi-lockfile root warning no longer appears during `npm run build`.
- Current CSP is intentionally broad enough for Clerk, Convex, Sentry, and existing remote assets, but it should still be tightened against the final production domain list before launch.

---

## Workstream 9: Add Environment Validation and Secret Hygiene

Priority: P1

Why this matters:

Production should fail fast on missing required config, and all secrets should be rotated if exposure is possible.

Primary repo areas:

- `.env.example`
- startup env validation module to be added
- `src/components/providers/ConvexClientProvider.tsx`
- Sentry, Supabase, Clerk, Convex, Resend configuration

Engineering tasks:

- Introduce a shared environment validation layer, preferably using Zod.
- Split envs by runtime where useful:
  - client-safe public vars
  - server-only vars
  - CI-only vars
- Expand `.env.example` to include every variable actually used by the app and build pipeline.
- Replace non-null assertions on critical envs with validated access.
- Improve error messages for missing required envs.
- Add deploy-time validation in CI or a prebuild script if appropriate.

Secret hygiene tasks:

- Rotate all live-looking secrets currently present in local env files if they were ever shared outside the machine or copied into any external system.
- Audit Git history and hosted configuration for accidental reuse of the same values.
- Re-seed Vercel, Convex, Clerk, Sentry, Supabase, and Resend with fresh credentials.

Acceptance criteria:

- required envs are validated before runtime-critical code executes
- `.env.example` is complete and accurate
- rotated secrets are deployed and old secrets are revoked

User actions:

- rotate:
  - Clerk keys
  - Convex deployment tokens if applicable
  - Resend API key
  - Sentry auth token if exposed anywhere
  - Supabase keys if exposure risk exists
- update production and preview env vars in all hosted platforms
- confirm the canonical production site URL and preview/staging URLs

---

## Workstream 10: Strengthen Release Verification and Make E2E Meaningful

Priority: P1

Why this matters:

Two smoke tests are useful, but they are not enough to trust launch readiness for a multi-role application.

Primary repo areas:

- `.github/workflows/ci.yml`
- `.github/workflows/e2e-preview.yml`
- `.github/workflows/nightly.yml`
- `e2e/`
- seed data and staging environment setup

Engineering tasks:

- Keep `ci.yml` as the required fast gate.
- Make preview smoke meaningful:
  - require a real preview or staging URL
  - stop silently skipping tests in normal release flow
  - remove `continue-on-error` once stable
- Expand Playwright coverage to the highest-risk journeys:
  - home and directory
  - sign-up and sign-in
  - GCC onboarding
  - provider onboarding
  - provider setup create-new flow
  - provider setup claim-existing flow
  - reachout request creation
  - review submission and edit
  - provider dashboard lead workflow
  - admin moderation smoke path if feasible in staging
- Keep full regression broader nightly if needed, but make a smaller reliable smoke suite required on PRs.
- Ensure staging or preview data is deterministic.

Acceptance criteria:

- preview smoke runs automatically on PRs and is not silently skipped in the normal path
- required smoke suite covers the top launch journeys
- test failures are actionable, not flaky noise

User actions:

- provide a stable preview or staging URL
- provide test accounts and credentials for:
  - one admin
  - one GCC user
  - one provider without a company
  - one provider with an active company
- approve or provision seed data for staging

---

## Workstream 11: Review Public Assets and Remove Internal QA Artifacts

Priority: P2

Why this matters:

Everything under `public/` is deployable and publicly reachable. Internal QA files should not be exposed accidentally.

Primary repo areas:

- `public/logo-audit.html`
- `public/logo-check.html`
- `public/logo-check-svg.html`
- `public/tools/*`

Engineering tasks:

- Review every HTML and downloadable asset under `public/`.
- Move internal-only QA files into a non-public directory or remove them.
- Keep only intentionally public marketing or downloadable assets.
- If tool downloads are part of the product, confirm naming, branding, and ownership.

Acceptance criteria:

- no internal QA utilities are reachable in production unless explicitly intended
- public downloads are documented and approved

User actions:

- decide which files under `public/tools` should remain publicly downloadable
- confirm whether the logo audit pages should be removed

---

## Workstream 12: Observability, Alerts, and Operational Readiness

Priority: P2 before launch, then ongoing

Why this matters:

Shipping is only half the problem. The team needs to detect and triage failures quickly after launch.

Primary repo areas:

- `src/instrumentation.ts`
- `src/instrumentation-client.ts`
- `src/sentry.server.config.ts`
- `src/sentry.edge.config.ts`
- `src/app/global-error.tsx`
- Sentry and Vercel project settings

Engineering tasks:

- Verify Sentry is enabled in preview and production.
- Confirm release, environment, and source maps are present.
- Add alert rules for:
  - new issues in production
  - error spikes
  - high-volume admin failures
- Confirm runtime logs are available and retained on the hosting side.
- Add a lightweight production incident runbook to `docs/`.

Acceptance criteria:

- Sentry events include environment and release tags
- alerts are configured for production regressions
- incident owners know where to check first

User actions:

- provide Sentry org, project, DSN, and auth token
- decide who receives production alerts

---

## User-Owned Checklist

These items require your decisions, credentials, approvals, or hosted setup.

### Security and Identity

- Create or confirm the production Clerk application.
- Create or confirm the production Convex deployment.
- Decide the final role model for GCC and provider accounts.
- Decide the admin access model:
  - internal-only or public
  - MFA required or not
  - which accounts are admins
- Create the production admin Clerk account:
  - recommended email: `admin@orbys360.com`
  - reset the password directly in Clerk before launch
  - enable MFA
- Set production Convex env vars for admin access:
  - `ADMIN_CLERK_EMAILS=admin@orbys360.com`
  - optionally `ADMIN_CLERK_USER_IDS=<production clerk user id>`

### Secrets and Hosted Configuration

- Rotate all exposed-looking local secrets if they may have left your machine.
- Re-enter fresh secrets into:
  - Vercel
  - Convex
  - Clerk
  - Sentry
  - Supabase
  - Resend
- Confirm production values for:
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_BASE_URL` if used
  - Clerk keys
  - Convex URL
  - Supabase URL and anon key
  - Resend API key

### Release and Testing Inputs

- Provide or approve a stable staging or preview environment URL.
- Provide seed accounts for GCC, provider, and admin workflows.
- Approve making preview smoke tests required before merge.

### Product and Policy Decisions

- Decide whether the Founding 100 count is real and dynamic or should be removed.
- Decide which public downloads and QA assets remain in `public/`.
- Approve dependency upgrades that may slightly affect UI or runtime behavior.

---

## Definition of Done for Production Readiness

The application is launch-ready only when all of the following are true:

- lint passes
- typecheck passes
- production build passes
- required CI suite passes
- required preview smoke suite passes
- production auth is wired to production identity infrastructure
- admin authentication is hardened and documented
- dependency audit contains no unresolved critical issues
- JSON-LD and other raw output paths are safe
- invalid dynamic pages return real `404`s
- public write surfaces have abuse controls
- env validation is in place and secrets are rotated
- deploy configuration is intentional and secure
- monitoring and alerts are active

---

## Suggested Implementation Sequence

1. Workstream 1: build and test health
2. Workstream 2: production auth and role model
3. Workstream 3: admin auth redesign
4. Workstream 4: output safety
5. Workstream 5: dependency patching
6. Workstream 6: 404 and SEO correctness
7. Workstream 7: abuse protection
8. Workstream 8: deploy config and security headers
9. Workstream 9: env validation and secret rotation
10. Workstream 10: release verification and required E2E
11. Workstream 11: public asset cleanup
12. Workstream 12: observability and incident readiness

## Recommended Immediate Next Step

Start with Workstream 1 and Workstream 2 in parallel, but do not launch until Workstreams 1 through 5 are complete and verified.
