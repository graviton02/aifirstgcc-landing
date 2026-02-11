# Orbys360 Platform — Full Development Plan

> **Created:** 2026-02-11
> **Branch:** `develop`
> **Total tickets:** 50
> **Prerequisite:** Scaffolding tickets 1–13 completed. Clerk account active. Supabase project accessible.
> **Scope:** Core PRD (Sections 1–8) + Known Gaps (Section 9: email notifications, admin edit UI, pagination, backend role enforcement)
> **Backend strategy:** Supabase Edge Functions (Deno) for server-side logic
> **Auth strategy:** Clerk-to-Supabase JWT bridge + Clerk webhook for `publicMetadata` sync

---

## Ticket Overview

| # | Ticket | Status | Blocked By |
|---|--------|--------|------------|
| 1 | Supabase Foundation Migration (4 Core Tables) | `not_started` | — |
| 2 | Provider Submission Tables Migration | `not_started` | #1 |
| 3 | Marketplace & GCC Tables Migration | `not_started` | #1 |
| 4 | Self-Assessment Tables Migration | `not_started` | #1 |
| 5 | Supabase Storage Buckets | `not_started` | #1 |
| 6 | Clerk-to-Supabase JWT Bridge | `not_started` | #1 |
| 7 | Clerk Webhook Edge Function (publicMetadata Sync) | `not_started` | #6 |
| 8 | Backend Role Enforcement Edge Function | `not_started` | #6 |
| 9 | Typed Supabase Client Helpers | `not_started` | #1, #2, #3, #4 |
| 10 | TanStack Query Hooks — Provider Data | `not_started` | #9 |
| 11 | TanStack Query Hooks — Agent & Marketplace Data | `not_started` | #9 |
| 12 | TanStack Query Hooks — GCC & Problem Data | `not_started` | #9 |
| 13 | Onboarding Step 1 — Category Selection | `not_started` | #9, #10 |
| 14 | Onboarding Step 2 — Basic Info Form | `not_started` | #13 |
| 15 | Onboarding Step 3 — TSP 5-Page Wizard | `not_started` | #2, #5, #14 |
| 16 | Onboarding Step 3 — Startup 5-Page Wizard | `not_started` | #2, #5, #14 |
| 17 | Provider Dashboard Shell + Pending Banner | `not_started` | #10 |
| 18 | Provider Dashboard — Requests Tab | `not_started` | #3, #17 |
| 19 | Provider Dashboard — Submissions Tab | `not_started` | #11, #17 |
| 20 | Provider Dashboard — Profile Tab | `not_started` | #2, #5, #17 |
| 21 | Agent Listing 5-Page Wizard | `not_started` | #5, #11 |
| 22 | Agent Edit Flow | `not_started` | #3, #11, #21 |
| 23 | Marketplace Listing Page | `not_started` | #11 |
| 24 | Agent Detail Page | `not_started` | #11 |
| 25 | Contact Provider Modal + Logging | `not_started` | #3, #12, #24 |
| 26 | Shortlist Management | `not_started` | #3, #12 |
| 27 | GCC Dashboard Shell | `not_started` | #12 |
| 28 | GCC Dashboard — Shortlisted Agents Tab | `not_started` | #26, #27 |
| 29 | GCC Dashboard — Current Requests Tab | `not_started` | #25, #27 |
| 30 | GCC Dashboard — Problem Hub Tab | `not_started` | #12, #27 |
| 31 | Problem Statement Submission Form | `not_started` | #3, #12 |
| 32 | Problems Public Listing Page | `not_started` | #11, #12 |
| 33 | Express Interest Flow | `not_started` | #3, #32 |
| 34 | Monthly Quota Enforcement | `not_started` | #3, #31 |
| 35 | Admin Session Auth | `not_started` | #1 |
| 36 | Admin Dashboard — Agents Tab | `not_started` | #11, #35 |
| 37 | Admin Dashboard — Providers Tab | `not_started` | #10, #35 |
| 38 | Admin Dashboard — Problems Tab | `not_started` | #12, #35 |
| 39 | Admin — Agent Edit Reviews | `not_started` | #22, #36 |
| 40 | Admin — Profile Edit Reviews | `not_started` | #20, #37 |
| 41 | Self-Assessment Questionnaire | `not_started` | #4, #12 |
| 42 | Self-Assessment Results + PDF Generation | `not_started` | #4, #5, #41 |
| 43 | Thought Leadership Hub + Article Pages | `not_started` | — |
| 44 | Tools Hub Page | `not_started` | — |
| 45 | Orbyt Landing Page | `not_started` | #23 |
| 46 | Provider Ecosystem + Directory Page | `not_started` | #10 |
| 47 | Benchmarks Page | `not_started` | — |
| 48 | Email Notifications Edge Function | `not_started` | #6 |
| 49 | Pagination (Marketplace, Problems, Content) | `not_started` | #23, #32, #43 |
| 50 | Route Tree Update + Final Integration | `not_started` | #42, #43, #44, #45, #46, #47 |

---

## Ticket 1: Supabase Foundation Migration (4 Core Tables)

### Status: `not_started`

### Description

Create the first database migration that adds the four core platform tables to Supabase: `provider_profiles`, `agents`, `agent_submissions`, and `admin_sessions`. These tables are the minimum needed for the auth guards to function (provider profile check) and for the marketplace to display data.

> **Note:** This is Scaffolding Ticket #14, carried forward because it was not executed.

### What Changes

Create `supabase/migrations/20260211000000_create_platform_foundation.sql`:

**Table 1: `provider_profiles`**
```sql
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  company_size TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  category TEXT NOT NULL CHECK (category IN ('tsp', 'startup')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 2: `agents`**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  use_cases JSONB DEFAULT '[]',
  industries TEXT[] DEFAULT '{}',
  integration_type TEXT,
  supported_platforms TEXT[] DEFAULT '{}',
  data_requirements TEXT,
  impact_metrics JSONB DEFAULT '[]',
  demo_url TEXT,
  compliance_certifications TEXT[] DEFAULT '{}',
  security_features TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 3: `agent_submissions`**
```sql
CREATE TABLE agent_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  use_cases JSONB DEFAULT '[]',
  industries TEXT[] DEFAULT '{}',
  integration_type TEXT,
  supported_platforms TEXT[] DEFAULT '{}',
  data_requirements TEXT,
  impact_metrics JSONB DEFAULT '[]',
  demo_url TEXT,
  compliance_certifications TEXT[] DEFAULT '{}',
  security_features TEXT[] DEFAULT '{}',
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 4: `admin_sessions`**
```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS Policies** (enabled on `provider_profiles`, `agents`, `agent_submissions`):
- `provider_profiles`: anon can SELECT where `status = 'approved'`; authenticated can INSERT/SELECT/UPDATE own (by `user_id`)
- `agents`: anon can SELECT where `status = 'active'`
- `agent_submissions`: authenticated can INSERT/SELECT own (by `user_id`)

**Indexes**:
- `agents(provider_profile_id)`
- `agents(category)`
- `agent_submissions(user_id)`
- `agent_submissions(provider_profile_id)`

### Acceptance Criteria

- [ ] Migration file exists at `supabase/migrations/20260211000000_create_platform_foundation.sql`
- [ ] All 4 tables created with correct columns and constraints
- [ ] RLS enabled on `provider_profiles`, `agents`, `agent_submissions`
- [ ] CHECK constraints on status/category fields match PRD enums
- [ ] Foreign key from `agents.provider_profile_id` → `provider_profiles.id`
- [ ] Foreign key from `agent_submissions.provider_profile_id` → `provider_profiles.id`
- [ ] `provider_profiles.user_id` and `provider_profiles.organization_id` have UNIQUE constraints
- [ ] `admin_sessions.session_token` has UNIQUE constraint
- [ ] `created_at` and `updated_at` default to `now()`
- [ ] JSONB columns default to `'[]'`, TEXT[] columns default to `'{}'`
- [ ] Indexes on foreign key and frequently-queried columns
- [ ] Migration SQL is syntactically valid

### Machine Verification

```bash
# Verify file exists
ls supabase/migrations/20260211000000_create_platform_foundation.sql

# If supabase CLI is installed:
supabase db lint
```

### Human Verification

1. Read the migration file and cross-reference every table/column against PRD Section 6
2. Confirm RLS policies are present for `provider_profiles`, `agents`, `agent_submissions`
3. Apply the migration to Supabase Dashboard → SQL Editor and verify tables appear

### Prerequisites from User

- [ ] Supabase project accessible (URL + anon key in `.env`)
- [ ] Supabase CLI installed locally OR ability to run SQL in Dashboard → SQL Editor
- [ ] **Understand the Clerk + Supabase auth gap**: RLS policies reference `auth.uid()` but Clerk handles auth. Policies need the JWT bridge (Ticket #6) to function for writes. Public reads via anon key work immediately.

### State Awareness

- **Before:** One table in Supabase: `early_access_signups`. One migration file (`20260205072435`).
- **After:** Five tables total. New tables are empty but structured. `RequireProviderProfile` guard can now query `provider_profiles`.
- **Auth gap:** Writes require JWT bridge (Ticket #6). Public reads work via anon key immediately.

### Dependencies

None — this is the first ticket in this plan.

---

## Ticket 2: Provider Submission Tables Migration

### Status: `not_started`

### Description

Create the database tables for provider onboarding submissions. When a provider completes the onboarding wizard, their detailed form data is stored in either `tsp_submissions` (for TSPs) or `startup_submissions` (for Startups). `tsp_edits` stores pending changes to approved TSP profiles.

### What Changes

Create `supabase/migrations/20260211000001_create_provider_submissions.sql`:

**Table 1: `tsp_submissions`**
```sql
CREATE TABLE tsp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id),
  user_id TEXT NOT NULL,
  -- Page 1: Company Profile
  logo_url TEXT,
  website TEXT,
  founding_year INTEGER,
  about_text TEXT,
  -- Page 2: AI-First Positioning
  core_positioning TEXT,
  ai_first_definition TEXT,
  unique_differentiators TEXT,
  -- Page 3: Capabilities
  ai_enabled_workflows TEXT,
  governance_frameworks TEXT,
  service_offerings TEXT,
  -- Page 4: Track Record
  gccs_enabled INTEGER DEFAULT 0,
  impact_metrics TEXT,
  case_studies TEXT,
  industry_recognitions TEXT,
  -- Page 5: Vision & Contact
  agent_native_vision TEXT,
  expansion_plans TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  -- Status
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 2: `startup_submissions`**
```sql
CREATE TABLE startup_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id),
  user_id TEXT NOT NULL,
  -- Page 1: Company Profile
  logo_url TEXT,
  website TEXT,
  founding_year INTEGER,
  funding_stage TEXT,
  -- Page 2: Product & Technology
  product_description TEXT,
  ai_capabilities TEXT,
  tech_stack TEXT,
  -- Page 3: Market & Traction
  target_industries TEXT,
  customer_segments TEXT,
  key_metrics TEXT,
  -- Page 4: Compliance & Security
  certifications TEXT,
  data_privacy_posture TEXT,
  security_measures TEXT,
  -- Page 5: Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  partnership_interests TEXT,
  -- Status
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 3: `tsp_edits`**
```sql
CREATE TABLE tsp_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tsp_id UUID NOT NULL REFERENCES tsp_submissions(id),
  user_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS**: authenticated users can INSERT/SELECT own rows (by `user_id`).
**Indexes**: `tsp_submissions(user_id)`, `startup_submissions(user_id)`, `tsp_edits(tsp_id)`.

### Acceptance Criteria

- [ ] Migration file exists at `supabase/migrations/20260211000001_create_provider_submissions.sql`
- [ ] `tsp_submissions` has 20+ fields matching PRD Section 3.2 (TSP form)
- [ ] `startup_submissions` has 15+ fields matching PRD Section 3.2 (Startup form)
- [ ] `tsp_edits` stores a JSONB `payload` for change diffs
- [ ] Both submission tables have `UNIQUE` constraint on `provider_profile_id` (one submission per provider)
- [ ] Foreign keys reference `provider_profiles(id)`
- [ ] RLS enabled on all 3 tables
- [ ] Migration is syntactically valid SQL

### Machine Verification

```bash
ls supabase/migrations/20260211000001_create_provider_submissions.sql
```

### Human Verification

1. Cross-reference `tsp_submissions` columns against PRD Section 3.2 (TSP Form 5 pages)
2. Cross-reference `startup_submissions` columns against PRD Section 3.2 (Startup Form 5 pages)
3. Confirm `tsp_edits.payload` is JSONB (not structured columns — allows flexible partial edits)
4. Apply migration to Supabase and verify tables appear

### Prerequisites from User

- [ ] Ticket #1 migration applied (tables reference `provider_profiles`)

### State Awareness

- **Before:** 5 tables (from Ticket #1 + `early_access_signups`)
- **After:** 8 tables. Onboarding forms can now persist data. Edit requests can be tracked.

### Dependencies

- **Blocked by:** Ticket #1 (foreign key to `provider_profiles`)

---

## Ticket 3: Marketplace & GCC Tables Migration

### Status: `not_started`

### Description

Create the database tables for the GCC-facing features: problem statements, provider interest tracking, problem submission quotas, agent shortlists, contact logging, provider request tracking, and agent edit tracking. These tables power the GCC dashboard, problem marketplace, and the contact/shortlist flows.

### What Changes

Create `supabase/migrations/20260211000002_create_marketplace_gcc_tables.sql`:

**Table 1: `problem_statements`**
```sql
CREATE TABLE problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  gcc_user_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 100 AND 5000),
  category TEXT NOT NULL,
  industry TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  timeline TEXT NOT NULL CHECK (timeline IN ('immediate', 'short', 'medium', 'long')),
  budget_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  interest_count INTEGER DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 2: `problem_statement_interests`**
```sql
CREATE TABLE problem_statement_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_statement_id UUID NOT NULL REFERENCES problem_statements(id),
  provider_org_id TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (problem_statement_id, provider_org_id)
);
```

**Table 3: `gcc_problem_submission_quota`**
```sql
CREATE TABLE gcc_problem_submission_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  current_month TEXT NOT NULL,
  submissions_this_month INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 20,
  UNIQUE (gcc_org_id, current_month)
);
```

**Table 4: `agent_shortlists`**
```sql
CREATE TABLE agent_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  created_by_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gcc_org_id, agent_id)
);
```

**Table 5: `contact_logs`**
```sql
CREATE TABLE contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_user_id TEXT NOT NULL,
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 6: `provider_requests`**
```sql
CREATE TABLE provider_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  gcc_user_email TEXT NOT NULL,
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 7: `agent_edits`**
```sql
CREATE TABLE agent_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  user_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS Policies:**
- `problem_statements`: GCC org members INSERT/SELECT/DELETE own (by `gcc_org_id`); anon SELECT approved only (no company name exposed)
- `problem_statement_interests`: authenticated INSERT own; SELECT own
- `agent_shortlists`: GCC org members full CRUD (by `gcc_org_id`)
- `contact_logs`: authenticated INSERT; GCC org members SELECT own
- `provider_requests`: provider profile owners SELECT own (by `provider_profile_id`)
- `agent_edits`: authenticated INSERT/SELECT own (by `user_id`)

**Indexes:**
- `problem_statements(gcc_org_id)`, `problem_statements(status)`
- `problem_statement_interests(problem_statement_id)`
- `agent_shortlists(gcc_org_id)`, `agent_shortlists(agent_id)`
- `contact_logs(gcc_org_id)`, `contact_logs(provider_profile_id)`
- `provider_requests(provider_profile_id)`
- `agent_edits(agent_id)`

### Acceptance Criteria

- [ ] Migration file exists at `supabase/migrations/20260211000002_create_marketplace_gcc_tables.sql`
- [ ] All 7 tables created with correct columns, constraints, and defaults
- [ ] `problem_statement_interests` has UNIQUE on `(problem_statement_id, provider_org_id)` — one interest per org per problem
- [ ] `agent_shortlists` has UNIQUE on `(gcc_org_id, agent_id)` — one shortlist entry per org per agent
- [ ] `gcc_problem_submission_quota` has UNIQUE on `(gcc_org_id, current_month)`
- [ ] `problem_statements.title` has CHECK constraint for length (10–200 chars)
- [ ] `problem_statements.description` has CHECK constraint for length (100–5000 chars)
- [ ] All foreign keys reference correct parent tables
- [ ] RLS enabled on all tables with appropriate policies
- [ ] Migration is syntactically valid SQL

### Machine Verification

```bash
ls supabase/migrations/20260211000002_create_marketplace_gcc_tables.sql
```

### Human Verification

1. Cross-reference tables against PRD Section 6 (Data Model Summary)
2. Verify UNIQUE constraints match business rules (Section 8)
3. Verify `problem_statements` does NOT include GCC company name in public SELECT policy
4. Apply migration and verify in Supabase Dashboard

### Prerequisites from User

- [ ] Tickets #1 migration applied (references `provider_profiles`, `agents`)

### State Awareness

- **Before:** 8 tables (from Tickets #1, #2)
- **After:** 15 tables. GCC dashboard, problem statements, shortlists, contact logging, and agent edits are all supported.

### Dependencies

- **Blocked by:** Ticket #1 (foreign keys to `provider_profiles` and `agents`)

---

## Ticket 4: Self-Assessment Tables Migration

### Status: `not_started`

### Description

Create the database tables for the AI readiness self-assessment feature. GCC users complete a questionnaire, and the results are analyzed and optionally exported as a PDF.

### What Changes

Create `supabase/migrations/20260211000003_create_self_assessment_tables.sql`:

**Table 1: `self_assessments`**
```sql
CREATE TABLE self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table 2: `self_assessment_results`**
```sql
CREATE TABLE self_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES self_assessments(id),
  overall_score NUMERIC(4,1),
  category_scores JSONB DEFAULT '{}',
  analysis JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:** authenticated users can INSERT/SELECT/UPDATE own (by `user_id`).
**Indexes:** `self_assessments(user_id)`, `self_assessments(org_id)`.

### Acceptance Criteria

- [ ] Migration file exists at `supabase/migrations/20260211000003_create_self_assessment_tables.sql`
- [ ] `self_assessments.answers` is JSONB (flexible questionnaire schema)
- [ ] `self_assessment_results.assessment_id` is UNIQUE (one result per assessment)
- [ ] `self_assessment_results` includes `overall_score`, `category_scores`, `analysis`, `recommendations`, `pdf_url`
- [ ] RLS policies allow authenticated users to manage own assessments
- [ ] Migration is syntactically valid

### Machine Verification

```bash
ls supabase/migrations/20260211000003_create_self_assessment_tables.sql
```

### Human Verification

1. Verify against PRD Section 6 (self_assessments, self_assessment_results rows)
2. Confirm JSONB is used for flexible `answers` and `analysis` fields
3. Apply migration and verify

### Prerequisites from User

- [ ] Ticket #1 migration applied

### State Awareness

- **Before:** 15 tables
- **After:** 17 tables. Self-assessment feature has storage.

### Dependencies

- **Blocked by:** Ticket #1 (migration ordering)

---

## Ticket 5: Supabase Storage Buckets

### Status: `not_started`

### Description

Create Supabase Storage buckets for file uploads: provider logos, agent logos, and assessment PDF exports. Configure public read access for logos and private access for PDFs.

### What Changes

Create `supabase/migrations/20260211000004_create_storage_buckets.sql`:

```sql
-- Provider logos (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-logos', 'provider-logos', true);

-- Agent logos (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-logos', 'agent-logos', true);

-- Assessment PDFs (private, authenticated read/write)
INSERT INTO storage.buckets (id, name, public) VALUES ('assessment-pdfs', 'assessment-pdfs', false);
```

**Storage Policies:**
- `provider-logos`: anon SELECT; authenticated INSERT/UPDATE/DELETE own files (path starts with `user_id/`)
- `agent-logos`: anon SELECT; authenticated INSERT/UPDATE/DELETE own files
- `assessment-pdfs`: authenticated SELECT/INSERT own files (path starts with `user_id/`)

### Acceptance Criteria

- [ ] Migration creates 3 storage buckets: `provider-logos`, `agent-logos`, `assessment-pdfs`
- [ ] `provider-logos` and `agent-logos` are public (read without auth)
- [ ] `assessment-pdfs` is private (requires auth to read)
- [ ] Storage policies enforce per-user file ownership via path prefix
- [ ] File size limits set (e.g., 2MB for logos, 10MB for PDFs)

### Machine Verification

```bash
ls supabase/migrations/20260211000004_create_storage_buckets.sql
```

### Human Verification

1. Apply migration, open Supabase Dashboard → Storage → verify 3 buckets appear
2. Test upload via Dashboard: upload a test image to `provider-logos`
3. Verify the public URL is accessible without auth

### Prerequisites from User

- [ ] Supabase project has Storage enabled (default on new projects)

### State Awareness

- **Before:** No storage buckets
- **After:** 3 buckets ready for file uploads. Logo upload forms (Tickets #15, #16, #21) can now store files.

### Dependencies

- **Blocked by:** Ticket #1 (migration ordering)

---

## Ticket 6: Clerk-to-Supabase JWT Bridge

### Status: `not_started`

### Description

Configure the Clerk-to-Supabase JWT integration so that authenticated Clerk users can make RLS-protected Supabase queries. Without this bridge, Supabase's `auth.uid()` returns null for Clerk-authenticated users, making all write-side RLS policies fail.

### What Changes

**1. Clerk Dashboard Configuration:**
- Navigate to Clerk Dashboard → JWT Templates → Create template
- Template name: `supabase`
- Claims: `{ "sub": "{{user.id}}", "role": "authenticated" }`
- Signing algorithm: RS256
- Copy the JWKS endpoint URL

**2. Supabase Dashboard Configuration:**
- Navigate to Supabase Dashboard → Authentication → JWT Settings
- Set the JWT secret to Clerk's JWKS endpoint (or set the public key)
- Enable third-party auth provider

**3. Create `src/lib/supabase-auth.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/clerk-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function useSupabaseClient() {
  const { session } = useSession()

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({ template: 'supabase' })
        const headers = new Headers(options.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }
        return fetch(url, { ...options, headers })
      },
    },
  })

  return supabase
}
```

**4. Update `src/vite-env.d.ts`** — no changes needed (SUPABASE vars already declared).

### Acceptance Criteria

- [ ] Clerk JWT template named `supabase` exists with correct claims (`sub`, `role`)
- [ ] Supabase project configured to verify Clerk JWTs
- [ ] `src/lib/supabase-auth.ts` exports `useSupabaseClient()` hook
- [ ] The hook creates a Supabase client that injects the Clerk JWT into every request
- [ ] When signed in, `auth.uid()` in Supabase returns the Clerk user ID
- [ ] When signed out, the client falls back to the anon key (public reads still work)
- [ ] Existing `src/lib/supabase.ts` (anon client) remains unchanged for public queries
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build

# File exists
ls src/lib/supabase-auth.ts
```

### Human Verification

1. Sign in as a test user
2. Open browser console and run a test query against a table with RLS
3. Verify the query succeeds (returns data) instead of returning empty/error
4. Sign out and verify the same query returns only public data

### Prerequisites from User

- [ ] **Clerk Dashboard**: Create a JWT template named `supabase` (API → JWT Templates → Create)
- [ ] **Supabase Dashboard**: Configure third-party JWT verification (Authentication → Settings)
- [ ] Both projects must use compatible signing keys

### State Awareness

- **Before:** Two separate auth systems. Clerk handles frontend auth. Supabase RLS policies use `auth.uid()` which returns null for Clerk users. All write-side RLS blocks.
- **After:** Clerk JWTs are forwarded to Supabase. `auth.uid()` returns the Clerk user ID. RLS policies work for authenticated operations. The anon client in `supabase.ts` still works for public reads.

### Dependencies

- **Blocked by:** Ticket #1 (need tables with RLS to test against)
- **Blocks:** Ticket #7 (webhook), Ticket #8 (role enforcement), all data mutation tickets

---

## Ticket 7: Clerk Webhook Edge Function (publicMetadata Sync)

### Status: `not_started`

### Description

Create a Supabase Edge Function that receives Clerk webhook events and syncs the user role from `unsafeMetadata` to `publicMetadata`. Currently, signup writes the role to `unsafeMetadata` (client-writable), but production should use `publicMetadata` (server-only writable) for security. This webhook listens for `user.created` events and copies the role.

### What Changes

**1. Create `supabase/functions/clerk-webhook/index.ts`:**
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Webhook } from 'https://esm.sh/svix@1.15.0'

serve(async (req) => {
  const CLERK_WEBHOOK_SECRET = Deno.env.get('CLERK_WEBHOOK_SECRET')
  const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY')

  // Verify webhook signature using Svix
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }
  const body = await req.text()
  const wh = new Webhook(CLERK_WEBHOOK_SECRET!)
  const event = wh.verify(body, svixHeaders)

  if (event.type === 'user.created') {
    const { id, unsafe_metadata } = event.data
    const role = unsafe_metadata?.role

    if (role && ['gcc', 'provider'].includes(role)) {
      // Update publicMetadata via Clerk Backend API
      await fetch(`https://api.clerk.com/v1/users/${id}/metadata`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { role },
        }),
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**2. After deployment, update `src/auth/useUserRole.ts`:**
- Change from `unsafeMetadata.role` to `publicMetadata.role`
- Remove the TODO comment

### Acceptance Criteria

- [ ] Edge Function exists at `supabase/functions/clerk-webhook/index.ts`
- [ ] Function verifies Svix webhook signature (prevents spoofed requests)
- [ ] Function handles `user.created` event type
- [ ] Function reads `unsafe_metadata.role` and writes to `public_metadata.role` via Clerk API
- [ ] Function validates role is either `'gcc'` or `'provider'` before writing
- [ ] Function returns 200 for all events (including unhandled types)
- [ ] `useUserRole.ts` updated to read from `publicMetadata` after webhook is deployed
- [ ] `npm run build` passes

### Machine Verification

```bash
# Edge function file exists
ls supabase/functions/clerk-webhook/index.ts

# Build still passes
npm run build
```

### Human Verification

1. Deploy the Edge Function: `supabase functions deploy clerk-webhook`
2. Configure Clerk Dashboard → Webhooks → Add endpoint → URL: your Edge Function URL
3. Select `user.created` event
4. Create a test user via signup
5. Check Clerk Dashboard → Users → verify `publicMetadata.role` is set
6. Verify `unsafeMetadata.role` still has the original value (both exist)

### Prerequisites from User

- [ ] **Clerk secret key** (Backend API key, NOT publishable key) — add to Supabase Edge Function secrets
- [ ] **Clerk webhook signing secret** — generate in Clerk Dashboard → Webhooks
- [ ] **Supabase CLI** installed for `supabase functions deploy`
- [ ] Add secrets: `supabase secrets set CLERK_WEBHOOK_SECRET=whsec_... CLERK_SECRET_KEY=sk_...`

### State Awareness

- **Before:** Role is only in `unsafeMetadata` (client-writable). `useUserRole` reads from `unsafeMetadata`.
- **After:** Role is synced to `publicMetadata` (server-only). `useUserRole` reads from `publicMetadata`. This is the production-safe approach — `unsafeMetadata` can be tampered with by users, but `publicMetadata` cannot.
- **Migration path:** Once webhook is deployed and tested, `useUserRole.ts` switches from `unsafeMetadata` to `publicMetadata`. Existing users need a one-time backfill (can be done via Clerk API script).

### Dependencies

- **Blocked by:** Ticket #6 (JWT bridge must be configured first — Clerk secret key needed)
- **Blocks:** Nothing directly (but enables production-safe auth)

---

## Ticket 8: Backend Role Enforcement Edge Function

### Status: `not_started`

### Description

Create a Supabase Edge Function that enforces role exclusivity on the backend. The frontend guards prevent users from accessing wrong-role pages, but a determined user could theoretically create both a GCC and provider profile. This function validates role assignment during signup and blocks conflicting operations. (Addresses the "Backend role exclusivity enforcement" gap from PRD Section 9.)

### What Changes

**Create `supabase/functions/enforce-role/index.ts`:**

This function is called as a database trigger or as middleware before sensitive operations:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id, requested_role } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Check if user already has a provider profile
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user_id)
    .single()

  // Check if user has GCC activity (shortlists, problem submissions)
  const { data: gccActivity } = await supabase
    .from('agent_shortlists')
    .select('id')
    .eq('created_by_user_id', user_id)
    .limit(1)

  const hasProviderProfile = !!providerProfile
  const hasGCCActivity = !!gccActivity?.length

  if (requested_role === 'provider' && hasGCCActivity) {
    return new Response(
      JSON.stringify({ error: 'User has GCC activity. Cannot create provider profile.' }),
      { status: 409 }
    )
  }

  if (requested_role === 'gcc' && hasProviderProfile) {
    return new Response(
      JSON.stringify({ error: 'User has provider profile. Cannot operate as GCC.' }),
      { status: 409 }
    )
  }

  return new Response(JSON.stringify({ allowed: true }), { status: 200 })
})
```

### Acceptance Criteria

- [ ] Edge Function exists at `supabase/functions/enforce-role/index.ts`
- [ ] Function checks for existing provider profile when GCC role is requested
- [ ] Function checks for existing GCC activity when provider role is requested
- [ ] Returns 409 Conflict with descriptive error when role conflict detected
- [ ] Returns 200 with `{ allowed: true }` when no conflict
- [ ] Uses service role key (bypasses RLS for cross-table checks)

### Machine Verification

```bash
ls supabase/functions/enforce-role/index.ts
```

### Human Verification

1. Deploy: `supabase functions deploy enforce-role`
2. Call with a user ID that has a provider profile + `requested_role: 'gcc'` → expect 409
3. Call with a new user ID + `requested_role: 'provider'` → expect 200

### Prerequisites from User

- [ ] `SUPABASE_SERVICE_ROLE_KEY` set as Edge Function secret

### State Awareness

- **Before:** Role exclusivity enforced only on frontend (guards check Clerk metadata). A user could bypass guards and insert conflicting rows.
- **After:** Backend validation prevents conflicting role operations. Called from onboarding flows and GCC operations before database writes.

### Dependencies

- **Blocked by:** Ticket #6 (Clerk JWT bridge for user identification)

---

## Ticket 9: Typed Supabase Client Helpers

### Status: `not_started`

### Description

Create a typed data access layer that wraps Supabase queries with TypeScript interfaces. These functions are the single source of truth for all database operations — every TanStack Query hook (Tickets #10–#12) calls these instead of raw Supabase queries.

### What Changes

Create `src/lib/api/` directory with the following files:

**`src/lib/api/providers.ts`** — Provider-related queries:
```typescript
import type { ProviderProfile, TspSubmission, StartupSubmission } from '@/types/provider'

export async function getProviderProfile(supabase: SupabaseClient, userId: string): Promise<ProviderProfile | null>
export async function createProviderProfile(supabase: SupabaseClient, data: Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>): Promise<ProviderProfile>
export async function updateProviderProfile(supabase: SupabaseClient, id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile>
export async function submitTspForm(supabase: SupabaseClient, data: Omit<TspSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<TspSubmission>
export async function submitStartupForm(supabase: SupabaseClient, data: Omit<StartupSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<StartupSubmission>
export async function getProviderSubmission(supabase: SupabaseClient, profileId: string): Promise<TspSubmission | StartupSubmission | null>
```

**`src/lib/api/agents.ts`** — Agent-related queries:
```typescript
import type { Agent, AgentSubmission } from '@/types/agent'

export async function getAgents(supabase: SupabaseClient, filters?: AgentFilters): Promise<{ data: Agent[]; count: number }>
export async function getAgentById(supabase: SupabaseClient, id: string): Promise<Agent | null>
export async function getAgentsByProvider(supabase: SupabaseClient, profileId: string): Promise<Agent[]>
export async function submitAgent(supabase: SupabaseClient, data: Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<AgentSubmission>
export async function getAgentSubmissions(supabase: SupabaseClient, userId: string): Promise<AgentSubmission[]>
export async function createAgentEdit(supabase: SupabaseClient, agentId: string, userId: string, payload: Record<string, unknown>): Promise<void>
export async function getAgentEdits(supabase: SupabaseClient, userId: string): Promise<AgentEdit[]>
```

**`src/lib/api/gcc.ts`** — GCC-related queries:
```typescript
import type { ProblemStatement } from '@/types/problem'

export async function getShortlist(supabase: SupabaseClient, orgId: string): Promise<ShortlistEntry[]>
export async function addToShortlist(supabase: SupabaseClient, orgId: string, agentId: string, userId: string): Promise<void>
export async function removeFromShortlist(supabase: SupabaseClient, orgId: string, agentId: string): Promise<void>
export async function getContactLogs(supabase: SupabaseClient, orgId: string): Promise<ContactLog[]>
export async function createContactLog(supabase: SupabaseClient, data: ContactLogInput): Promise<void>
export async function getProblems(supabase: SupabaseClient, orgId: string): Promise<ProblemStatement[]>
export async function getApprovedProblems(supabase: SupabaseClient): Promise<ProblemStatement[]>
export async function submitProblem(supabase: SupabaseClient, data: ProblemInput): Promise<ProblemStatement>
export async function expressInterest(supabase: SupabaseClient, data: InterestInput): Promise<void>
export async function getQuota(supabase: SupabaseClient, orgId: string): Promise<QuotaInfo>
```

**`src/lib/api/admin.ts`** — Admin-related queries:
```typescript
export async function validateAdminSession(supabase: SupabaseClient, token: string): Promise<boolean>
export async function createAdminSession(supabase: SupabaseClient, token: string, password: string): Promise<string | null>
export async function getPendingAgentSubmissions(supabase: SupabaseClient): Promise<AgentSubmission[]>
export async function getPendingProviderSubmissions(supabase: SupabaseClient): Promise<(TspSubmission | StartupSubmission)[]>
export async function getPendingProblems(supabase: SupabaseClient): Promise<ProblemStatement[]>
export async function approveAgent(supabase: SupabaseClient, submissionId: string): Promise<Agent>
export async function rejectAgent(supabase: SupabaseClient, submissionId: string, notes: string): Promise<void>
export async function approveProvider(supabase: SupabaseClient, profileId: string): Promise<void>
export async function rejectProvider(supabase: SupabaseClient, profileId: string, reason: string): Promise<void>
export async function approveProblem(supabase: SupabaseClient, problemId: string): Promise<void>
export async function rejectProblem(supabase: SupabaseClient, problemId: string, reason: string): Promise<void>
```

**`src/lib/api/storage.ts`** — File upload helpers:
```typescript
export async function uploadLogo(supabase: SupabaseClient, bucket: 'provider-logos' | 'agent-logos', userId: string, file: File): Promise<string>
export async function deleteLogo(supabase: SupabaseClient, bucket: string, path: string): Promise<void>
export async function getPublicUrl(supabase: SupabaseClient, bucket: string, path: string): string
```

### Acceptance Criteria

- [ ] `src/lib/api/` directory has 5 files: `providers.ts`, `agents.ts`, `gcc.ts`, `admin.ts`, `storage.ts`
- [ ] Every function takes `supabase: SupabaseClient` as first argument (supports both anon and auth clients)
- [ ] All functions use typed return values matching `src/types/` interfaces
- [ ] Error handling: functions throw descriptive errors on Supabase failures (not silent nulls)
- [ ] `getAgents` supports filters object for search, category, pagination
- [ ] `uploadLogo` returns the public URL of the uploaded file
- [ ] Admin functions use the service role pattern (or accept admin session token for validation)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls src/lib/api/providers.ts src/lib/api/agents.ts src/lib/api/gcc.ts src/lib/api/admin.ts src/lib/api/storage.ts
```

### Human Verification

1. Read each file and verify return types match `src/types/` interfaces
2. Confirm `getAgents` filter parameter supports: `search`, `category`, `page`, `pageSize`
3. Confirm all write operations include proper error handling

### Prerequisites from User

None — uses existing types and Supabase client.

### State Awareness

- **Before:** Only `submitEarlyAccess()` in `src/lib/supabase.ts`. No typed API layer.
- **After:** Full typed API layer covering all 17 tables. Not yet consumed by hooks (that's Tickets #10–#12).

### Dependencies

- **Blocked by:** Tickets #1–#4 (all tables must exist for type-safe queries)

---

## Ticket 10: TanStack Query Hooks — Provider Data

### Status: `not_started`

### Description

Create React hooks powered by TanStack Query for all provider-related data operations. These hooks handle caching, loading states, error states, and cache invalidation — replacing manual `useEffect` + `useState` patterns.

### What Changes

Create `src/hooks/use-provider.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { useAuth } from '@clerk/clerk-react'

// Queries
export function useProviderProfile()
  // Returns { data: ProviderProfile | null, isLoading, error }
  // Key: ['provider-profile', userId]

export function useProviderSubmission(profileId: string)
  // Returns { data: TspSubmission | StartupSubmission | null, isLoading }
  // Key: ['provider-submission', profileId]

export function useProviderRequests(profileId: string)
  // Returns { data: ProviderRequest[], isLoading }
  // Key: ['provider-requests', profileId]

// Mutations
export function useCreateProviderProfile()
  // Returns useMutation for creating profile
  // On success: invalidates ['provider-profile']

export function useSubmitTspForm()
  // Returns useMutation for TSP onboarding
  // On success: invalidates ['provider-submission'], ['provider-profile']

export function useSubmitStartupForm()
  // Returns useMutation for startup onboarding
  // On success: invalidates ['provider-submission'], ['provider-profile']

export function useUpdateProviderProfile()
  // Creates an tsp_edits record (NOT direct update)
  // On success: invalidates ['provider-profile']

export function useMarkRequestContacted()
  // Updates provider_request status to 'contacted'
  // On success: invalidates ['provider-requests']

export function useArchiveRequest()
  // Updates provider_request status to 'archived'
  // On success: invalidates ['provider-requests']
```

### Acceptance Criteria

- [ ] File exists at `src/hooks/use-provider.ts`
- [ ] All query hooks use `useSupabaseClient()` (auth-aware client)
- [ ] All query hooks return `{ data, isLoading, error }` from TanStack Query
- [ ] All mutation hooks return `{ mutate, mutateAsync, isPending, error }` from TanStack Query
- [ ] Mutations invalidate related query keys on success
- [ ] `useProviderProfile` uses `enabled: !!userId` to prevent fetching when not signed in
- [ ] `useUpdateProviderProfile` creates an `tsp_edits` record (not direct update — PRD business rule)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls src/hooks/use-provider.ts
```

### Human Verification

1. Verify each hook calls the correct API helper from `src/lib/api/providers.ts`
2. Confirm cache keys are namespaced and consistent
3. Confirm mutations invalidate the correct queries

### Prerequisites from User

None.

### State Awareness

- **Before:** No data hooks. `RequireProviderProfile` uses raw `useEffect` + `useState` for profile check.
- **After:** Full provider data layer with caching. `RequireProviderProfile` can be updated to use `useProviderProfile()` instead of raw fetch.

### Dependencies

- **Blocked by:** Ticket #9 (API helpers)

---

## Ticket 11: TanStack Query Hooks — Agent & Marketplace Data

### Status: `not_started`

### Description

Create React hooks for all agent and marketplace data operations: listing agents, searching/filtering, viewing details, submitting new agents, creating edit requests, and managing submissions.

### What Changes

Create `src/hooks/use-agents.ts`:

```typescript
// Queries
export function useAgents(filters?: AgentFilters)
  // Paginated list with search, category filter, etc.
  // Key: ['agents', filters]

export function useAgentDetail(agentId: string)
  // Single agent with full data
  // Key: ['agent', agentId]

export function useMyAgents(profileId: string)
  // Provider's approved agents
  // Key: ['my-agents', profileId]

export function useMyAgentSubmissions(userId: string)
  // Provider's pending submissions
  // Key: ['my-agent-submissions', userId]

export function useMyAgentEdits(userId: string)
  // Provider's pending edit requests
  // Key: ['my-agent-edits', userId]

// Mutations
export function useSubmitAgent()
  // Creates agent_submissions record
  // On success: invalidates ['my-agent-submissions']

export function useCreateAgentEdit()
  // Creates agent_edits record
  // On success: invalidates ['my-agent-edits']

export function useSoftDeleteAgent()
  // Sets agent.status = 'inactive'
  // On success: invalidates ['my-agents']
```

### Acceptance Criteria

- [ ] File exists at `src/hooks/use-agents.ts`
- [ ] `useAgents` supports pagination: `{ page, pageSize, search, category, integrationTypes, tags }`
- [ ] `useAgents` returns `{ data, count, isLoading }` for pagination math
- [ ] `useAgentDetail` fetches agent + joins provider profile (for contact info)
- [ ] `useSubmitAgent` calls `submitAgent()` from API helpers
- [ ] `useCreateAgentEdit` stores JSONB diff of changed fields
- [ ] `useSoftDeleteAgent` sets status to `'inactive'` (soft delete per PRD)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls src/hooks/use-agents.ts
```

### Human Verification

1. Verify `useAgents` filter types match the marketplace UI needs (search, category, pagination)
2. Confirm `useAgentDetail` includes a join to `provider_profiles` for contact info display
3. Confirm soft delete pattern (status change, not row deletion)

### Prerequisites from User

None.

### State Awareness

- **Before:** No agent data hooks.
- **After:** Complete agent data layer. Marketplace, agent detail, provider dashboard submissions tab all have their data source.

### Dependencies

- **Blocked by:** Ticket #9 (API helpers)

---

## Ticket 12: TanStack Query Hooks — GCC & Problem Data

### Status: `not_started`

### Description

Create React hooks for all GCC-facing data operations: shortlists, contact logs, problem statements, interest tracking, and quota management.

### What Changes

Create `src/hooks/use-gcc.ts`:

```typescript
// Queries
export function useShortlist(orgId: string)
  // Org-wide shortlisted agents with agent details
  // Key: ['shortlist', orgId]

export function useIsShortlisted(orgId: string, agentId: string)
  // Quick boolean check for star icon state
  // Key: ['is-shortlisted', orgId, agentId]

export function useContactLogs(orgId: string)
  // All provider contacts for the org
  // Key: ['contact-logs', orgId]

export function useMyProblems(orgId: string)
  // All problem statements submitted by org
  // Key: ['my-problems', orgId]

export function useApprovedProblems()
  // Public approved problems for /problems page
  // Key: ['approved-problems']

export function useProblemInterests(problemId: string)
  // Providers who expressed interest (admin view)
  // Key: ['problem-interests', problemId]

export function useQuota(orgId: string)
  // Remaining problem submissions this month
  // Key: ['quota', orgId]

// Mutations
export function useAddToShortlist()
  // Adds to org shortlist
  // On success: invalidates ['shortlist'], ['is-shortlisted']

export function useRemoveFromShortlist()
  // Removes from org shortlist
  // On success: invalidates ['shortlist'], ['is-shortlisted']

export function useCreateContactLog()
  // Logs a contact event + creates provider_request
  // On success: invalidates ['contact-logs']

export function useSubmitProblem()
  // Creates problem + decrements quota
  // On success: invalidates ['my-problems'], ['quota']

export function useExpressInterest()
  // Provider expresses interest in a problem
  // On success: invalidates ['problem-interests'], increments interest_count
```

### Acceptance Criteria

- [ ] File exists at `src/hooks/use-gcc.ts`
- [ ] `useShortlist` joins `agents` table to return agent details (name, category, etc.)
- [ ] `useIsShortlisted` returns a simple boolean for UI star state
- [ ] `useCreateContactLog` creates BOTH `contact_logs` and `provider_requests` entries (dual write)
- [ ] `useSubmitProblem` calls quota check before insert; returns error if exceeded
- [ ] `useExpressInterest` handles the UNIQUE constraint (one per org per problem) gracefully
- [ ] `useQuota` calculates current month string and returns `{ used, remaining, limit }`
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls src/hooks/use-gcc.ts
```

### Human Verification

1. Verify `useCreateContactLog` creates entries in both `contact_logs` and `provider_requests`
2. Confirm `useExpressInterest` catches UNIQUE constraint violation and shows "Already interested" instead of error
3. Confirm `useQuota` uses `YYYY-MM` format for `current_month` matching

### Prerequisites from User

None.

### State Awareness

- **Before:** No GCC data hooks.
- **After:** Complete GCC data layer. GCC dashboard, problems page, shortlist UI, and contact flows all have their data source.

### Dependencies

- **Blocked by:** Ticket #9 (API helpers)

---

## Ticket 13: Onboarding Step 1 — Category Selection

### Status: `not_started`

### Description

Build the first step of the provider onboarding flow. The provider selects their category: **Technology Service Provider (TSP)** or **Startup**. This determines which detailed form they see in Step 3. The current placeholder at `src/pages/provider/onboarding/CategorySelect.tsx` is replaced with a fully functional page.

### What Changes

**`src/pages/provider/onboarding/CategorySelect.tsx`** — full rewrite:

- Two large selection cards (similar to the role selection screen in AuthPage):
  - **TSP card**: Building2 icon, title "Technology Service Provider", description of what TSPs are
  - **Startup card**: Rocket icon, title "AI Startup", description of what startups are
- On selection:
  1. Call `useCreateProviderProfile()` mutation to create a `provider_profiles` row with `category`, `status: 'pending'`, and basic fields from Clerk user/org
  2. On success → navigate to `/onboarding/basics`
- If profile already exists: pre-select current category, allow re-selection
- Loading state while mutation is in progress; error toast on failure

**Visual design:**
- Centered layout via OnboardingLayout; progress indicator: Step 1 of 3
- Cards use `hover:border-purple-400 hover:shadow-md` (matching AuthPage pattern)

### Acceptance Criteria

- [ ] Page renders inside OnboardingLayout with "Step 1 of 3" indicator
- [ ] Two category cards with icons, titles, and descriptions
- [ ] Clicking a card calls the `useCreateProviderProfile` mutation
- [ ] On success, navigates to `/onboarding/basics`
- [ ] If profile exists, pre-selects current category
- [ ] Loading spinner on card while mutation is pending
- [ ] Error toast on failure
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Sign in as provider → navigate to `/onboarding/category`
2. Two cards visible with correct icons
3. Click "Technology Service Provider" → redirected to `/onboarding/basics`
4. Navigate back → TSP card is pre-selected

### Prerequisites from User

- [ ] Ticket #6 (JWT bridge) configured so writes succeed

### State Awareness

- **Before:** Placeholder page with icon and description text.
- **After:** Functional category selection that creates `provider_profiles` row.

### Dependencies

- **Blocked by:** Ticket #9 (API helpers), Ticket #10 (provider hooks)

---

## Ticket 14: Onboarding Step 2 — Basic Info Form

### Status: `not_started`

### Description

Build the second step of provider onboarding. The provider enters basic company information: Company Name, Location/HQ, and Company Size. This data updates the `provider_profiles` row created in Step 1.

### What Changes

**`src/pages/provider/onboarding/BasicInfo.tsx`** — full rewrite:

- Form with 3 fields using React Hook Form + Zod validation:
  - **Company Name** — text input, required, min 2 chars
  - **Location / HQ** — text input, required
  - **Company Size** — select: "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
- Pre-populate from existing `provider_profiles` row if returning
- "Back" → `/onboarding/category`; "Continue" → validates, updates profile, navigates to `/onboarding/form`
- Progress indicator: Step 2 of 3

### Acceptance Criteria

- [ ] Form renders with 3 fields inside OnboardingLayout
- [ ] Progress indicator shows "Step 2 of 3"
- [ ] Zod validation fires on submit with inline errors
- [ ] Pre-populated if profile already has data
- [ ] "Continue" updates `provider_profiles` and navigates to `/onboarding/form`
- [ ] "Back" navigates to `/onboarding/category`
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Navigate to `/onboarding/basics` → form renders
2. Submit empty → validation errors
3. Fill all fields → "Continue" → redirected to `/onboarding/form`
4. Navigate back → fields pre-populated

### Prerequisites from User

None.

### State Awareness

- **Before:** Placeholder page.
- **After:** Functional basic info form updating `provider_profiles`.

### Dependencies

- **Blocked by:** Ticket #13 (Step 1 creates the profile row)

---

## Ticket 15: Onboarding Step 3 — TSP 5-Page Wizard

### Status: `not_started`

### Description

Build the detailed submission form for TSPs. A 5-page wizard with inline Zod validation, logo upload, and multi-step navigation. On submit, creates an `tsp_submissions` record and redirects to the Provider Dashboard.

### What Changes

**`src/pages/provider/onboarding/DetailedForm.tsx`** — full rewrite:

Reads provider's `category`. If `tsp`, renders the TSP wizard. If `startup`, renders Startup wizard (Ticket #16).

**TSP Wizard — 5 pages:**
| Page | Fields |
|------|--------|
| 1 — Company Profile | Logo upload, website, founding year, about text |
| 2 — AI-First Positioning | Core positioning, AI-first definition, differentiators |
| 3 — Capabilities | AI-enabled workflows, governance frameworks, service offerings |
| 4 — Track Record | GCCs enabled count, impact metrics, case studies, recognitions |
| 5 — Vision & Contact | Agent-native vision, expansion plans, contact name/email/phone |

**Wizard behavior:**
- Back/Next navigation with per-page Zod validation
- Progress bar (pages 1–5)
- Logo upload to `provider-logos` bucket
- On final Submit: creates `tsp_submissions`, updates `provider_profiles`, redirects to `/provider`

### Acceptance Criteria

- [ ] 5-page wizard with correct fields per PRD Section 3.2
- [ ] Progress bar, per-page validation, back/next navigation
- [ ] Logo upload with preview, stored in Supabase Storage
- [ ] "Back" preserves form data
- [ ] Submit creates `tsp_submissions` row
- [ ] Redirect to `/provider` after submission
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Sign in as TSP provider → complete onboarding to Step 3
2. Wizard loads Page 1; upload logo; fill fields; Next
3. Complete all 5 pages; Submit → redirected to `/provider`
4. Check Supabase → `tsp_submissions` row exists

### Prerequisites from User

- [ ] Ticket #5 (Storage buckets) applied

### State Awareness

- **Before:** Placeholder page.
- **After:** Fully functional 5-page TSP onboarding wizard.

### Dependencies

- **Blocked by:** Ticket #2 (tsp_submissions table), Ticket #5 (storage), Ticket #14 (Step 2)

---

## Ticket 16: Onboarding Step 3 — Startup 5-Page Wizard

### Status: `not_started`

### Description

Build the detailed submission form for Startups. Same wizard shell as TSP but with different fields per PRD Section 3.2.

### What Changes

**`src/pages/provider/onboarding/DetailedForm.tsx`** — add startup path:

**Startup Wizard — 5 pages:**
| Page | Fields |
|------|--------|
| 1 — Company Profile | Logo, website, founding year, funding stage |
| 2 — Product & Technology | Product description, AI capabilities, tech stack |
| 3 — Market & Traction | Target industries, customer segments, key metrics |
| 4 — Compliance & Security | Certifications, data privacy, security measures |
| 5 — Contact | Contact name/email/phone, partnership interests |

On Submit: creates `startup_submissions`, redirects to `/provider`.

### Acceptance Criteria

- [ ] Startup wizard renders when `category === 'startup'`
- [ ] 5 pages with correct fields per PRD Section 3.2
- [ ] Funding stage dropdown (Pre-seed, Seed, Series A/B/C+, Bootstrapped)
- [ ] Same wizard shell and behavior as TSP form
- [ ] Submit creates `startup_submissions` row
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Sign in as startup provider → onboarding Step 3 shows startup fields
2. Complete all 5 pages → submit → redirected to `/provider`
3. Check Supabase → `startup_submissions` row exists

### Prerequisites from User

None.

### State Awareness

- **Before:** DetailedForm only handles TSP.
- **After:** Both TSP and startup paths functional.

### Dependencies

- **Blocked by:** Ticket #2 (startup_submissions table), Ticket #5 (storage), Ticket #14 (Step 2)

---

## Ticket 17: Provider Dashboard Shell + Pending Banner

### Status: `not_started`

### Description

Build the Provider Dashboard with 3-tab layout and conditional approval banners. When pending, the provider sees limited functionality. When approved, all tabs are interactive.

### What Changes

**`src/pages/provider/ProviderDashboard.tsx`** — full rewrite:

- Tab navigation: **Requests** | **Submissions** | **Profile**
- **Pending banner** (amber): *"Your profile is under review (3–5 business days)."*
  - "List Agent" button disabled; Requests tab shows empty state
- **Rejected banner** (red): *"Profile not approved. Reason: [notes]."* + resubmit option
- **Approved**: no banner, all tabs active
- Uses `useProviderProfile()` hook

### Acceptance Criteria

- [ ] 3-tab layout inside AppLayout
- [ ] Pending banner with amber styling
- [ ] Rejected banner with red styling + admin notes
- [ ] "List Agent" disabled during pending
- [ ] Approved: no banner, all tabs active
- [ ] Loading spinner while profile loads
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Pending provider → amber banner, disabled "List Agent"
2. Approved provider → no banner, all tabs active
3. Tab switching works

### Prerequisites from User

- [ ] Test providers with varying statuses in Supabase

### State Awareness

- **Before:** Placeholder page.
- **After:** Dashboard shell. Tab content built in Tickets #18–#20.

### Dependencies

- **Blocked by:** Ticket #10 (provider hooks)

---

## Ticket 18: Provider Dashboard — Requests Tab

### Status: `not_started`

### Description

Build the Requests tab showing inbound contact requests from GCC users. Providers can mark requests as "contacted" or archive them.

### What Changes

**Create `src/components/provider/RequestsTab.tsx`:**

- Table: GCC Email, Agent Name, Date, Status Badge, Actions
- Status badges: New (blue), Contacted (green), Archived (gray)
- Actions: "Mark as Contacted", "Archive"
- Empty state: *"No contact requests yet."*
- Data: `useProviderRequests(profileId)`

### Acceptance Criteria

- [ ] Table shows inbound requests with all columns
- [ ] Status badges update on action
- [ ] Empty state for no requests
- [ ] Responsive layout
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider with requests → table shows entries
2. "Mark as Contacted" → badge changes
3. No requests → empty state

### Prerequisites from User

- [ ] Test data in `provider_requests` table

### State Awareness

- **Before:** Empty tab.
- **After:** Functional requests management.

### Dependencies

- **Blocked by:** Ticket #3 (provider_requests table), Ticket #17 (dashboard shell)

---

## Ticket 19: Provider Dashboard — Submissions Tab

### Status: `not_started`

### Description

Build the Submissions tab with three sub-sections: My Agents (approved), Pending Submissions (awaiting review), and Edit Requests (pending changes).

### What Changes

**Create `src/components/provider/SubmissionsTab.tsx`:**

**My Agents:** Grid of approved agents; actions: View, Edit, Delete (soft, with confirmation)
**Pending Submissions:** List with status badges; admin notes for rejected/changes_requested
**Edit Requests:** List with status badges and admin notes
**"List Your Agent" CTA:** Links to `/list-your-agent`, disabled if not approved

Data: `useMyAgents()`, `useMyAgentSubmissions()`, `useMyAgentEdits()`

### Acceptance Criteria

- [ ] Three sub-sections with correct data
- [ ] Delete shows confirmation modal → soft delete
- [ ] Pending submissions show admin notes
- [ ] "List Your Agent" disabled if not approved
- [ ] Empty states per section
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider with agents → cards with View/Edit/Delete
2. Delete → confirmation → agent inactive
3. "List Your Agent" → navigates to wizard

### Prerequisites from User

- [ ] Test data: agents, submissions, edits

### State Awareness

- **Before:** Empty tab.
- **After:** Full agent management center.

### Dependencies

- **Blocked by:** Ticket #11 (agent hooks), Ticket #17 (dashboard shell)

---

## Ticket 20: Provider Dashboard — Profile Tab

### Status: `not_started`

### Description

Build the Profile tab with view and edit modes. Edits create `tsp_edits` records for admin review — the live profile stays unchanged until approved.

### What Changes

**Create `src/components/provider/ProfileTab.tsx`:**

**View mode:** Read-only display of all profile + submission fields, logo, status badge
**Edit mode:** Inline form, pre-populated; "Save Changes" computes JSONB diff → creates `tsp_edits`
**Pending edits banner:** Shown when edit requests in progress

### Acceptance Criteria

- [ ] View mode shows all profile data
- [ ] "Edit Profile" toggles to edit form
- [ ] "Save Changes" creates `tsp_edits` row with diff (NOT direct update)
- [ ] Toast confirms edit request submitted
- [ ] Pending edits banner when requests exist
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Profile tab shows data read-only
2. Edit → change name → save → `tsp_edits` row created
3. Live profile UNCHANGED

### Prerequisites from User

- [ ] Test provider with completed onboarding

### State Awareness

- **Before:** Empty tab.
- **After:** Profile view + edit-request flow.

### Dependencies

- **Blocked by:** Ticket #2 (tsp_edits table), Ticket #5 (logo storage), Ticket #17 (dashboard shell)

---

## Ticket 21: Agent Listing 5-Page Wizard

### Status: `not_started`

### Description

Build the agent listing wizard at `/list-your-agent`. A 5-page form for approved providers to describe a new AI agent. Creates `agent_submissions` for admin review.

### What Changes

**`src/pages/provider/ListAgent.tsx`** — full rewrite:

| Page | Key Fields |
|------|-----------|
| 1 — Basics | Agent name, tagline, description, category (25 options), logo |
| 2 — Use Cases & Industries | Dynamic use cases (title+desc), industry multi-select |
| 3 — How It Works | Workflow, integration type, data requirements, platforms |
| 4 — Benefits & Impact | Dynamic impact metrics (type, value, description) |
| 5 — Extras | Demo URL, compliance certs, security features |

Same wizard pattern as onboarding. On submit: `agent_submissions` row → redirect to dashboard.

### Acceptance Criteria

- [ ] 5 pages with correct fields per PRD Section 3.6
- [ ] Category select shows 25 categories
- [ ] Dynamic add/remove for use cases and impact metrics
- [ ] Logo upload to `agent-logos` bucket
- [ ] Per-page Zod validation
- [ ] Submit creates `agent_submissions` row
- [ ] Only accessible by approved providers
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Approved provider → `/list-your-agent` → 5-page wizard
2. Fill all pages → submit → redirected to dashboard
3. Check `agent_submissions` in Supabase

### Prerequisites from User

- [ ] Approved provider profile

### State Awareness

- **Before:** Placeholder page.
- **After:** Full agent listing wizard.

### Dependencies

- **Blocked by:** Ticket #5 (logo storage), Ticket #11 (agent hooks)

---

## Ticket 22: Agent Edit Flow

### Status: `not_started`

### Description

Build the edit page at `/provider/agents/:agentId/edit`. Creates `agent_edits` records with JSONB diffs. Live agent remains unchanged until admin approval.

### What Changes

**`src/pages/provider/EditAgent.tsx`** — full rewrite:

- Fetches agent via `useAgentDetail(agentId)`
- Verifies ownership (agent's `provider_profile_id` matches current user's profile)
- Renders same 5-page wizard as ListAgent, pre-populated
- On submit: computes diff → creates `agent_edits` row
- Non-owner redirected to `/provider` with error

### Acceptance Criteria

- [ ] Form pre-populated with current agent data
- [ ] Only changed fields in JSONB diff payload
- [ ] Creates `agent_edits` row (NOT direct update)
- [ ] Ownership verified
- [ ] Non-owner redirected
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider → edit approved agent → change description → submit
2. `agent_edits` row has diff; `agents` table UNCHANGED

### Prerequisites from User

- [ ] Approved agent owned by test provider

### State Awareness

- **Before:** Placeholder page.
- **After:** Edit flow creates change requests.

### Dependencies

- **Blocked by:** Ticket #3 (agent_edits table), Ticket #11 (agent hooks), Ticket #21 (wizard components)

---

## Ticket 23: Marketplace Listing Page

### Status: `not_started`

### Description

Build the marketplace at `/marketplace` with search, filters, pagination (12/page), and responsive agent card grid.

### What Changes

**`src/pages/marketplace/MarketplaceListing.tsx`** — full rewrite:

- **Search bar:** full-text search on name, description, tags
- **Filters:** Category (25), integration type, tags — as dismissible chips
- **Agent grid:** 12/page, responsive (1→2→3 cols)
- **Agent card:** logo, name, provider, category badge, rating, description, tags, actions
- **Pagination:** page numbers, prev/next, URL-synced
- **Empty/loading states**
- Data: `useAgents(filters)` with pagination

### Acceptance Criteria

- [ ] Responsive grid of agent cards
- [ ] Search filters by name/description/tags
- [ ] Category filter works
- [ ] Pagination with 12 per page, URL-synced
- [ ] Shortlist star visible for GCC users only
- [ ] Skeleton loading state
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/marketplace` → grid loads
2. Search → filters in real-time
3. Category select → results update
4. Page 2 → URL updates

### Prerequisites from User

- [ ] 15+ approved agents for pagination testing

### State Awareness

- **Before:** Placeholder page.
- **After:** Full marketplace with search/filter/paginate.

### Dependencies

- **Blocked by:** Ticket #11 (agent hooks with pagination)

---

## Ticket 24: Agent Detail Page

### Status: `not_started`

### Description

Build the full agent detail page at `/marketplace/agent/:agentId` with hero, overview, use cases, industries, integration, impact metrics, demo, and compliance sections.

### What Changes

**`src/pages/marketplace/AgentDetail.tsx`** — full rewrite:

- **Hero:** logo, name, tagline, provider info, category, rating, shortlist + contact buttons
- **Sections:** Overview, Use Cases (cards), Industries (chips), How It Works, Integration (type + platforms), Impact Metrics (stat cards), Demo link, Compliance badges
- **Provider sidebar:** logo, company name, location, contact button
- **404 handling** for invalid/inactive agents
- Data: `useAgentDetail(agentId)` with provider join

### Acceptance Criteria

- [ ] All 8 content sections render
- [ ] Use cases as cards, impact metrics as stat cards
- [ ] Contact + shortlist buttons present
- [ ] Provider info sidebar
- [ ] 404 for invalid agent
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Valid agent → full detail page
2. Invalid ID → 404 page
3. Mobile responsive

### Prerequisites from User

- [ ] Agent with populated use_cases, impact_metrics, industries

### State Awareness

- **Before:** Placeholder showing agent ID.
- **After:** Rich agent detail page.

### Dependencies

- **Blocked by:** Ticket #11 (agent detail hook)

---

## Ticket 25: Contact Provider Modal + Logging

### Status: `not_started`

### Description

Build the "Contact Provider" modal showing provider contact info. Logs events to `contact_logs` and `provider_requests`.

### What Changes

**Create `src/components/shared/ContactProviderModal.tsx`:**

- Shows: provider name, logo, contact email, website
- Actions: "Email Provider" (mailto), "Copy Email" (clipboard + toast), "Visit Website" (new tab)
- On open: creates `contact_logs` + `provider_requests` entries
- Auth guard: GCC-only; unauthenticated → redirect to `/auth`

### Acceptance Criteria

- [ ] Modal shows provider contact info
- [ ] All 3 action buttons work
- [ ] Contact logged to both tables
- [ ] GCC-only guard
- [ ] Dismissible via X, ESC, backdrop
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → agent detail → "Contact Provider" → modal opens
2. "Copy Email" → clipboard + toast
3. Check `contact_logs` and `provider_requests` tables

### Prerequisites from User

- [ ] Agent with provider contact info

### State Awareness

- **Before:** Contact button non-functional.
- **After:** Full contact flow with logging.

### Dependencies

- **Blocked by:** Ticket #3 (tables), Ticket #12 (GCC hooks), Ticket #24 (detail page)

---

## Ticket 26: Shortlist Management

### Status: `not_started`

### Description

Build org-wide agent shortlisting with star icon toggle on marketplace cards and detail pages.

### What Changes

**Create `src/components/shared/ShortlistButton.tsx`:**
- Star icon: outlined/filled based on `useIsShortlisted(orgId, agentId)`
- Toggle via `useAddToShortlist()` / `useRemoveFromShortlist()`
- Optimistic update; GCC-only; records `created_by_user_id`

**Integrate into:** `MarketplaceListing.tsx` and `AgentDetail.tsx`

### Acceptance Criteria

- [ ] Star toggles shortlist state
- [ ] Optimistic update (instant visual feedback)
- [ ] Org-wide (shared across org members)
- [ ] UNIQUE constraint handled gracefully
- [ ] Hidden for non-GCC users
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → marketplace → star agent → star fills
2. Agent detail → star also filled
3. Another org member → same agent starred

### Prerequisites from User

- [ ] GCC user with Clerk organization

### State Awareness

- **Before:** Star icons non-functional.
- **After:** Full shortlist management.

### Dependencies

- **Blocked by:** Ticket #3 (agent_shortlists table), Ticket #12 (GCC hooks)

---

## Ticket 27: GCC Dashboard Shell

### Status: `not_started`

### Description

Build the GCC Dashboard at `/gcc-dashboard` with a 3-tab layout: Shortlisted Agents, Current Requests, and Problem Hub. GCC users get instant access after signup — no onboarding or approval required.

### What Changes

**`src/pages/gcc/GCCDashboard.tsx`** — full rewrite:

- Tab navigation: **Shortlisted Agents** | **Current Requests** | **Problem Hub**
- Welcome banner (first-time users): *"Welcome to Orbys360! Start by exploring the Agent Marketplace or posting a Problem Statement."*
- Quick stats strip: X shortlisted agents, Y active requests, Z problem statements
- Uses `useOrganization()` from Clerk for org-scoped data
- Each tab renders its own component (built in Tickets #28–#30)

### Acceptance Criteria

- [ ] 3-tab layout inside AppLayout
- [ ] Quick stats strip at top
- [ ] Welcome banner for new users (no shortlist/requests/problems yet)
- [ ] Tab switching works
- [ ] Uses org scope from Clerk
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Sign in as GCC → `/gcc-dashboard` → 3 tabs visible
2. New user → welcome banner shows
3. Tab switching works smoothly

### Prerequisites from User

- [ ] GCC test user with Clerk organization

### State Awareness

- **Before:** Placeholder page.
- **After:** Dashboard shell. Tab content in Tickets #28–#30.

### Dependencies

- **Blocked by:** Ticket #12 (GCC hooks)

---

## Ticket 28: GCC Dashboard — Shortlisted Agents Tab

### Status: `not_started`

### Description

Build the Shortlisted Agents tab showing the org-wide list of saved agents. Shows agent name, category, who added it, and date. Actions: View details, Contact provider, Remove from shortlist.

### What Changes

**Create `src/components/gcc/ShortlistedAgentsTab.tsx`:**

- Table/card list of shortlisted agents
- Columns: Agent Name, Category, Added By, Date Added, Actions
- Actions: "View Details" (link), "Contact Provider" (opens modal), "Remove" (with undo toast)
- Empty state: *"No agents shortlisted yet. Browse the marketplace to find AI agents."* + CTA to `/marketplace`
- Data: `useShortlist(orgId)` — joins agents table for details

### Acceptance Criteria

- [ ] Shows org-wide shortlisted agents with details
- [ ] "Added By" shows the user who added each agent
- [ ] "View Details" navigates to agent detail page
- [ ] "Contact Provider" opens contact modal
- [ ] "Remove" removes from shortlist with undo toast
- [ ] Empty state with marketplace CTA
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC with shortlisted agents → table shows entries
2. "Remove" → agent removed, undo toast appears
3. No agents → empty state with marketplace link

### Prerequisites from User

- [ ] Test data: shortlisted agents

### State Awareness

- **Before:** Empty tab.
- **After:** Functional shortlist management.

### Dependencies

- **Blocked by:** Ticket #26 (shortlist feature), Ticket #27 (dashboard shell)

---

## Ticket 29: GCC Dashboard — Current Requests Tab

### Status: `not_started`

### Description

Build the Current Requests tab showing all providers the GCC has contacted. Tracks contact history and follow-up status.

### What Changes

**Create `src/components/gcc/CurrentRequestsTab.tsx`:**

- Table of contact log entries
- Columns: Agent Name, Provider Name, Contact Date, Status
- Status derived from `provider_requests.status` (New, Contacted, Archived)
- Empty state: *"No provider contacts yet. Find agents in the marketplace and reach out."*
- Data: `useContactLogs(orgId)` — joins agents + provider_profiles

### Acceptance Criteria

- [ ] Shows all contact history for the org
- [ ] Agent and provider names resolved from joins
- [ ] Contact date formatted
- [ ] Empty state with marketplace CTA
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC with contacts → table shows entries with dates
2. No contacts → empty state

### Prerequisites from User

- [ ] Test data: contact logs

### State Awareness

- **Before:** Empty tab.
- **After:** Contact history view.

### Dependencies

- **Blocked by:** Ticket #25 (contact flow), Ticket #27 (dashboard shell)

---

## Ticket 30: GCC Dashboard — Problem Hub Tab

### Status: `not_started`

### Description

Build the Problem Hub tab where GCC users submit and manage problem statements. Shows all submitted problems with status badges, provider interest counts, and actions.

### What Changes

**Create `src/components/gcc/ProblemHubTab.tsx`:**

- "Submit Problem Statement" button → opens modal (Ticket #31)
- Quota indicator: "X of 20 problems remaining this month"
- Problem list with status badges:
  - **Pending Review** (yellow)
  - **Approved** (green) — with provider interest count
  - **Rejected** (red) — with admin rejection reason
- Actions: View details, Delete (soft)
- Empty state: *"No problem statements submitted. Post your first challenge."*
- Data: `useMyProblems(orgId)`, `useQuota(orgId)`

### Acceptance Criteria

- [ ] "Submit Problem Statement" button present
- [ ] Quota indicator shows remaining submissions
- [ ] Problems listed with status badges
- [ ] Approved problems show interest count
- [ ] Rejected problems show admin reason
- [ ] Delete with confirmation modal
- [ ] Empty state
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → Problem Hub → sees submitted problems
2. Approved problem shows interest count badge
3. Rejected problem shows reason
4. Quota indicator shows correct count

### Prerequisites from User

- [ ] Test data: problems with varying statuses

### State Awareness

- **Before:** Empty tab.
- **After:** Problem management hub.

### Dependencies

- **Blocked by:** Ticket #12 (GCC hooks), Ticket #27 (dashboard shell)

---

## Ticket 31: Problem Statement Submission Form

### Status: `not_started`

### Description

Build the problem statement submission modal that opens from the Problem Hub. A form with 7 fields per PRD Section 4.7. On submit, creates a `problem_statements` record and decrements the monthly quota.

### What Changes

**Create `src/components/gcc/ProblemSubmitModal.tsx`:**

**Form fields (React Hook Form + Zod):**
| Field | Type | Validation |
|-------|------|------------|
| Title | Text input | 10–200 chars |
| Description | Textarea | 100–5000 chars |
| Category | Select | Required (Operations, Finance, HR, etc.) |
| Industry | Text input | Required (publicly visible) |
| Desired Outcome | Textarea | Required |
| Timeline | Select | Immediate / Short (1–3 mo) / Medium (3–6 mo) / Long (6+ mo) |
| Budget Range | Select | <$10K / $10–50K / $50–100K / $100K+ / Open to discuss |

**On submit:**
1. Check quota via `useQuota()` — if exceeded, show: *"Monthly limit reached. Resets on [date]."*
2. Call `useSubmitProblem()` mutation
3. Creates `problem_statements` row with `status: 'pending_review'`
4. Decrements quota
5. Success toast: *"Problem statement submitted for review!"*
6. Closes modal, refreshes problem list

### Acceptance Criteria

- [ ] Modal with 7 form fields matching PRD Section 4.7
- [ ] Zod validation with inline errors
- [ ] Quota check before submit
- [ ] Quota exceeded → blocks submission with message showing reset date
- [ ] Submit creates `problem_statements` row with `status: 'pending_review'`
- [ ] Success toast + modal closes
- [ ] Problem list refreshes
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → Problem Hub → "Submit Problem" → modal opens
2. Fill form → submit → toast + modal closes
3. New problem appears in list with "Pending Review" badge
4. Check Supabase → `problem_statements` row exists

### Prerequisites from User

None.

### State Awareness

- **Before:** No submission form.
- **After:** Functional problem submission with quota enforcement.

### Dependencies

- **Blocked by:** Ticket #3 (problem_statements table), Ticket #12 (GCC hooks)

---

## Ticket 32: Problems Public Listing Page

### Status: `not_started`

### Description

Build the public problems listing at `/problems`. Shows approved, anonymous problem statements that providers can browse and express interest in. GCC company names are hidden — only industry is shown.

### What Changes

**`src/pages/content/ProblemsListing.tsx`** — full rewrite:

- Grid/list of approved `problem_statements` (public query — `status: 'approved'`)
- Each card shows:
  - Title
  - Description (truncated)
  - Industry badge (NOT company name — anonymity rule)
  - Category badge
  - Timeline badge
  - Budget range
  - Interest count: "X providers interested"
  - "Express Interest" button (providers only)
- Search by title/description
- Filter by category, timeline
- Empty state: *"No problem statements available."*
- Data: `useApprovedProblems()` — public query

### Acceptance Criteria

- [ ] Shows only approved problems
- [ ] Company name NOT visible (only industry)
- [ ] Interest count displayed
- [ ] "Express Interest" visible for signed-in providers
- [ ] "Express Interest" hidden for GCC users and anonymous
- [ ] Search and filter work
- [ ] Cards show title, description, industry, category, timeline, budget
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/problems` → list of approved problems
2. No company names visible (verify anonymity)
3. Sign in as provider → "Express Interest" buttons appear
4. Sign in as GCC → no "Express Interest" buttons

### Prerequisites from User

- [ ] Approved problem statements in Supabase

### State Awareness

- **Before:** Placeholder page.
- **After:** Public problem marketplace.

### Dependencies

- **Blocked by:** Ticket #11 (agent hooks — reusable patterns), Ticket #12 (GCC hooks for problem data)

---

## Ticket 33: Express Interest Flow

### Status: `not_started`

### Description

Build the "Express Interest" flow for providers. When a provider clicks "Express Interest" on a problem statement, a record is created in `problem_statement_interests`, the interest count increments, and the button becomes disabled ("Interested").

### What Changes

**Create `src/components/problems/ExpressInterestButton.tsx`:**

- Default state: "Express Interest" button (enabled for providers)
- After clicking: calls `useExpressInterest()` mutation
- Creates `problem_statement_interests` row
- Increments `problem_statements.interest_count`
- Button changes to "Interested" (disabled, green badge)
- UNIQUE constraint (one per org per problem): if already interested, button shows "Interested" on load
- Uses `useOrganization()` to scope to provider's org

**Integrate into:** `ProblemsListing.tsx` cards

### Acceptance Criteria

- [ ] Provider clicks "Express Interest" → record created
- [ ] Interest count increments on the card
- [ ] Button changes to "Interested" (disabled)
- [ ] Already-interested providers see "Interested" on page load
- [ ] UNIQUE constraint violation handled gracefully
- [ ] Only one interest per org per problem
- [ ] Admin can see interested providers (data stored for Ticket #38)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider → `/problems` → click "Express Interest"
2. Button changes to "Interested", count increments
3. Refresh page → still shows "Interested"
4. Different org member → can also express interest independently

### Prerequisites from User

- [ ] Approved problems in Supabase

### State Awareness

- **Before:** "Express Interest" button non-functional.
- **After:** Full interest tracking with deduplication.

### Dependencies

- **Blocked by:** Ticket #3 (problem_statement_interests table), Ticket #32 (problems listing)

---

## Ticket 34: Monthly Quota Enforcement

### Status: `not_started`

### Description

Build the monthly problem statement quota system. Each GCC organization gets 20 submissions per month. The quota resets on the 1st of each month. When exceeded, submissions are blocked with a message showing the reset date.

### What Changes

**Enhance `useSubmitProblem()` in `src/hooks/use-gcc.ts`:**

1. Before insert, query `gcc_problem_submission_quota` for current org + current month
2. If no row exists: create one with `submissions_this_month: 0`, `quota_limit: 20`
3. If `submissions_this_month >= quota_limit`: throw error with reset date
4. If under limit: proceed with insert, then increment `submissions_this_month`

**Update `src/components/gcc/ProblemSubmitModal.tsx`:**
- Show quota status in modal header: "X of 20 remaining"
- If quota exceeded: disable submit button, show: *"Monthly limit reached. Resets on [reset_date]."*

**Month format:** `YYYY-MM` (e.g., `"2026-02"`)
**Reset logic:** Query uses `current_month` string. When month changes, the first query for the new month finds no row → creates fresh one.

### Acceptance Criteria

- [ ] Quota check before each problem submission
- [ ] New quota row auto-created for new month
- [ ] Counter increments on successful submission
- [ ] Submission blocked when quota reached
- [ ] Quota status shown in submit modal
- [ ] Reset date calculated correctly (1st of next month)
- [ ] Quota is per-organization (not per-user)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → submit 1 problem → quota shows "19 of 20 remaining"
2. Manually set `submissions_this_month` to 20 in Supabase
3. Try to submit → blocked with reset date message

### Prerequisites from User

None.

### State Awareness

- **Before:** No quota enforcement.
- **After:** Quota enforced per-org per-month with auto-reset.

### Dependencies

- **Blocked by:** Ticket #3 (gcc_problem_submission_quota table), Ticket #31 (submit form)

---

## Ticket 35: Admin Session Auth

### Status: `not_started`

### Description

Build the admin authentication system. Admin navigates to `/admin/:secretToken`, enters a password, and gets a session token stored in `admin_sessions`. No Clerk account required — admin uses a simple token-based system.

### What Changes

**`src/pages/admin/AdminDashboard.tsx`** — full rewrite (auth gate + dashboard):

**Auth gate (pre-login):**
- Reads `:secretToken` from URL params
- Shows a password input field
- On submit: calls a validation function that:
  1. Checks `secretToken` against env var or hardcoded hash
  2. Creates `admin_sessions` row with a generated session token + 24h expiry
  3. Stores session token in `localStorage`
- On success: renders the dashboard
- On failure: shows error "Invalid credentials"

**Session persistence:**
- On page load: check `localStorage` for session token
- Validate against `admin_sessions` (check exists + not expired)
- If valid: skip login, show dashboard
- If expired: clear localStorage, show login

**Logout:** Button that clears localStorage and deletes session row

### Acceptance Criteria

- [ ] `/admin/:token` shows password input
- [ ] Correct password → session created, dashboard renders
- [ ] Incorrect password → error message
- [ ] Session persists across page reloads (localStorage)
- [ ] Expired sessions require re-authentication
- [ ] Logout clears session
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Navigate to `/admin/test-token` → password input shows
2. Enter correct password → dashboard loads
3. Refresh page → still authenticated
4. Click logout → password input shows again

### Prerequisites from User

- [ ] **Admin password/secret** decided and configured (env var or Supabase secret)

### State Awareness

- **Before:** Placeholder page.
- **After:** Session-based admin auth. No Clerk dependency.

### Dependencies

- **Blocked by:** Ticket #1 (admin_sessions table)

---

## Ticket 36: Admin Dashboard — Agents Tab

### Status: `not_started`

### Description

Build the Agents tab of the Admin Dashboard. Shows a queue of pending `agent_submissions`. Admin can view full details, approve (creates live `agents` record), reject (with notes), or request changes.

### What Changes

**Create `src/components/admin/AgentsTab.tsx`:**

- Table of pending agent submissions
- Columns: Agent Name, Provider Name, Category, Submitted Date, Status, Actions
- Click row → expands to show full submission details (all 5 wizard pages of data)
- Provider identity visible (name, email, org)
- Actions:
  - **Approve:** Creates new `agents` row from submission data → `submission_status` → `'approved'`
  - **Reject:** Opens notes input → `submission_status` → `'rejected'` with admin_notes
  - **Request Changes:** Opens notes input → `submission_status` → `'changes_requested'` with admin_notes
  - **Delete:** Hard delete with confirmation

- Data: `getPendingAgentSubmissions()` via admin Supabase client (service role or admin session)

### Acceptance Criteria

- [ ] Table shows pending agent submissions
- [ ] Expandable rows with full submission details
- [ ] Approve creates live `agents` record
- [ ] Reject stores admin notes
- [ ] Request Changes stores admin notes
- [ ] Provider identity visible (not just user ID)
- [ ] List updates after action (invalidate query)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Admin → Agents tab → pending submissions visible
2. Click "Approve" → live agent created (visible in marketplace)
3. Click "Reject" → notes saved, submission marked rejected
4. Provider dashboard shows rejection + notes

### Prerequisites from User

- [ ] Pending agent submissions in Supabase

### State Awareness

- **Before:** No admin agent review.
- **After:** Full agent approval workflow.

### Dependencies

- **Blocked by:** Ticket #11 (agent data hooks), Ticket #35 (admin auth)

---

## Ticket 37: Admin Dashboard — Providers Tab

### Status: `not_started`

### Description

Build the Providers tab of the Admin Dashboard. Shows pending `tsp_submissions` and `startup_submissions`. Admin can approve (updates `provider_profiles.status`) or reject (with reason).

### What Changes

**Create `src/components/admin/ProvidersTab.tsx`:**

- Table of pending provider submissions (both TSP and startup)
- Columns: Company Name, Category (TSP/Startup), Submitted Date, Status, Actions
- Click row → shows full onboarding form data
- Actions:
  - **Approve:** Updates `submission_status` → `'approved'`; updates `provider_profiles.status` → `'approved'`
  - **Reject:** Notes input → `submission_status` → `'rejected'`; `provider_profiles.status` → `'rejected'` with reason

### Acceptance Criteria

- [ ] Shows both TSP and startup pending submissions
- [ ] Full form data visible on expand
- [ ] Approve updates both submission and provider profile
- [ ] Reject stores reason on both tables
- [ ] Provider sees status change on their dashboard
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Admin → Providers tab → pending submissions
2. Approve → provider profile status changes to 'approved'
3. Provider logs in → no more pending banner

### Prerequisites from User

- [ ] Pending TSP/startup submissions

### State Awareness

- **Before:** No admin provider review.
- **After:** Full provider approval workflow.

### Dependencies

- **Blocked by:** Ticket #10 (provider hooks), Ticket #35 (admin auth)

---

## Ticket 38: Admin Dashboard — Problems Tab

### Status: `not_started`

### Description

Build the Problems tab of the Admin Dashboard. Shows pending problem statements, full GCC identity (hidden from public), interested providers, and facilitation controls.

### What Changes

**Create `src/components/admin/ProblemsTab.tsx`:**

- Table of pending `problem_statements`
- Full problem details + **GCC identity** (company name, email — hidden from public view)
- For approved problems: shows list of interested providers (org name, email, timestamp from `problem_statement_interests`)
- Actions:
  - **Approve:** `status` → `'approved'`
  - **Reject:** Notes input → `status` → `'rejected'` with `rejection_reason`
  - **Remove:** Soft delete
  - **Facilitate Introduction:** Button that shows both GCC + provider contact info side-by-side (admin copies and emails manually)

### Acceptance Criteria

- [ ] Pending problems visible with full details
- [ ] GCC identity shown (admin can see what public cannot)
- [ ] Approved problems show interested provider list
- [ ] Approve/Reject/Remove actions work
- [ ] "Facilitate Introduction" shows both party contacts
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Admin → Problems tab → pending problems with GCC identity
2. Approve → problem visible on `/problems`
3. Approved problem with interests → provider list shown

### Prerequisites from User

- [ ] Pending problems and interest records

### State Awareness

- **Before:** No admin problem review.
- **After:** Full problem approval + facilitation workflow.

### Dependencies

- **Blocked by:** Ticket #12 (GCC/problem hooks), Ticket #35 (admin auth)

---

## Ticket 39: Admin — Agent Edit Reviews

### Status: `not_started`

### Description

Build the admin UI for reviewing agent edit requests. When a provider edits an approved agent, the change creates an `agent_edits` record. This ticket adds a review interface in the Admin Dashboard. (Addresses the "Admin UI for reviewing agent edits" gap from PRD Section 9.)

### What Changes

**Add sub-tab or section to `src/components/admin/AgentsTab.tsx`:**

- Section: "Pending Edit Requests"
- Table: Agent Name, Provider, Edit Date, Status, Actions
- Click row → shows side-by-side diff: **Current Values** vs **Proposed Changes** (from `payload` JSONB)
- Actions:
  - **Approve:** Merges `payload` into live `agents` row → `agent_edits.status` → `'approved'`
  - **Reject:** Notes → `agent_edits.status` → `'rejected'`

### Acceptance Criteria

- [ ] Pending edit requests visible in Agents tab
- [ ] Side-by-side diff view (current vs proposed)
- [ ] Approve merges changes into live agent
- [ ] Reject stores admin notes
- [ ] Provider sees edit status update in dashboard
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider edits an agent → admin sees edit request
2. Admin approves → live agent updated with new values
3. Admin rejects → edit marked rejected with notes

### Prerequisites from User

- [ ] Pending `agent_edits` records

### State Awareness

- **Before:** Agent edits create records but no admin UI to review them.
- **After:** Complete edit review workflow.

### Dependencies

- **Blocked by:** Ticket #22 (agent edit flow), Ticket #36 (agents admin tab)

---

## Ticket 40: Admin — Profile Edit Reviews

### Status: `not_started`

### Description

Build the admin UI for reviewing provider profile edit requests. When a provider edits their profile, changes create an `tsp_edits` record. This adds a review interface. (Addresses the "Admin UI for profile edits" gap from PRD Section 9.)

### What Changes

**Add sub-tab or section to `src/components/admin/ProvidersTab.tsx`:**

- Section: "Pending Profile Edits"
- Table: Company Name, Edit Date, Status, Actions
- Click row → side-by-side diff of current vs proposed profile changes
- Actions:
  - **Approve:** Merges `payload` into submission/profile → `tsp_edits.status` → `'approved'`
  - **Reject:** Notes → `tsp_edits.status` → `'rejected'`

### Acceptance Criteria

- [ ] Pending profile edits visible in Providers tab
- [ ] Side-by-side diff view
- [ ] Approve updates live profile data
- [ ] Reject stores notes
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Provider edits profile → admin sees edit request
2. Approve → profile updated
3. Reject → edit marked rejected

### Prerequisites from User

- [ ] Pending `tsp_edits` records

### State Awareness

- **Before:** Profile edits create records but no admin review UI.
- **After:** Complete profile edit review workflow.

### Dependencies

- **Blocked by:** Ticket #20 (profile edit flow), Ticket #37 (providers admin tab)

---

## Ticket 41: Self-Assessment Questionnaire

### Status: `not_started`

### Description

Build the AI Readiness Self-Assessment questionnaire at `/self-assessment`. A multi-section survey that evaluates a GCC's AI maturity across categories like Strategy, Technology, Talent, Governance, and Operations.

### What Changes

**`src/pages/gcc/SelfAssessment.tsx`** — full rewrite:

**Questionnaire structure:**
- 5 sections (Strategy, Technology, Talent, Governance, Operations)
- 5–8 questions per section (25–40 total)
- Question types: Likert scale (1–5), multiple choice, yes/no
- Progress bar showing section completion

**Form behavior:**
- React Hook Form manages all answers
- Answers stored as JSONB in `self_assessments` table
- Auto-save on section completion (`status: 'in_progress'`)
- Resume unfinished assessments
- "Submit Assessment" on final section → `status: 'completed'` → navigates to results page

**Data source:** `useQuery` for existing assessment, `useMutation` for save/submit

### Acceptance Criteria

- [ ] Multi-section questionnaire renders
- [ ] 5 sections with 5–8 questions each
- [ ] Likert scale, multiple choice, and yes/no question types
- [ ] Progress bar shows section completion
- [ ] Auto-save on section completion
- [ ] Resume unfinished assessments
- [ ] Submit triggers result generation (Ticket #42)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. GCC → `/self-assessment` → questionnaire loads
2. Complete section 1 → auto-saved
3. Close and reopen → resumes from where left off
4. Complete all sections → submit → navigated to results

### Prerequisites from User

- [ ] **Assessment questions content** (can start with placeholder questions and refine later)

### State Awareness

- **Before:** Placeholder page.
- **After:** Functional multi-section questionnaire with auto-save and resume.

### Dependencies

- **Blocked by:** Ticket #4 (self_assessments table), Ticket #12 (GCC hooks)

---

## Ticket 42: Self-Assessment Results + PDF Generation

### Status: `not_started`

### Description

Build the assessment results page and a Supabase Edge Function that generates a PDF report. After completing the questionnaire, results are scored and categorized, then displayed as a visual dashboard and optionally exported as PDF.

### What Changes

**Create route `/self-assessment/result/:assessmentId`:**
- Add new page `src/pages/gcc/SelfAssessmentResult.tsx`
- Add route to App.tsx inside GCC route group

**Results page:**
- Overall score (percentage or maturity level)
- Category scores (radar chart or bar chart per section)
- Recommendations per category
- Strengths and improvement areas
- "Download PDF Report" button

**Create `supabase/functions/generate-assessment-pdf/index.ts`:**
- Receives assessment ID
- Fetches completed assessment + results from Supabase
- Generates PDF using a Deno PDF library (e.g., `jspdf` or server-rendered HTML-to-PDF)
- Uploads PDF to `assessment-pdfs` storage bucket
- Returns the PDF URL
- Updates `self_assessment_results.pdf_url`

**Scoring logic (can be in Edge Function or client-side):**
- Calculate section scores from Likert answers
- Map to maturity levels: Nascent, Developing, Proficient, Advanced, Leading
- Generate recommendations based on scores

### Acceptance Criteria

- [ ] Results page shows overall score and category breakdown
- [ ] Visual representation (chart/graph) of scores
- [ ] Recommendations listed per category
- [ ] "Download PDF" triggers Edge Function
- [ ] PDF generated and stored in `assessment-pdfs` bucket
- [ ] PDF URL saved to `self_assessment_results.pdf_url`
- [ ] Route added to App.tsx
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls supabase/functions/generate-assessment-pdf/index.ts
```

### Human Verification

1. Complete assessment → results page loads with scores
2. Category scores show visual breakdown
3. "Download PDF" → PDF downloads
4. PDF contains assessment data and recommendations

### Prerequisites from User

- [ ] Scoring rubric defined (which answers map to which scores)
- [ ] PDF template design (basic is fine for MVP)

### State Awareness

- **Before:** No results page. No PDF generation.
- **After:** Complete assessment pipeline: questionnaire → scoring → results → PDF.

### Dependencies

- **Blocked by:** Ticket #4 (self_assessment_results table), Ticket #5 (PDF storage), Ticket #41 (questionnaire)

---

## Ticket 43: Thought Leadership Hub + Article Pages

### Status: `not_started`

### Description

Build the Thought Leadership hub at `/thought-leadership` and individual article pages at `/thought-leadership/:slug`. Articles are stored as static data (similar to AI Pulse briefs) covering AI-first GCC transformation topics.

### What Changes

**`src/pages/content/ThoughtLeadership.tsx`** — full rewrite:

- Grid of article cards (similar to AI Pulse listing)
- Each card: title, author, date, category tag, excerpt, estimated read time
- Filter by category: Strategy, Governance, Talent, Operations, Benchmarking
- Search by title/content

**Create `src/pages/content/ThoughtLeadershipArticle.tsx`:**
- Full article page at `/thought-leadership/:slug`
- Hero: title, author, date, category, estimated read time
- Body: rich text content (markdown or HTML)
- Related articles sidebar/bottom
- Share buttons

**Create `src/data/thoughtLeadershipArticles.ts`:**
- Static data array (same pattern as `aiPulseBriefs.ts`)
- Start with 5–10 placeholder articles
- Each: slug, title, author, date, category, excerpt, content, readTime

**Add route:** `/thought-leadership/:slug` to App.tsx inside MarketingLayout

### Acceptance Criteria

- [ ] Hub shows article cards in responsive grid
- [ ] Category filter works
- [ ] Search works
- [ ] Individual article pages render full content
- [ ] Related articles shown
- [ ] New route added to App.tsx
- [ ] Static data file with 5–10 articles
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/thought-leadership` → grid of articles
2. Filter by category → results update
3. Click article → full page renders with content
4. Back button returns to hub

### Prerequisites from User

- [ ] **Article content** (can start with placeholder text and replace later)

### State Awareness

- **Before:** Placeholder page.
- **After:** Content hub with articles. Static data, no database dependency.

### Dependencies

None — can be done in parallel with other tickets.

---

## Ticket 44: Tools Hub Page

### Status: `not_started`

### Description

Build the Tools hub at `/tools`. Displays the platform's toolkit: Self-Assessment, Charter, Skills Taxonomy, Workflow Kit, Business Case, Use Case Capture, and Use Case Prioritization. Each tool links to its own page or is a downloadable resource.

### What Changes

**`src/pages/content/ToolsHub.tsx`** — full rewrite:

- Grid of tool cards (7 tools from PRD Section 4.9)
- Each card: icon, tool name, description, CTA button
- Tools:
  1. **Self-Assessment** → links to `/self-assessment` (built in Ticket #41)
  2. **AI-First GCC Charter** → downloadable template (static PDF or doc)
  3. **Skills Taxonomy** → downloadable framework
  4. **Workflow Kit** → downloadable templates
  5. **Business Case Calculator** → future interactive tool (link to placeholder)
  6. **Use Case Capture** → downloadable template
  7. **Use Case Prioritization** → downloadable scoring framework

- For downloadable tools: link to static files in `/public/tools/`
- For interactive tools: link to their routes

### Acceptance Criteria

- [ ] 7 tool cards displayed in responsive grid
- [ ] Each card has icon, name, description, and CTA
- [ ] Self-Assessment links to `/self-assessment`
- [ ] Downloadable tools link to static files
- [ ] Clean, professional layout
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/tools` → 7 tool cards visible
2. Click "Self-Assessment" → navigates to `/self-assessment`
3. Click a downloadable tool → file downloads (or placeholder page)

### Prerequisites from User

- [ ] **Tool template files** (PDFs/docs) for downloadable tools (can use placeholders initially)

### State Awareness

- **Before:** Placeholder page.
- **After:** Tools hub with 7 cards. Static content, minimal database dependency.

### Dependencies

None — can be done in parallel.

---

## Ticket 45: Orbyt Landing Page

### Status: `not_started`

### Description

Build the Orbyt Agent Marketplace landing page at `/orbyt`. This is a dedicated landing page for the AI agent marketplace storefront, separate from the main GCC platform landing page. It highlights the marketplace value proposition and funnels users to browse agents or list their own.

### What Changes

**`src/pages/marketing/OrbytLanding.tsx`** — full rewrite:

**Sections:**
1. **Hero:** "Orbyt — The AI Agent Marketplace for GCCs", dual CTAs: "Browse Agents" → `/marketplace`, "List Your Agent" → `/auth?mode=signup&role=provider`
2. **Stats:** Agent count, category count, provider count (can be dynamic from DB or hardcoded initially)
3. **Featured Categories:** Grid of top 6 agent categories with icons, linking to filtered marketplace
4. **How It Works:** 3-step flow for GCCs (Discover → Evaluate → Connect) and Providers (List → Get Reviewed → Gain Visibility)
5. **Featured Agents:** Carousel of 3–6 top-rated agents (if data available, else placeholder)
6. **CTA:** Sign-up prompt for both GCCs and Providers

### Acceptance Criteria

- [ ] Landing page with 6 sections
- [ ] "Browse Agents" links to `/marketplace`
- [ ] "List Your Agent" links to provider signup
- [ ] Featured categories link to filtered marketplace (e.g., `/marketplace?category=Finance`)
- [ ] Responsive layout
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/orbyt` → landing page loads with all sections
2. "Browse Agents" → navigates to marketplace
3. Category cards → navigate to filtered marketplace
4. Mobile responsive

### Prerequisites from User

None.

### State Awareness

- **Before:** Placeholder page.
- **After:** Marketing landing page for the marketplace storefront.

### Dependencies

- **Blocked by:** Ticket #23 (marketplace must exist for links to work)

---

## Ticket 46: Provider Ecosystem + Directory Page

### Status: `not_started`

### Description

Build the Provider Ecosystem page at `/providers`. Shows an overview of the provider ecosystem and a directory of approved providers.

### What Changes

**`src/pages/marketing/ProvidersPage.tsx`** — full rewrite:

**Sections:**
1. **Hero:** "Our Provider Ecosystem", description of the two provider types
2. **Provider Directory:** Grid of approved provider cards
   - Card: logo, company name, location, category badge (TSP/Startup), company size
   - Click → could link to a provider detail page (future) or show modal with info
3. **Become a Provider:** CTA section → links to `/auth?mode=signup&role=provider`
4. **Stats:** Total providers, TSPs, startups

**Data:** Query `provider_profiles` where `status = 'approved'` (public read via anon key)

### Acceptance Criteria

- [ ] Hero with ecosystem description
- [ ] Provider directory grid with approved provider cards
- [ ] Cards show logo, name, location, category
- [ ] "Become a Provider" CTA links to signup
- [ ] Stats section
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/providers` → ecosystem page loads
2. Approved providers shown in grid
3. "Become a Provider" → navigates to signup

### Prerequisites from User

- [ ] Approved providers in Supabase

### State Awareness

- **Before:** Placeholder page.
- **After:** Public provider directory.

### Dependencies

- **Blocked by:** Ticket #10 (provider data hooks)

---

## Ticket 47: Benchmarks Page

### Status: `not_started`

### Description

Build the Benchmarks page at `/benchmarks`. Displays GCC AI maturity indices and industry benchmarks. Initially static content with charts and data visualizations.

### What Changes

**`src/pages/content/Benchmarks.tsx`** — full rewrite:

**Sections:**
1. **Hero:** "GCC AI Maturity Benchmarks"
2. **Industry Index:** Bar/radar chart showing AI maturity by industry
3. **Maturity Levels:** Visual breakdown of the 5 maturity levels (Nascent → Leading)
4. **Key Findings:** Summary cards with key statistics
5. **Methodology:** How benchmarks are calculated
6. **CTA:** "Take the Self-Assessment" → links to `/self-assessment`

**Data:** Static for MVP (hardcoded benchmark data). Future: aggregated from self-assessment results.

### Acceptance Criteria

- [ ] Page renders with all sections
- [ ] Charts/visualizations render (can use simple CSS or a lightweight chart lib)
- [ ] Maturity levels visually represented
- [ ] Self-Assessment CTA links correctly
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. `/benchmarks` → page loads with charts and data
2. "Take the Self-Assessment" → navigates to `/self-assessment`

### Prerequisites from User

- [ ] **Benchmark data** (can use placeholder data initially)

### State Awareness

- **Before:** Placeholder page.
- **After:** Static benchmarks page with visualizations.

### Dependencies

None — static content, can be done in parallel.

---

## Ticket 48: Email Notifications Edge Function

### Status: `not_started`

### Description

Create a Supabase Edge Function that sends email notifications for key platform events. This addresses the "Email notifications" gap from PRD Section 9. Uses a transactional email service (e.g., Resend, SendGrid, or Supabase's built-in email).

### What Changes

**Create `supabase/functions/send-notification/index.ts`:**

Handles the following notification types:

| Event | Recipient | Template |
|-------|-----------|----------|
| Provider approved | Provider email | "Your profile has been approved! Start listing agents." |
| Provider rejected | Provider email | "Your profile needs attention. Reason: [notes]" |
| Agent approved | Provider email | "Your agent [name] is now live on the marketplace!" |
| Agent rejected | Provider email | "Your agent submission needs changes. Notes: [notes]" |
| Problem approved | GCC email | "Your problem statement is now visible to providers." |
| Problem rejected | GCC email | "Your problem statement was not approved. Reason: [notes]" |
| New contact request | Provider email | "A GCC is interested in your agent [name]." |
| Interest expressed | Admin email | "Provider [name] expressed interest in problem [title]." |

**Trigger:** Called from admin action mutations (approve, reject) and from contact/interest flows.

**Implementation:**
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { type, recipient_email, data } = await req.json()

  const templates: Record<string, (data: any) => { subject: string; body: string }> = {
    'provider_approved': (d) => ({
      subject: 'Your Orbys360 Provider Profile is Approved!',
      body: `Congratulations! Your profile for ${d.company_name} has been approved...`,
    }),
    // ... more templates
  }

  const template = templates[type]?.(data)
  if (!template) return new Response('Unknown type', { status: 400 })

  // Send via email service (Resend, SendGrid, etc.)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Orbys360 <notifications@orbys360.com>',
      to: recipient_email,
      subject: template.subject,
      html: template.body,
    }),
  })

  return new Response(JSON.stringify({ sent: true }), { status: 200 })
})
```

**Update admin action functions** (in `src/lib/api/admin.ts`):
- After `approveProvider()`: call notification function
- After `rejectProvider()`: call notification function
- After `approveAgent()`: call notification function
- After `rejectAgent()`: call notification function

### Acceptance Criteria

- [ ] Edge Function exists with 8 notification templates
- [ ] Templates include recipient-specific data (company name, agent name, admin notes)
- [ ] Function validates `type` parameter
- [ ] Admin actions trigger notifications after state changes
- [ ] Contact flow triggers notification to provider
- [ ] Interest flow triggers notification to admin
- [ ] `npm run build` passes

### Machine Verification

```bash
ls supabase/functions/send-notification/index.ts
npm run build
```

### Human Verification

1. Deploy function: `supabase functions deploy send-notification`
2. Approve a provider via admin → provider receives approval email
3. Reject an agent → provider receives rejection email with notes
4. GCC contacts provider → provider receives contact notification

### Prerequisites from User

- [ ] **Email service account** (Resend, SendGrid, or similar) with API key
- [ ] **Verified sender domain** (e.g., `notifications@orbys360.com`)
- [ ] Add secret: `supabase secrets set RESEND_API_KEY=re_...`

### State Awareness

- **Before:** No email notifications. Users must check the dashboard manually.
- **After:** Automated emails for all key status changes. Users notified proactively.

### Dependencies

- **Blocked by:** Ticket #6 (JWT bridge for authenticated calls)

---

## Ticket 49: Pagination (Marketplace, Problems, Content)

### Status: `not_started`

### Description

Add proper pagination to all listing pages that display dynamic or large datasets. This addresses the "Pagination" gap from PRD Section 9. Standardize the pagination component and apply it across marketplace, problems, and content pages.

### What Changes

**Create `src/components/shared/Pagination.tsx`:**
- Reusable pagination component
- Props: `currentPage`, `totalPages`, `onPageChange`
- Renders: Previous, page numbers (with ellipsis for large ranges), Next
- "Showing X–Y of Z" text
- Disabled state for first/last pages

**Apply to:**
1. **Marketplace** (`MarketplaceListing.tsx`) — 12 agents per page (already built in Ticket #23, now standardized)
2. **Problems** (`ProblemsListing.tsx`) — 10 problems per page
3. **Thought Leadership** (`ThoughtLeadership.tsx`) — 9 articles per page
4. **Provider Directory** (`ProvidersPage.tsx`) — 12 providers per page

**URL sync:** Page number stored in URL search params (`?page=2`) for shareable URLs and back button support.

### Acceptance Criteria

- [ ] Reusable `Pagination` component with page numbers, prev/next, and ellipsis
- [ ] Applied to marketplace, problems, thought leadership, and provider directory
- [ ] Page number synced to URL search params
- [ ] "Showing X–Y of Z" text
- [ ] Correct items per page (12, 10, 9, 12 respectively)
- [ ] First/last page buttons properly disabled
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
ls src/components/shared/Pagination.tsx
```

### Human Verification

1. Marketplace → navigate through pages → URL updates
2. Problems → pagination works
3. Back button returns to correct page
4. Edge cases: page 1 (prev disabled), last page (next disabled)

### Prerequisites from User

- [ ] Enough test data for multi-page results

### State Awareness

- **Before:** Marketplace has basic pagination. Other pages don't.
- **After:** Standardized pagination across all listing pages.

### Dependencies

- **Blocked by:** Ticket #23 (marketplace), Ticket #32 (problems), Ticket #43 (thought leadership)

---

## Ticket 50: Route Tree Update + Final Integration

### Status: `not_started`

### Description

Final integration ticket. Update `App.tsx` to add any new routes created during development (self-assessment results, thought leadership articles, tool sub-pages). Verify all pages are accessible, all guards work, and the complete app functions end-to-end.

### What Changes

**`src/App.tsx`** — add missing routes:

```tsx
// Inside MarketingLayout group:
<Route path="/thought-leadership/:slug" element={<Suspense fallback={<PageLoader />}><ThoughtLeadershipArticle /></Suspense>} />

// Inside GCC route group:
<Route path="/self-assessment/result/:assessmentId" element={<Suspense fallback={<PageLoader />}><SelfAssessmentResult /></Suspense>} />
```

**Full verification checklist:**
- All 25+ routes render without errors
- All auth guards redirect correctly
- All lazy imports resolve
- All data flows work end-to-end (create → view → edit → approve)
- Mobile responsive across all pages
- No console errors on any route
- Build passes with no warnings

### Acceptance Criteria

- [ ] All routes from PRD Section 7 are present in App.tsx
- [ ] New routes added for article detail and assessment results
- [ ] All pages lazy-loaded with Suspense
- [ ] Full navigation flow works for each user role:
  - **Anonymous:** Landing, marketplace, problems (read-only), content pages
  - **Provider:** Onboarding → dashboard → list agent → edit agent
  - **GCC:** Dashboard → shortlist → contact → problems → self-assessment
  - **Admin:** Login → review agents/providers/problems
- [ ] `npm run build` passes with zero errors
- [ ] No console errors on any route

### Machine Verification

```bash
npm run build

# Count all routes
grep -c "path=" src/App.tsx
# Expected: 25+
```

### Human Verification

1. Walk through every route as each user role
2. Verify guards: unauthenticated → /auth, wrong role → /, provider without profile → /onboarding
3. Verify data flows: onboarding creates records, marketplace shows agents, admin approves
4. Mobile test on key pages

### Prerequisites from User

- [ ] All previous tickets completed
- [ ] Test data in Supabase for all flows

### State Awareness

- **Before:** App.tsx has routes from scaffolding + incremental additions.
- **After:** Complete route tree matching PRD. All pages functional.

### Dependencies

- **Blocked by:** Tickets #42, #43, #44, #45, #46, #47 (all pages must exist)

---

## Implementation Order (Recommended)

```
INFRASTRUCTURE (Tickets 1–8):
  [#1] → [#2] [#3] [#4] [#5]  (parallel after #1)
       → [#6] → [#7] [#8]     (sequential for auth bridge)

DATA LAYER (Tickets 9–12):
  [#1-#4] → [#9] → [#10] [#11] [#12]  (parallel hooks)

PROVIDER ONBOARDING (Tickets 13–16):
  [#10] → [#13] → [#14] → [#15] [#16]  (sequential steps)

PROVIDER DASHBOARD (Tickets 17–20):
  [#10] → [#17] → [#18] [#19] [#20]  (parallel tabs)

AGENT MANAGEMENT (Tickets 21–22):
  [#11] → [#21] → [#22]  (sequential)

MARKETPLACE (Tickets 23–26):
  [#11] → [#23] → [#24] → [#25]
  [#12] → [#26]  (parallel)

GCC DASHBOARD (Tickets 27–30):
  [#12] → [#27] → [#28] [#29] [#30]  (parallel tabs)

PROBLEM STATEMENTS (Tickets 31–34):
  [#12] → [#31] [#32]  (parallel)
       → [#33] [#34]   (after listing)

ADMIN (Tickets 35–40):
  [#1] → [#35] → [#36] [#37] [#38]  (parallel tabs)
              → [#39] [#40]          (after edit flows)

SELF-ASSESSMENT (Tickets 41–42):
  [#4] [#12] → [#41] → [#42]

CONTENT (Tickets 43–47):
  [#43] [#44] [#47]  (parallel, no deps)
  [#23] → [#45]
  [#10] → [#46]

GAPS & POLISH (Tickets 48–50):
  [#6] → [#48]
  [#23] [#32] [#43] → [#49]
  ALL → [#50]
```

**Critical path:** #1 → #6 → #9 → #10/#11/#12 → Dashboard + Marketplace features → #50
