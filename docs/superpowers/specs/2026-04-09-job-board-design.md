# Job Board — Design Spec

> **Date:** 2026-04-09
> **Status:** Approved
> **Scope:** MVP job board for AI careers, isolated from the existing marketplace

## Overview

A standalone job board within Orbys360 where recruiters post AI roles and job seekers apply in-platform. Shares Clerk for auth and Convex for storage, but is otherwise fully isolated from the marketplace (gcc/provider) features.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Clerk with new `recruiter` / `jobseeker` roles | Reuses auth infrastructure without coupling to marketplace roles |
| Role model | One role per account (gcc / provider / recruiter / jobseeker) | Simple, no ambiguity |
| Posting moderation | Every posting requires admin approval | Consistent with existing patterns, maintains listing quality |
| Application method | In-platform form with resume upload. External URL replaces in-platform if provided by recruiter. | Keeps applicant data centralized for most jobs |
| Recruiter dashboard | Single page, job-focused. Expand job to see applicants. Email + status labels. | Simple, no over-engineering |
| Seeker dashboard | View submitted applications (dates only, no recruiter status visibility) | Privacy for recruiters, simplicity for MVP |
| Onboarding | Separate `/jobs/onboarding`, isolated from marketplace onboarding | Matches isolation requirement |
| Resume format | PDF only, 5MB max | Universal, simple validation |
| Job board focus | AI jobs in general, not GCC-specific | Broader audience |

## Data Model

### `jobProfiles`

Stores recruiter and jobseeker identities. One per Clerk user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| clerk_user_id | string | yes | Clerk identity, indexed |
| role | "recruiter" \| "jobseeker" | yes | Indexed |
| name | string | yes | |
| email | string | yes | |
| company_name | string | recruiter only | |
| current_title | string | jobseeker only | |
| linkedin_url | string | no | |
| phone | string | no | |
| created_at | number | yes | `Date.now()` |

**Indexes:** `by_clerkUserId` on `clerk_user_id`

### `jobs`

Job listings posted by recruiters.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| slug | string | yes | Auto-generated from title + suffix for uniqueness (e.g., `ai-engineer`, `ai-engineer-2`), indexed |
| recruiter_id | id("jobProfiles") | yes | Indexed |
| title | string | yes | |
| company_name | string | yes | |
| location | string | yes | City/country |
| workplace_type | "remote" \| "hybrid" \| "onsite" | yes | |
| job_type | "full-time" \| "part-time" \| "contract" \| "internship" | yes | |
| seniority | "entry" \| "mid" \| "senior" \| "lead" \| "executive" | yes | |
| category | string | yes | engineering, data-science, product, ai-ml, operations, sales, other |
| description | string | yes | Plain text with line breaks |
| requirements | string | no | |
| skills | string[] | no | Free-form tags |
| salary_min | number | no | |
| salary_max | number | no | |
| salary_type | "annual" \| "monthly" | no | |
| num_openings | number | no | |
| apply_url | string | no | If set, replaces in-platform application |
| deadline | number | no | Unix timestamp |
| status | "pending" \| "approved" \| "rejected" \| "closed" | yes | |
| admin_notes | string | no | Populated on reject |
| reviewed_at | number | no | |
| created_at | number | yes | `Date.now()` |

**Indexes:** `by_slug` on `slug`, `by_status` on `status`, `by_recruiterId` on `recruiter_id`

### `jobApplications`

Applications submitted by job seekers.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| job_id | id("jobs") | yes | Indexed |
| applicant_id | id("jobProfiles") | yes | Indexed |
| name | string | yes | Pre-filled from profile |
| email | string | yes | Pre-filled from profile |
| phone | string | yes | |
| current_company | string | no | |
| current_title | string | no | |
| linkedin_url | string | no | |
| years_of_experience | number | yes | |
| cover_note | string | no | |
| resume_storage_id | id("_storage") | yes | Convex file storage, PDF only, 5MB max |
| recruiter_status | "new" \| "reviewed" \| "shortlisted" \| "rejected" | yes | Default: "new" |
| applied_at | number | yes | `Date.now()` |

**Indexes:** `by_jobId` on `job_id`, `by_applicantId` on `applicant_id`

## Routes

| Route | Auth | Role | Purpose |
|-------|------|------|---------|
| `/jobs` | none | any | Public listing with hero, search, filters |
| `/jobs/[slug]` | none | any | Public job detail page |
| `/jobs/post` | Clerk | recruiter | Job submission form |
| `/jobs/dashboard` | Clerk | recruiter or jobseeker | Role-specific dashboard |
| `/jobs/onboarding` | Clerk | none yet | Role selection + profile form |

**Auth gating logic:**
- `/jobs/post` — if not signed in, redirect to Clerk sign-up. If signed in but not recruiter, redirect to `/jobs/onboarding`.
- `/jobs/dashboard` — if not signed in, redirect to Clerk sign-up. If signed in but no job board role, redirect to `/jobs/onboarding`. Content differs: recruiter sees their jobs + applicants, jobseeker sees their applications.
- `/jobs/onboarding` — if already has a job board role, redirect to `/jobs/dashboard`.
- **Return URL pattern:** Auth-gated pages pass `?returnUrl=/jobs/[slug]` through the sign-up and onboarding flows so the user lands back where they started after completing onboarding.

## User Flows

### Recruiter

1. Arrives at `/jobs`, clicks "Post a Job"
2. Redirected to Clerk sign-up if not signed in
3. `/jobs/onboarding` — picks "Recruiter", fills name, email, company name
4. Redirected to `/jobs/post` — fills job form, submits
5. Job enters `pending` status, confirmation shown
6. Admin approves in `/admin` Jobs tab
7. Job appears on `/jobs`
8. Recruiter visits `/jobs/dashboard` — sees job list with status badges (pending/approved/closed)
9. Expands an approved job — sees applicant list
10. Can mark applicants as reviewed / shortlisted / rejected
11. Clicks "Email" on an applicant — mailto opens with their email

### Jobseeker

1. Arrives at `/jobs`, browses and filters listings
2. Clicks a job — `/jobs/[slug]` shows full details
3. Clicks "Apply Now"
4. If not signed in: Clerk sign-up → `/jobs/onboarding` → picks "Jobseeker", fills profile → redirected back to job
5. Application form: profile fields pre-filled, adds cover note + uploads resume (PDF, 5MB)
6. Submits — confirmation screen
7. `/jobs/dashboard` — sees list of submitted applications with job title and date

### External Apply URL

If recruiter provides `apply_url`, the job detail page shows "Apply on company site" button that opens the URL in a new tab. No in-platform form, no application record.

### Admin

1. `/admin` → "Jobs" tab
2. Sees pending job listings with recruiter name, company, title
3. Reviews job details
4. Approves or rejects (rejection requires notes)
5. Approved jobs go live, rejected jobs notify recruiter on their dashboard

## Components

### New files

```
src/app/jobs/
  ├── page.tsx                     — job listing page
  ├── [slug]/page.tsx              — job detail page
  ├── post/page.tsx                — recruiter job form page
  ├── dashboard/page.tsx           — role-split dashboard page
  └── onboarding/page.tsx          — role selection + profile page

src/components/jobs/
  ├── JobHero.tsx                  — compact hero with search + "Post a Job" CTA
  ├── JobCard.tsx                  — listing card for grid
  ├── JobFilters.tsx               — category/type/seniority/workplace filters
  ├── JobDetail.tsx                — job detail client component
  ├── JobPostForm.tsx              — recruiter submission form
  ├── JobApplicationForm.tsx       — seeker application form + resume upload
  ├── JobOnboarding.tsx            — role picker + profile form
  ├── RecruiterDashboard.tsx       — my jobs list with expandable applicant rows
  ├── SeekerDashboard.tsx          — my applications list
  └── ApplicantRow.tsx             — applicant with status label + email mailto CTA

src/components/admin/
  └── AdminJobsTab.tsx             — pending/approved/rejected job review

convex/
  ├── jobs.ts                      — job CRUD, listing queries, admin approve/reject
  ├── jobApplications.ts           — apply mutation, recruiter queries, status updates
  └── jobProfiles.ts               — profile creation, role check, onboarding
```

### Modified files

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `jobProfiles`, `jobs`, `jobApplications` tables |
| `src/components/shared/Navbar.tsx` | Add "Job Board" link |
| `src/app/admin/page.tsx` | Add "Jobs" tab |
| `middleware.ts` | Add auth-gated `/jobs/post`, `/jobs/dashboard`, `/jobs/onboarding` routes |

## Hero Copy

```
Tag: AI Careers

The Job Board for AI Talent

Discover roles at the companies building the future of AI,
or find the talent to build yours.

[Search jobs...]          [Post a Job →]

Filter pills: Engineering | Data Science | AI & ML | Product | Operations | Sales
```

## Out of Scope (Deferred)

- Seeker seeing recruiter's status labels on their applications
- Email/push notifications on approval, application received, status change
- Job expiration automation
- Saved/bookmarked jobs
- SEO (generateStaticParams, JSON-LD) — add once real data exists
- Rich text editor for job description
- Recruiter editing a posted job after submission
- Multiple recruiters per company
- Analytics / job view counts
