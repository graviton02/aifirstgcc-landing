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
| Within job board | Exclusive: `jobseeker` XOR `recruiter` per Clerk user. | Enforced by the `jobProfiles.createProfile` mutation, which rejects a second profile per Clerk user. The `by_clerkUserId` index supports the lookup but is not itself a uniqueness constraint. |
| Navbar "Join Now" on `/jobs/*` | Hide. Replace with a quiet "Sign in" link for signed-out users, with `redirect_url` set to the current pathname so the user returns to the same page after auth. | The hero handles role-specific entry; the navbar only needs to serve returning users. |
| Hero CTA copy | Primary: **Find Your Next AI Role**. Secondary: **Hire AI Talent**. No microcopy. | Outcome-led labels, parallel structure, plain language. |
| Hero CTA states | `jobBoardRole = null` → both CTAs. `jobseeker` → "My Applications" only. `recruiter` → "Post a Job" only. | Contextual to the user's current job-board identity. |
| CTA routing | Signed-out: `/sign-up?redirect_url=<encoded /jobs/onboarding?role=X>`. Signed-in: `/jobs/onboarding?role=X` directly. URLs are built with `URLSearchParams` (or `encodeURIComponent` for nested URLs). | One code path. Role intent travels through Clerk to onboarding. |
| Action-page redirects (e.g. `/jobs/post`, `/jobs/[slug]/apply`) | When a signed-in null-role user reaches the page, redirect to `/jobs/onboarding?role=X&returnUrl=...` with role intent. JobDetail's "Apply Now" branches for signed-out and no-role users carry the same role intent through sign-in. | Closes the loophole where users entering via non-hero paths (deep links, the JobDetail "Apply Now" button) still hit the role picker. |
| `/jobs/onboarding` | Skip role picker when `?role=` is present and valid. Invalid `?role=` (e.g. `?role=bogus`) falls back to the picker. Render only the 1 role-specific field. | Removes the redundant pick step while keeping the picker as a safety net. |
| Profile fields (jobseeker) | name (Clerk), email (Clerk), `current_title` (required). | Bare minimum. Profile editing is out of scope, so this is captured once at onboarding. |
| Profile fields (recruiter) | name (Clerk), email (Clerk), `company_name` (required). | Same minimum-profile principle. |
| Application form | Pre-fill `name`, `email`, `current_title` from profile (shown as "Applying as" header for name/title; `current_title` remains editable per application as a snapshot). Keep phone, current_company, years_of_experience as today. Add `linkedin_url` as **required**. | The reusable deduplication win is the "Applying as" header (name/email never re-asked). `current_title` stays on the application form because profile editing is out of scope — keeping it editable lets users update per application without stale profile data. |
| Resume requirement | PDF, ≤5 MB, required — unchanged. | Status quo; LinkedIn URL is the added signal, not a replacement. |
| LinkedIn input UX | Placeholder `https://www.linkedin.com/in/your-handle`. Server auto-prefixes `https://` if user submits `www.linkedin.com/in/...` or `linkedin.com/in/...`, then runs regex. Error copy: "LinkedIn URL must look like https://www.linkedin.com/in/your-handle". | Reduces friction without weakening validation. |
| `Navbar.dashboardPath` | Pathname-first: on `/jobs/*` with a job-board role → `/jobs/dashboard`. Otherwise existing marketplace logic. | Routes users to the dashboard relevant to where they are. |
| `/auth-redirect` | Routes by marketplace + job-board role only. Does **not** read `redirect_url` from URL. Clerk's `forceRedirectUrl` (set on `/sign-up` and `/sign-in` based on the incoming `redirect_url` query) handles redirect-to-target for users coming from job-board flows before `/auth-redirect` ever runs. | Removes open-redirect risk by design. Existing sanitization in `resolveJobBoardAuthRedirectUrl` already gates what reaches Clerk. |

## Data Model Changes

### `jobProfiles`

No structural changes. Existing schema stays.

### Marketplace role

No schema change. The marketplace role union is already `"gcc" | "provider" | null` (see `src/auth/roles.ts:USER_ROLES`) and is derived in `convex/viewer.ts:getContext` from `hasGccProfile` / `hasProviderAccess` flags — it is not stored as a column. No cleanup needed.

### `jobApplications`

| Field | Change |
|---|---|
| `current_title` | **Unchanged.** Stays as `v.optional(v.string())`. Pre-filled from `jobProfiles.current_title` on the form, editable per application, snapshotted into the application document. Recruiter dashboard continues to read `application.current_title` unchanged. |
| `linkedin_url` | **Now required** (was optional). Server normalizes: if value doesn't start with `https://`, auto-prefix with `https://`. Then validate via regex (`/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/`). Reject if regex fails. Store the normalized value. |

## Hero CTA Matrix

Keyed off `jobBoardRole` only — signed-out users have `null`, same as marketplace-only users.

| `jobBoardRole` | Hero CTAs | Each CTA routes to |
|---|---|---|
| `null` | "Find Your Next AI Role" + "Hire AI Talent" | If signed-out: `/sign-up?redirect_url=/jobs/onboarding?role=X`. If signed-in: `/jobs/onboarding?role=X`. |
| `jobseeker` | "My Applications" | `/jobs/dashboard` |
| `recruiter` | "Post a Job" | `/jobs/post` |

## Routes Touched

| Route / File | Change |
|---|---|
| `/jobs` (`JobHero.tsx`) | New CTA matrix. Removes existing "Post a Job" button (replaced by state-aware CTAs). Search bar + category pills unchanged. |
| `/sign-up` and `/sign-in` Clerk pages | Already pass through `redirect_url` via `resolveJobBoardAuthRedirectUrl` → `forceRedirectUrl`. No code change needed; just confirm role-bearing `redirect_url` (e.g. `/jobs/onboarding?role=jobseeker&returnUrl=...`) is preserved by existing sanitization. |
| `/auth-redirect/page.tsx` | Consult `useJobBoardRole`. If marketplace role absent but a job-board role exists, redirect to `/jobs/dashboard`. **Does not read `redirect_url`** (Clerk's `forceRedirectUrl` handles that for job-board flows). |
| `/jobs/onboarding/page.tsx` | Read `?role=` from URL; if valid via `isJobBoardRole`, pass as `presetRole` to `JobOnboarding`; otherwise fall back to original role picker. Existing profile → redirect to dashboard. |
| `/jobs/[slug]/apply/page.tsx` | Two changes: **(a)** Inline `ApplicationForm`: pre-fill `current_title` from profile (kept editable), add required `linkedin_url` field with regex validation, add "Applying as: [name]" header. **(b)** Existing recruiter friendly block stays. **(c)** Null-role redirect now includes `&role=jobseeker`: `/jobs/onboarding?role=jobseeker&returnUrl=...`. |
| `/jobs/post/page.tsx` | **(a)** Existing recruiter-only friendly block stays. **(b)** Null-role redirect now includes `&role=recruiter`: `/jobs/onboarding?role=recruiter&returnUrl=...`. |
| `src/components/jobs/JobDetail.tsx` | Update the signed-out and no-role branches of the "Apply Now" CTA to carry `role=jobseeker` through the auth/onboarding URL chain. |
| `src/components/shared/Navbar.tsx` | Hide "Join Now" on `/jobs/*`; show "Sign in" link with `?redirect_url=<current pathname>` for signed-out users. Pathname-first `dashboardPath` logic. |
| `src/components/jobs/JobOnboarding.tsx` | Accept `presetRole?: JobBoardRole`. Hide picker + "choose carefully" notice when set. Remove `linkedin_url` and `phone` from the onboarding form (they live on application records). |
| `convex/jobApplications.ts` (`create`) | Keep `current_title: v.optional(v.string())` (unchanged). Make `linkedin_url: v.string()` required + auto-prefix `https://` + regex validation via `isValidLinkedInUrl`. |
| `src/jobs/config.ts` | Add `isValidLinkedInUrl` + `LINKEDIN_URL_PATTERN` + `normalizeLinkedInUrl` (auto-prefix helper) — used by client and server. |
| `src/components/jobs/JobApplicationForm.tsx` | **Delete this file** — it's orphaned (no imports anywhere). The user-facing form is the inline `ApplicationForm` inside `/jobs/[slug]/apply/page.tsx`. |

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
11. Application form shows "Applying as **Jane Doe** · ML Engineer" header. Current title pre-filled (editable). Fills phone, years_of_experience, resume PDF, **LinkedIn URL** (required), optional cover note + current_company. Submits.
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
- New: `tests/app/auth-redirect.page.test.tsx` — job-board-only users → `/jobs/dashboard`; marketplace logic preserved.
- New: `tests/app/jobs-onboarding.page.test.tsx` — `?role=jobseeker|recruiter` propagates as `presetRole`; invalid `?role=bogus` → undefined (picker fallback); `?role=` + `?returnUrl=` both honored.
- New: `tests/app/jobs-post.page.test.tsx` — null-role signed-in user is redirected to `/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost`; recruiter sees form; jobseeker sees existing friendly block.
- New: `tests/app/jobs-apply.page.test.tsx` — null-role signed-in user is redirected to `/jobs/onboarding?role=jobseeker&returnUrl=...`; jobseeker sees form (with "Applying as" header, no separate name/email fields, required LinkedIn); recruiter sees existing friendly block.
- Extend `tests/components/jobs/JobDetail.test.tsx` (or create if absent): signed-out "Apply Now" CTA href includes `role=jobseeker`; no-role CTA goes to `/jobs/onboarding?role=jobseeker&returnUrl=...`.
- Recruiter dashboard regression: existing applications display correctly whether `application.current_title` is present or absent (defensive — most new applications will have it since the form pre-fills from profile).

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
