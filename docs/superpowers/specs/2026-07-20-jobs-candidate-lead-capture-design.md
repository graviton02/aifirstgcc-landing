# Candidate Lead Capture on /jobs

**Date:** 2026-07-20
**Status:** Approved

## Problem

A LinkedIn campaign is driving candidate traffic to `/jobs` right now. The only
way a candidate can register interest today is the full account path: Clerk
sign-up (email, password, verification) → `/jobs/onboarding` → role card →
profile form. That is four screens before any candidate data is captured, and
most campaign traffic will abandon at the password step.

There is no requirement for notification infrastructure. New roles will be
mailed out manually. What is needed is candidate contact data, captured with as
little friction as possible, and a way to read and export it.

## Solution

A two-step, no-auth lead capture card that becomes the hero of `/jobs`. It
writes to a new `candidateLeads` Convex table. An admin tab lists the leads and
exports them as CSV for manual mailing.

This mirrors the existing AI Advisor sign-up (`advisorSubmissions` +
`convex/advisors.ts` + `AdminAdvisorsTab`), which is the same shape of feature.

### Non-goals

- No Clerk account, no login, no application tracking for these leads.
- No notification system, digest, or job-matching engine.
- No change to the existing signed-in jobseeker/recruiter flows.

## Data

New table in `convex/schema.ts`:

```ts
candidateLeads: defineTable({
  full_name: v.string(),
  email: v.string(),
  current_title: v.string(),
  years_experience: v.string(),
  job_category: v.string(),
  profile_url: v.optional(v.string()),   // LinkedIn or resume link
  source: v.optional(v.string()),        // from ?src=, defaults to "jobs-page"
  user_agent: v.optional(v.string()),
  status: v.string(),                    // "new" | "contacted" | "archived"
  created_at: v.number(),
  updated_at: v.number(),
})
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_createdAt", ["created_at"]),
```

`profile_url` is optional: it is the field most likely to cause abandonment and
can be requested later, by email.

New constants in `src/jobs/config.ts`:

```ts
export const JOB_EXPERIENCE_LEVELS = ["0-2", "3-5", "6-10", "10+"] as const;
export const JOB_EXPERIENCE_LABELS: Record<JobExperienceLevel, string>;
export const CANDIDATE_LEAD_STATUSES = ["new", "contacted", "archived"] as const;
```

`JOB_CATEGORIES` and `JOB_CATEGORY_LABELS` already exist and are reused.

## Backend — `convex/candidateLeads.ts`

### `submitCandidateLead` (public mutation)

Validation, using `appError` from `convex/lib/errors.ts` for consistent codes:

| Rule | Error code |
|------|-----------|
| `full_name` trimmed length >= 2 | `candidate_name_short` |
| `email` contains `@` and `.` | `candidate_email_invalid` |
| `current_title` trimmed length >= 2 | `candidate_title_required` |
| `years_experience` in `JOB_EXPERIENCE_LEVELS` | `candidate_experience_invalid` |
| `job_category` in `JOB_CATEGORIES` | `candidate_category_invalid` |
| `profile_url`, when non-empty, starts with `http://` or `https://` | `candidate_profile_url_invalid` |

Email is trimmed and lowercased before validation and storage.

**Duplicate handling:** if a lead with the same email exists, the mutation does
*not* error. It refreshes `updated_at` and returns
`{ ok: true, alreadyRegistered: true }`. Campaign traffic revisits the page, and
a red error on a second submit is a worse experience than a confirmation.

First-time submissions return `{ ok: true, alreadyRegistered: false }` and
schedule the confirmation email.

### Admin functions — in `convex/admin.ts`

The admin surface lives in `convex/admin.ts` and is gated by
`requireAdmin(ctx)` from `convex/lib/admin.ts` (Clerk identity checked against
`ADMIN_CLERK_USER_IDS` / `ADMIN_CLERK_EMAILS`), matching the advisor functions.

- `getCandidateLeads` — returns all leads newest-first via `by_createdAt`.
- `updateCandidateLeadStatus` — sets `status` to one of
  `CANDIDATE_LEAD_STATUSES`, bumps `updated_at`, and writes an audit log entry
  the way the advisor review mutations do.

### `sendCandidateConfirmationEmail` (internalAction)

Follows `advisors.ts`: scheduled with `ctx.scheduler.runAfter(0, ...)`, wrapped
in try/catch so a mail failure never fails the submission, and skipped under
test via the existing `shouldScheduleEmails()` guard. Template lives in
`convex/emails/candidateConfirmation.ts`.

This is a receipt, not a notification system — it confirms the submission worked
and gives the sending domain a first touch before manual outreach begins.

## UI — `src/components/jobs/CandidateSignupHero.tsx`

Replaces the CTA button block inside `JobHero` as the page's primary hero. The
search input and category chips stay: they are what makes `/jobs` useful.

**Step 1** — headline "Get notified when AI roles open at GCCs", fields for name
and email, button "Continue".

**Step 2** — current title, years of experience (select), job category (select,
labels from `JOB_CATEGORY_LABELS`), LinkedIn or resume URL (optional). Buttons
"Back" and "Join the list".

**Done state** — "You're on the list. We'll email you when a matching role
opens." Job listings sit directly below, already browsable. A dismiss control
collapses the card so the listings move up.

Details:

- Two-dot progress indicator, matching `JobOnboarding`.
- Framer Motion step transitions and `AnimatedSection` / `StaggerItem`, matching
  the existing jobs components.
- On success, `localStorage` key `orbys_candidate_lead` is set. On mount, a
  present key renders the done state directly, so returning campaign visitors
  are not re-asked and duplicates are avoided client-side as well as server-side.
- A small "Hiring instead? Post a job" link in the card's top-right keeps
  recruiters from being dead-ended by the demoted recruiter CTA.
- `source` is read from the `src` search param, defaulting to `"jobs-page"`, so
  the LinkedIn campaign can be attributed with `?src=linkedin`.

**Who sees it:** signed-out visitors, and signed-in users without a job board
role. Users with a `jobseeker` or `recruiter` role see today's hero CTAs
unchanged.

## Admin — `src/components/admin/AdminCandidatesTab.tsx`

New "Candidates" tab in `/admin`, registered in `src/app/admin/page.tsx`
alongside the existing tabs.

- Table: name, email, title, experience, category, profile link, source, date.
- Status dropdown per row (`new` / `contacted` / `archived`).
- "Copy emails" button — comma-joined addresses of the visible rows, to paste
  into a mail client.
- "Export CSV" button — client-side blob download of the visible rows.

Together these are the manual mailing loop the feature exists to serve.

## Testing

TDD; tests written before implementation.

`tests/convex/candidateLeads.test.ts`
- Each validation rule rejects with its documented error code.
- A valid submission inserts with `status: "new"` and normalised email.
- A duplicate email returns `alreadyRegistered: true`, does not insert a second
  row, and does not error.
- `getCandidateLeads` and `updateCandidateLeadStatus` reject a non-admin
  identity.

`tests/components/CandidateSignupHero.test.tsx`
- Step 1 advances to step 2 only with a name and a valid email.
- Step 2 submit calls the mutation with the collected values.
- The done state renders after a successful submit.
- A pre-set `localStorage` key renders the done state on mount without showing
  the form.

## Risks

- **Duplicate/junk leads.** Server-side email dedupe plus the client-side
  `localStorage` short-circuit cover the realistic cases. No captcha: the volume
  is low and a captcha costs conversions.
- **Demoting the recruiter CTA** could cost recruiter sign-ups for the duration
  of the campaign. Mitigated by the "Hiring instead?" link. Reversible by
  restoring the previous `JobHero` CTA block.
