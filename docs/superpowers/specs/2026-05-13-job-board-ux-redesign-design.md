# Job Board UX Redesign — Design Spec

> **Date:** 2026-05-13
> **Status:** Approved
> **Scope:** Fix auth/role friction and info-collection duplication in the existing job board (built per `2026-04-09-job-board-design.md`).

## Problem

The current job board has three concrete UX issues:

1. **The navbar "Join Now" CTA is context-blind.** On `/jobs`, it routes to generic `/sign-up`, which after `/auth-redirect/` sends the user to marketplace `/onboarding` — not the job board. The button promises "join what I'm looking at" and delivers "join the marketplace."
2. **`/jobs/onboarding` forces a role pick** even when the user's prior click (Apply Now / Post a Job) already implied the role.
3. **Application form duplicates profile data.** `current_title` is collected at onboarding AND on every application; per-application context (phone, years of experience, LinkedIn, resume) cannot be reused across applications.

A fourth issue surfaced during design: the "one role per Clerk account" rule from the original spec means GCC buyers and providers hit a wall when they try to use the job board — they'd need a second account.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Marketplace ↔ job-board role coupling | Independent. A Clerk user can have ONE marketplace role (`gcc`/`provider`) AND ONE job-board role (`jobseeker`/`recruiter`) simultaneously. | Removes the "wall" for GCC users wanting to apply to AI jobs without losing their marketplace access. The two role systems are already structurally separate in the codebase — this decision is mostly about removing implicit "one role" assumptions in UX and routing. |
| Within job board | Exclusive: `jobseeker` XOR `recruiter` per Clerk user. | Already enforced by `jobProfiles.by_clerkUserId` index. No data migration needed. |
| Navbar "Join Now" on `/jobs/*` | Hide. Replace with a quiet "Sign in" link for signed-out users. | The hero handles role-specific entry; the navbar should not over-promise. |
| Hero CTA copy | Primary: **Find Your Next AI Role**. Secondary: **Hire AI Talent**. No microcopy. | Outcome-led labels, parallel structure, plain language. |
| Hero CTA states | `jobBoardRole = null` → both CTAs. `jobseeker` → "My Applications" only. `recruiter` → "Post a Job" only. | Contextual to the user's current job-board identity. |
| CTA routing | Signed-out: `/sign-up?redirect_url=/jobs/onboarding?role=X`. Signed-in: `/jobs/onboarding?role=X` directly. | One code path. Role intent travels through Clerk to onboarding. |
| `/jobs/onboarding` | Skip role picker when `?role=` is present. Render only the 1 role-specific field. | Removes the redundant pick step. |
| Profile fields (jobseeker) | name (Clerk), email (Clerk), `current_title` (required). | Bare minimum. Per-application context lives on applications, not profile. |
| Profile fields (recruiter) | name (Clerk), email (Clerk), `company_name` (required). | Same minimum-profile principle. |
| Application form | Drop `current_title` field (lives on profile). Add `linkedin_url` as **required**. | Eliminates duplication, gives recruiters a second verifiable channel. |
| Resume requirement | PDF, ≤5 MB, required — unchanged. | Status quo; LinkedIn URL is the added signal, not a replacement. |
| `Navbar.dashboardPath` | Pathname-first: on `/jobs/*` with a job-board role → `/jobs/dashboard`. Otherwise existing marketplace logic. | Routes users to the dashboard relevant to where they are. |
| `/auth-redirect` | Honor `redirect_url` query param when present. Fall back to existing marketplace logic. | Sign-ups from `/jobs` land at `/jobs/onboarding`, not marketplace onboarding. |

## Data Model Changes

### `jobProfiles`

No structural changes. Existing schema stays.

### Marketplace role

No schema change. The marketplace role union is already `"gcc" | "provider" | null` (see `src/auth/roles.ts:USER_ROLES`) and is derived in `convex/viewer.ts:getContext` from `hasGccProfile` / `hasProviderAccess` flags — it is not stored as a column. No cleanup needed.

### `jobApplications`

| Field | Change |
|---|---|
| `current_title` | **Removed** from input schema. Profile is the source of truth. |
| `linkedin_url` | **Now required** (was optional). Server-side regex check: must start with `https://www.linkedin.com/in/` or `https://linkedin.com/in/`. |

Existing applications keep their `current_title` value (column not dropped); the field is just no longer accepted on `create`.

## Hero CTA Matrix

Keyed off `jobBoardRole` only — signed-out users have `null`, same as marketplace-only users.

| `jobBoardRole` | Hero CTAs | Each CTA routes to |
|---|---|---|
| `null` | "Find Your Next AI Role" + "Hire AI Talent" | If signed-out: `/sign-up?redirect_url=/jobs/onboarding?role=X`. If signed-in: `/jobs/onboarding?role=X`. |
| `jobseeker` | "My Applications" | `/jobs/dashboard` |
| `recruiter` | "Post a Job" | `/jobs/post` |

## Routes Touched

| Route | Change |
|---|---|
| `/jobs` (`JobHero.tsx`) | New CTA matrix. Removes existing "Post a Job" button (replaced by state-aware CTAs). Search bar + category pills unchanged. |
| `/sign-up` (Clerk page) | Pass through `redirect_url` query param via Clerk's `afterSignUpUrl`. |
| `/auth-redirect/page.tsx` | Honor `redirect_url` param before falling through to marketplace routing. |
| `/jobs/onboarding/page.tsx` | Read `?role=` from URL; skip role picker if present; render only required role-specific field. Redirect to dashboard if profile exists. |
| `/jobs/[slug]/apply/page.tsx` | If signed-in but `jobBoardRole !== 'jobseeker'`, render friendly "this account is a recruiter" block instead of form. |
| `/jobs/post/page.tsx` | Same pattern: if `jobBoardRole !== 'recruiter'`, render friendly block. |
| `src/components/shared/Navbar.tsx` | Hide "Join Now" on `/jobs/*`; show "Sign in" link for signed-out users. Pathname-first `dashboardPath` logic. |
| `src/components/jobs/JobApplicationForm.tsx` | Drop `current_title` field. Add required `linkedin_url` field with client-side regex validation. Show "Applying as: [name] · [current_title]" header pulled from profile. |
| `convex/jobApplications.ts` (`create`) | Remove `current_title` from args; add required `linkedin_url` with regex validation. |

## User Flows

### Jobseeker — first-time, signed out

1. Lands on `/jobs`. Hero shows two CTAs.
2. Clicks **Find Your Next AI Role**.
3. Routed to `/sign-up?redirect_url=/jobs/onboarding?role=jobseeker`.
4. Completes Clerk sign-up.
5. `/auth-redirect` sees `redirect_url`, honors it.
6. Lands on `/jobs/onboarding` with `?role=jobseeker`. No picker shown.
7. Form: name (prefilled, editable) + current_title (required). Submits.
8. `/jobs/dashboard` — empty applications list.
9. Returns to `/jobs`, hero now shows **My Applications** only. Clicks a listing.
10. On detail page, clicks **Apply Now** → `/jobs/[slug]/apply`.
11. Fills phone, years_of_experience, resume PDF, **LinkedIn URL** (required), optional cover note + current_company. Submits.
12. `/jobs/dashboard` shows the new application.

### Recruiter — first-time, signed out

Mirror of jobseeker flow, with **Hire AI Talent** → `?role=recruiter` → onboarding asks `company_name` instead of `current_title`. After onboarding, hero shows **Post a Job** only. Job submission, admin moderation, dashboard with applicants — all unchanged from the existing spec.

### GCC buyer who wants to apply

1. Already signed in. Lands on `/jobs`. Hero shows both CTAs (because `jobBoardRole` is `null`).
2. Clicks **Find Your Next AI Role**.
3. Routed directly to `/jobs/onboarding?role=jobseeker` (no Clerk re-auth).
4. Fills `current_title`. Submits → `jobProfiles` row created.
5. GCC identity untouched. Navbar `Dashboard` button now context-aware: on `/jobs/*` routes to `/jobs/dashboard`, elsewhere to `/gcc-dashboard`.

### Direct URL to `/jobs/onboarding` (no role param)

Fallback: render the original role picker. Rare edge case (bookmarks, manually-typed URL).

### Wrong-role-for-action

- Jobseeker visits `/jobs/post` → friendly block: "This account is registered as a jobseeker. To post jobs, you'll need to use a different account." No role-switching option.
- Recruiter clicks "Apply Now" on a listing → same pattern at `/jobs/[slug]/apply`.

## Error Handling

| Case | Behavior |
|---|---|
| LinkedIn URL fails regex on submit | Inline error under field; form values preserved; no submit. |
| Resume upload fails (network, oversize, non-PDF) | Inline error; form values preserved. |
| User has existing `jobProfiles` row but lands on `/jobs/onboarding?role=X` | Skip the form; redirect to `/jobs/dashboard` (or `returnUrl`). |
| Application submitted with `current_title` in body | Convex validator rejects; client-side form doesn't send the field anyway. |

## Testing

### Unit / component (Vitest + RTL)
- `JobHero` — renders correct CTAs for each `jobBoardRole` state (4 cases). Click handlers produce the right URLs (signed-in vs signed-out).
- `Navbar` — on `/jobs/*`, "Join Now" hidden + "Sign in" shown for signed-out users. `dashboardPath` returns correct values across `(pathname × marketplaceRole × jobBoardRole)` combinations.
- `JobOnboarding` — with `?role=jobseeker`, role picker is not rendered; only `current_title` field visible. Without `?role=` and no profile, picker visible. With existing profile, component redirects.
- `JobApplicationForm` — LinkedIn field present + required; invalid URL surfaces inline error; `current_title` field is gone from DOM; "Applying as" header pulls from profile.

### Convex tests
- `jobApplications.create` — rejects missing/invalid `linkedin_url`; rejects extraneous `current_title`; existing PDF + duplicate checks still pass.
- `jobProfiles.createProfile` — accepts pre-set role; cannot create a second profile for the same Clerk user.

### Page-level / integration
- `tests/app/job-board-auth.pages.test.tsx` — extend with new flows: signed-out CTA → `/sign-up?redirect_url=...`; signed-in marketplace user CTA → `/jobs/onboarding?role=...`.
- New: `tests/auth/auth-redirect.test.tsx` — `redirect_url` is honored when present; falls back to marketplace routing otherwise.

### Manual QA (dogfood pass)
- Walk through every row of the CTA matrix end-to-end in the running app.
- Verify a GCC user can layer on a jobseeker role without losing GCC access.
- Verify a jobseeker cannot reach `/jobs/post` (and a recruiter cannot apply).
- Verify "Sign in" link on `/jobs` navbar works for signed-out users.

## Out of Scope (Deferred)

- Recruiter-side dashboard UX changes (the existing dashboard stays as-is).
- Email/push notifications for state changes.
- External `apply_url` UX — kept as-is for now.
- Allowing a Clerk user to switch their job-board role (e.g., jobseeker becoming recruiter on the same account).
- Profile editing UI beyond what's collected at onboarding.
- Search/filters changes on `/jobs`.
- Schema markup / SEO for `/jobs`.
