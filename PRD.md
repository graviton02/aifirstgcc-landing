# Orbys360 / AgentSphere Nexus — Product Requirements Document

> **Version**: 1.0
> **Date**: February 11, 2026
> **Status**: Engineering Handoff

---

## 1. Product Overview

**Orbys360** is a dual-marketplace platform for the AI-First GCC (Global Capability Center) ecosystem. It connects two audiences:

| Audience | What they do |
|----------|-------------|
| **GCCs** (Global Capability Centers) | Discover AI agents, post problem statements (RFPs), shortlist solutions, and access thought leadership for AI transformation |
| **Providers** (Service companies & startups) | List AI agents, respond to GCC problem statements, and gain marketplace visibility |

The platform has two storefronts:
1. **Orbys360 GCC Platform** (`/`) — Knowledge hub, benchmarks, tools, and community for GCC leaders
2. **Orbyt Agent Marketplace** (`/orbyt`, `/marketplace`) — Searchable catalog of AI agents across 25 functional categories

An **Admin** layer mediates quality: every provider, agent, and problem statement goes through approval before it is publicly visible. All GCC-to-Provider introductions are admin-facilitated.

---

## 2. User Roles

| Role | Auth | Description |
|------|------|-------------|
| **GCC User** | Clerk (`role: gcc`) | Employee of a Global Capability Center seeking AI solutions |
| **Provider** | Clerk (`role: provider`) | Company that builds/offers AI agents — either a Technology Service Provider (TSP/Enabler) or a Startup |
| **Admin** | Session-based (secret token) | Orbys360 team member who reviews submissions and mediates introductions |

Roles are mutually exclusive. A single Clerk account cannot hold both `gcc` and `provider` roles.

---

## 3. Provider User Story — End to End

### 3.1 Discovery & Sign-Up

**Entry**: Provider visits `/` or `/orbyt` and clicks **"Join Now"** → **"Join as Provider"**.

**Flow**:
1. Redirected to Clerk auth page with `?role=provider`.
2. Creates account (email/password or social login).
3. Clerk creates an organization for the provider's company.
4. Role metadata `role: 'provider'` is written to the Clerk user profile.
5. Automatically redirected into onboarding.

**Acceptance criteria**:
- User cannot proceed without completing Clerk signup.
- If a user already has a `gcc` role, they are blocked from signing up as a provider.

---

### 3.2 Onboarding (3 Steps)

All onboarding routes are protected by `RequireProviderRole`.

#### Step 1 — Category Selection (`/onboarding/category`)

Provider chooses one of:
- **Technology Service Provider (TSP / Enabler)** — Established consulting firms, systems integrators
- **Startup** — Early-stage AI product companies

This determines which detailed form they see in Step 3.

#### Step 2 — Basic Info (`/onboarding/basics`)

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text | Yes |
| Location / HQ | Text | Yes |
| Company Size | Select | Yes |

#### Step 3 — Detailed Submission (`/onboarding/form`)

Both paths use a 5-page wizard with inline validation (Zod schemas).

**TSP / Enabler Form (5 pages)**:

| Page | Fields |
|------|--------|
| 1 — Company Profile | Logo upload, website, founding year, about text |
| 2 — AI-First Positioning | Core positioning statement, definition of AI-first approach, unique differentiators |
| 3 — Capabilities | AI-enabled workflows, governance frameworks, service offerings |
| 4 — Track Record | Number of GCCs enabled, impact metrics, case studies, industry recognitions |
| 5 — Vision & Contact | Agent-native GCC vision, expansion plans, contact name, email, phone |

**Startup Form (5 pages)**:

| Page | Fields |
|------|--------|
| 1 — Company Profile | Basic company info, founding year, funding stage |
| 2 — Product & Technology | Product description, AI capabilities, tech stack |
| 3 — Market & Traction | Target industries, customer segments, key metrics |
| 4 — Compliance & Security | Certifications, data privacy posture, security measures |
| 5 — Contact | Contact information, partnership interests |

**On Submit**:
- Creates `enabler_submissions` or `startup_submissions` record with `status: pending`.
- Creates `provider_profiles` record linking to the submission.
- Provider is redirected to the Provider Dashboard.

---

### 3.3 Awaiting Approval

After submission, the provider lands on the **Provider Dashboard** (`/provider`). A banner shows:

> *"Your profile is under review. You'll be notified when approved (3–5 business days)."*

**What the provider CAN do**:
- View their own profile and submission data.
- Browse the marketplace in read-only mode.

**What the provider CANNOT do**:
- List agents — the "List Agent" button is disabled.
- Respond to problem statements.

---

### 3.4 Admin Review

An admin opens the **Admin Dashboard** → **Enablers** tab and sees the pending submission.

| Action | Result |
|--------|--------|
| **Approve** | `submission_status → 'approved'`, `provider_profiles.status → 'approved'` |
| **Reject** | `submission_status → 'rejected'`, rejection reason stored, provider notified |

---

### 3.5 Approved — Full Dashboard Access

Once approved, the Provider Dashboard (`/provider`) unlocks three tabs:

#### Tab 1: Requests
- Inbound contact requests from GCC users.
- Each row shows: GCC contact email, agent of interest, timestamp.
- Actions: Mark as contacted, archive.

#### Tab 2: Submissions
Three sub-sections:

| Section | Description |
|---------|-------------|
| **My Agents** | Live approved agents. Actions: Edit (creates edit request), View, Delete (soft). |
| **Pending Submissions** | Agents awaiting admin review. Shows status badge and submission date. |
| **Edit Requests** | Pending changes to approved agents. Shows status and admin notes. |

#### Tab 3: Profile
- View and edit provider profile fields (logo, website, contact info).
- Profile edits create an `enabler_edits` record and require admin approval.

---

### 3.6 Listing an Agent (`/list-your-agent`)

A 5-page wizard available only to approved providers.

| Page | Key Fields |
|------|-----------|
| 1 — Agent Basics | Agent name, tagline, detailed description, category (25 options), logo upload |
| 2 — Use Cases & Industries | Multiple use cases (title + description), target industries (multi-select) |
| 3 — How It Works | Workflow description, integration type (API / SDK / No-code / etc.), data requirements, supported platforms (Slack, Salesforce, etc.) |
| 4 — Benefits & Impact | Impact metrics — multiple entries, each with type, value, and description (e.g. "30% reduction in response time") |
| 5 — Extras | Demo URL, compliance certifications, security features |

**On Submit**:
- Creates `agent_submissions` record with `status: pending`.
- Linked to `provider_profile_id` and `user_id`.
- Appears in Admin Dashboard → Agents tab.

**Agent Categories** (25):
Customer Service, Operations, Finance & Accounting, HR & People Ops, Sales & Marketing, IT & DevOps, Supply Chain, Data & Analytics, Legal & Compliance, Procurement, Risk Management, Quality Assurance, R&D & Innovation, Facilities Management, Learning & Development, ESG & Sustainability, Cybersecurity, Healthcare Ops, Insurance Ops, Banking Ops, Telecom Ops, Retail Ops, Manufacturing Ops, Logistics, Other.

---

### 3.7 Agent Approval

Admin reviews the agent submission:

| Action | Result |
|--------|--------|
| **Approve** | Creates live `agents` record; agent becomes visible in marketplace |
| **Reject** | `submission_status → 'rejected'`; admin notes guide resubmission |
| **Request Changes** | Admin notes provided; provider can revise and resubmit |

---

### 3.8 Managing Agents Post-Approval

**Edit**: Provider clicks Edit on an approved agent → pre-populated form opens at `/provider/agents/:agentId/edit`. Changes create an `agent_edits` record (`status: pending`). The live agent remains unchanged until admin approves the edit.

**Delete**: Soft delete — sets agent status to inactive. Requires confirmation dialog.

---

### 3.9 Responding to GCC Problem Statements

Providers browse `/problems` to see approved, anonymous GCC problem statements.

**Express Interest**:
1. Provider clicks "Express Interest" on a problem card.
2. Backend creates a `problem_statement_interests` record.
3. Interest count on the problem increments.
4. Button changes to "Interested" (disabled — one interest per org per problem).
5. Admin sees the interested provider's name and contact info.
6. Admin facilitates the introduction between GCC and provider.

There is **no direct messaging** — admin mediates all introductions.

---

### 3.10 Marketplace Visibility for Approved Agents

Once approved, the agent appears in:

| Location | What's shown |
|----------|-------------|
| `/marketplace` | Agent card: name, provider logo, category, rating, review count, short description, tags |
| `/marketplace/agent/:agentId` | Full detail page: description, use cases, industries, workflow, integration info, impact metrics, demo link, compliance badges, provider info, "Contact Provider" button |

---

### 3.11 When a GCC Contacts the Provider

1. GCC clicks "Contact Provider" on an agent detail page.
2. Modal shows provider email, contact name, and website.
3. Backend creates a `contact_logs` entry.
4. Provider sees the request in Dashboard → Requests tab.
5. Provider contacts the GCC directly via email.

---

## 4. GCC User Story — End to End

### 4.1 Discovery & Sign-Up

**Entry**: GCC user visits `/` and clicks **"Join Now"** → **"Join as GCC"**.

**Flow**:
1. Redirected to Clerk auth page with `?role=gcc`.
2. Creates account (email/password or social login).
3. Clerk creates an organization representing the GCC company.
4. Role metadata `role: 'gcc'` is written to the Clerk user profile.
5. **No onboarding form** — GCC users get instant access.
6. Redirected to the GCC Dashboard.

---

### 4.2 GCC Dashboard (`/gcc-dashboard`)

Three tabs:

#### Tab 1: Shortlisted Agents
- Organization-wide list of saved agents.
- Shows: agent name, category, who added it, date added.
- Actions: View agent details, Contact provider, Remove from shortlist.
- Shared across all team members in the same Clerk organization.

#### Tab 2: Current Requests
- Log of all providers the GCC has contacted.
- Shows: agent name, provider name, contact date.
- Tracks follow-up status.

#### Tab 3: Problem Hub
- Submit new problem statements.
- View all submitted problems with status badges:
  - Pending Review
  - Approved (with provider interest count)
  - Rejected (with admin reason)
- Actions: View details, Delete (soft).

---

### 4.3 Browsing the Agent Marketplace (`/marketplace`)

**Search & Filter**:
- Full-text search by agent name, description, tags.
- Category filter (25 functional categories).
- Integration type filter.
- Tag filters.

**Display**: 12 agents per page, paginated.

**Agent Card shows**:
- Agent name, provider logo
- Category badge, rating, review count
- Short description
- Tags
- Last updated date

**Actions per card**:
- **View Details** → navigates to `/marketplace/agent/:agentId`
- **Add to Shortlist** (star icon) → saves to org-wide shortlist
- **Contact Provider** → opens contact modal

---

### 4.4 Agent Detail Page (`/marketplace/agent/:agentId`)

Full agent information organized in sections:

| Section | Content |
|---------|---------|
| Hero | Agent name, tagline, provider name + logo |
| Overview | Detailed description, category |
| Use Cases | Real-world scenarios (title + description each) |
| Industries Served | Target verticals |
| How It Works | Workflow description |
| Integration | Supported platforms (Slack, Salesforce, etc.), integration type (API/SDK/No-code) |
| Data Requirements | What data the agent needs |
| Impact Metrics | Quantified benefits with values |
| Demo | Link to live demo or video |
| Compliance & Security | Certifications, security features |

**Actions**:
- **Add to Shortlist** — saves to org shortlist
- **Contact Provider** — opens contact modal

---

### 4.5 Contact Provider Flow

1. GCC clicks "Contact Provider" (on card or detail page).
2. Modal opens showing:
   - Provider email
   - Contact name
   - Website URL
3. Action buttons:
   - "Email Provider" (opens `mailto:` link)
   - "Copy Email" (copies to clipboard)
   - "Visit Website" (opens in new tab)
4. Backend creates `contact_logs` entry.
5. Entry appears in GCC Dashboard → Current Requests tab.
6. Provider sees the request in their Dashboard → Requests tab.

---

### 4.6 Shortlist Management

**Adding**: Click the star icon on any agent card or detail page.

**Organization scope**: The shortlist is shared across all members of the GCC's Clerk organization. Any member can add or remove agents. Each entry tracks who added it (audit trail).

**Stored in**: `agent_shortlists` table, keyed by `gcc_org_id`.

---

### 4.7 Posting Problem Statements

#### Submission Form (modal in Problem Hub)

| Field | Type | Required |
|-------|------|----------|
| Title | Text (50–100 chars) | Yes |
| Description | Rich text (500–2000 chars) | Yes |
| Category | Select (Operations, Finance, HR, etc.) | Yes |
| Industry | Text (publicly visible) | Yes |
| Desired Outcome | Text (success criteria) | Yes |
| Timeline | Select: Immediate / Short (1–3 mo) / Medium (3–6 mo) / Long (6+ mo) | Yes |
| Budget Range | Select: <$10K / $10–50K / $50–100K / $100K+ / Open to discuss | Yes |

#### Anonymity Rules
- GCC **company name is hidden** in the public `/problems` listing.
- Only the **industry** is shown publicly.
- Admins can see the full GCC identity for quality review.

#### Monthly Quota
- **20 problem statements per month** per GCC organization.
- Resets on the 1st of each month.
- If exceeded, a modal displays: *"Monthly limit reached. Resets on [date]."*
- Tracked in `gcc_problem_submission_quota` table.

#### On Submit
- Creates `problem_statements` record with `status: pending_review`.
- Decrements remaining quota.
- Problem enters admin review queue.

---

### 4.8 Problem Statement Lifecycle

```
GCC submits problem
        │
        ▼
  [pending_review]
        │
   Admin reviews
       / \
      /   \
     ▼     ▼
[approved] [rejected]
     │         │
     │     Shows rejection
     │     reason to GCC
     ▼
  Visible at /problems
     │
  Providers express interest
     │
  Admin sees interested providers
     │
  Admin facilitates introduction
```

**Interest tracking**: Each interested provider's org name, contact email, and timestamp are stored. Admin sees the full list on the Admin Dashboard → Problems tab.

---

### 4.9 Thought Leadership & Tools

GCC users also have access to the platform's knowledge ecosystem:

**Thought Leadership** (`/thought-leadership`)
- 20+ articles on AI-first GCC transformation.
- Topics: governance, talent, operations, benchmarking.
- Individual article pages at `/thought-leadership/:slug`.

**Tools** (`/tools`)
- Self-Assessment — AI readiness questionnaire → generates a PDF report.
- Charter — AI-First GCC Charter template.
- Skills Taxonomy — Skill mapping framework.
- Workflow Kit — Process automation templates.
- Business Case — ROI calculator.
- Use Case Capture — Idea management tool.
- Use Case Prioritization — Scoring framework.

**Benchmarks** (`/benchmarks`)
- GCC AI maturity indices and industry benchmarks.

**Community** (`/community`)
- Discussion forums, events calendar, peer networking. *(Planned — not yet built.)*

---

### 4.10 Team Collaboration

All org-scoped features share state across GCC team members:

| Feature | Scope |
|---------|-------|
| Agent shortlist | Shared across org |
| Problem statement quota (20/mo) | Shared across org |
| Contact log | Visible to all org members |
| Problem submissions | Visible to all org members |

Team management uses Clerk Organizations: invite members, assign roles (owner / admin / member).

---

## 5. Admin User Story

### 5.1 Authentication

Admin navigates to `/admin/:secretToken`. Enters a password. A session token is created in `admin_sessions` with an expiry. No Clerk account required.

### 5.2 Admin Dashboard — Three Tabs

#### Agents Tab
- Queue of pending `agent_submissions`.
- View full submission details + provider identity.
- Actions: Approve (creates live `agents` record), Reject (with notes), Delete.

#### Enablers Tab
- Queue of pending `enabler_submissions` and `startup_submissions`.
- View full onboarding form data + company identity.
- Actions: Approve (updates `provider_profiles.status`), Reject (with reason).

#### Problems Tab
- Queue of pending `problem_statements`.
- View full problem + GCC identity (hidden from public).
- See list of providers who expressed interest (org name, email, timestamp).
- Actions: Approve, Reject (with reason), Remove.
- **Facilitate introductions**: Admin emails both parties to connect them.

### 5.3 Environment Switcher
Toggle between **dev** and **prod** Supabase environments from the admin panel.

---

## 6. Data Model Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `agents` | Live approved agents | `agent_name`, `description`, `category`, `provider_profile_id`, `rating`, `tags`, `use_cases`, `industries`, `integration_type`, `impact_metrics` |
| `agent_submissions` | Pending agent listings | Same as `agents` + `submission_status`, `admin_notes` |
| `agent_edits` | Edit requests on live agents | `agent_id`, `payload` (JSONB), `status` |
| `provider_profiles` | Approved provider orgs | `user_id`, `company_name`, `logo_url`, `status`, `organization_id` |
| `enabler_submissions` | TSP onboarding data | 30+ fields covering positioning, capabilities, track record |
| `startup_submissions` | Startup onboarding data | Product, technology, traction, compliance fields |
| `enabler_edits` | Profile edit requests | `enabler_id`, `payload`, `status` |
| `problem_statements` | GCC RFPs | `title`, `description`, `category`, `timeline`, `budget_range`, `status`, `interest_count` |
| `problem_statement_interests` | Provider interest in problems | `problem_statement_id`, `provider_org_id`, `provider_user_email` |
| `gcc_problem_submission_quota` | Monthly quota tracking | `gcc_org_id`, `current_month`, `submissions_this_month`, `quota_limit` (20) |
| `agent_shortlists` | GCC saved agents | `gcc_org_id`, `agent_id`, `created_by_user_id` |
| `contact_logs` | GCC-Provider contact tracking | `gcc_user_id`, `agent_id`, `provider_profile_id`, `contacted_at` |
| `provider_requests` | Inbound requests to providers | `provider_profile_id`, `gcc_user_email`, `agent_id`, `status` |
| `self_assessments` | AI readiness responses | `user_id`, `answers` (JSONB), `status` |
| `self_assessment_results` | Assessment analysis + PDFs | `assessment_id`, `analysis` (JSONB), `pdf_url` |
| `admin_sessions` | Admin auth sessions | `session_token`, `expires_at` |

### Key Relationships

```
provider_profiles  1 ──→ *  agents
provider_profiles  1 ──→ *  agent_submissions
provider_profiles  1 ──→ 1  enabler_submissions
agents             1 ──→ *  agent_edits
problem_statements 1 ──→ *  problem_statement_interests
agent_shortlists   * ──→ 1  agents
contact_logs       * ──→ 1  agents
contact_logs       * ──→ 1  provider_profiles
```

### Row-Level Security

- **Agents**: Public `SELECT` on approved agents only.
- **Agent submissions**: Owner can `INSERT`/`SELECT`; admin has full access.
- **Provider profiles**: Owner `SELECT`/`UPDATE`; admin full access.
- **Problem statements**: GCC org members `INSERT`/`SELECT`/`DELETE` own; public `SELECT` approved only; admin full access.
- **Agent shortlists**: GCC org members have full access.

---

## 7. Route Map

### Public Routes
| Route | Page |
|-------|------|
| `/` | GCC Platform landing page |
| `/orbyt` | Agent Marketplace landing page |
| `/marketplace` | Agent catalog (search, filter, browse) |
| `/marketplace/agent/:agentId` | Agent detail page |
| `/problems` | Problem statements marketplace |
| `/thought-leadership` | Article hub |
| `/thought-leadership/:slug` | Individual article |
| `/tools` | Tools hub |
| `/tools/:toolSlug` | Individual tool page |
| `/benchmarks` | AI maturity benchmarks |
| `/community` | Community hub |
| `/providers` | Provider ecosystem overview |
| `/providers/directory` | Provider directory |
| `/use-cases` | Use case showcase |
| `/agentic-ai-thoughtbook` | AI guide |
| `/privacy`, `/terms`, `/cookies`, `/data-deletion` | Legal pages |
| `/auth` | Clerk sign-in / sign-up |

### Protected — Provider Routes
| Route | Guard | Page |
|-------|-------|------|
| `/onboarding/category` | `RequireProviderRole` | Category selection |
| `/onboarding/basics` | `RequireProviderRole` | Basic info form |
| `/onboarding/form` | `RequireProviderRole` | Detailed submission form (5 pages) |
| `/provider` | `RequireProviderProfile` | Provider dashboard |
| `/list-your-agent` | `RequireProviderProfile` + approved | Agent listing wizard (5 pages) |
| `/provider/agents/:agentId/edit` | `RequireProviderProfile` + owner | Edit agent form |

### Protected — GCC Routes
| Route | Guard | Page |
|-------|-------|------|
| `/gcc-dashboard` | Clerk auth + `role: gcc` | GCC dashboard |
| `/self-assessment` | Clerk auth | AI readiness assessment |
| `/self-assessment/result/:id` | Clerk auth | Assessment results + PDF |

### Protected — Admin Routes
| Route | Guard | Page |
|-------|-------|------|
| `/admin/:secretToken` | Session-based password | Admin dashboard |

---

## 8. Key Business Rules

| Rule | Details |
|------|---------|
| **Role exclusivity** | A user cannot be both a GCC and a Provider. Enforced at signup. |
| **Approval gates** | Providers, agents, and problem statements all require admin approval before public visibility. |
| **One interest per problem** | A provider org can express interest in a problem statement only once (UNIQUE constraint). |
| **Problem quota** | 20 problem statements per month per GCC org. Resets on the 1st. |
| **Anonymous problems** | GCC company name is hidden from public view; only industry is shown. Admin sees full identity. |
| **Mediated introductions** | No direct messaging. Admin facilitates all GCC-Provider introductions. |
| **Edit ≠ direct update** | Edits to approved agents or provider profiles create a review request. Live content stays unchanged until admin approves the edit. |
| **Org-scoped shortlists** | Shortlists are shared across all members of a GCC Clerk organization. |
| **Soft deletes** | Agents and problem statements use soft deletes (status change) to preserve history and interest records. |

---

## 9. Known Gaps & Future Work

### Gaps (exist in schema but incomplete in UI)

| Gap | Status | Impact |
|-----|--------|--------|
| Email notifications (approval, rejection, interest) | Not implemented | Providers/GCCs have no push notification of status changes |
| Admin UI for reviewing agent edits and profile edits | Partially built | Admins must use direct DB access for some edit approvals |
| Backend role exclusivity enforcement | Frontend-only guard | A determined user could theoretically create both role profiles |
| Pagination on thought leadership, tools, problems | Missing | Performance risk at scale |

### Planned Features (not yet built)

| Feature | Description |
|---------|-------------|
| Direct messaging | GCC-Provider chat, problem Q&A |
| Agent ratings & reviews | Star ratings, verified buyer badges |
| Side-by-side comparison | Feature matrix across agents |
| Payment integration | Stripe subscriptions, listing fees |
| SSO | Enterprise SAML / OIDC support |
| Public API | Agent catalog API + webhooks |
| Advanced analytics | Provider performance metrics, engagement dashboards |

---

## 10. Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Forms | React Hook Form + Zod validation |
| Server state | TanStack Query |
| Routing | React Router (lazy-loaded pages) |
| Auth | Clerk (users, orgs, sessions, roles) |
| Database | Supabase (PostgreSQL + RLS) |
| Edge functions | Supabase Edge Functions (Deno) |
| File storage | Supabase Storage (logos, PDFs) |
| Error tracking | Sentry |
| Analytics | Vercel Analytics |
| Testing | Vitest (unit), Cypress (E2E) |
| Hosting | Vercel |
