# Directory + Claim Profile — Design Document

> **Date:** 2026-03-09
> **Status:** Approved
> **Author:** Claude Code (brainstorming session with user)

---

## 1. Overview

Orbys360 is pivoting from a provider-submitted agent marketplace to a **directory-first model**. ~1000 AI agents (scraped from ~100+ companies) will be seeded into the platform on day 1. Companies can **claim their profile** to gain edit access to their agents and company information.

### Key Changes

- Homepage becomes the agent directory (no separate landing page)
- Agents exist before any company claims them
- New "Claim Profile" flow replaces the old provider onboarding wizard
- Content gating drives buyer (GCC) registration
- Agent comparison tool for logged-in buyers
- Full migration from Vite SPA to Next.js (App Router) for SEO
- Convex backend and Clerk auth are preserved

---

## 2. Data Model

### 2.1 New Tables

#### `companies`

Scraped company profiles. Exist independently of claims.

| Field | Type | Notes |
|-------|------|-------|
| `slug` | `string` | URL-friendly identifier, e.g., `sonata-software` |
| `name` | `string` | Display name |
| `description` | `string` | Company description |
| `website` | `string` | Company website URL |
| `headquarters` | `string` | Location, e.g., "Bangalore, India" |
| `founded` | `optional number` | Founding year |
| `company_size` | `string` | `"enterprise"` / `"startup"` / `"mid-market"` / `"smb"` |
| `logo_url` | `optional string` | Company logo |
| `primary_verticals` | `string[]` | Industry verticals served |
| `contact_email` | `optional string` | Scraped generic email |
| `verification_status` | `string` | `"pass"` / `"fail"` / `"unchecked"` |
| `claim_status` | `string` | `"unclaimed"` / `"pending"` / `"claimed"` |
| `claimed_by_user_id` | `optional string` | Clerk user ID of owner |
| `claimed_at` | `optional number` | Timestamp |
| `created_at` | `number` | |
| `updated_at` | `number` | |

**Indexes:** `by_slug`, `by_claimStatus`, `by_claimedByUserId`
**Search:** `search_companies` on `name`

#### `claimRequests`

| Field | Type | Notes |
|-------|------|-------|
| `company_id` | `id("companies")` | FK to companies |
| `claimant_name` | `string` | |
| `claimant_email` | `string` | Must not be a free email provider |
| `claimant_linkedin` | `string` | LinkedIn profile URL |
| `status` | `string` | `"pending"` / `"approved"` / `"rejected"` |
| `admin_notes` | `optional string` | |
| `reviewed_at` | `optional number` | |
| `created_at` | `number` | |

**Indexes:** `by_companyId`, `by_status`

#### `companyMembers`

| Field | Type | Notes |
|-------|------|-------|
| `company_id` | `id("companies")` | |
| `user_id` | `string` | Clerk user ID |
| `email` | `string` | |
| `role` | `string` | `"owner"` / `"member"` |
| `invited_by` | `optional string` | user_id of inviter |
| `created_at` | `number` | |

**Indexes:** `by_companyId`, `by_userId`

#### `companyEdits`

| Field | Type | Notes |
|-------|------|-------|
| `company_id` | `id("companies")` | |
| `user_id` | `string` | |
| `payload` | `any` | Changed fields |
| `status` | `string` | `"pending"` / `"approved"` / `"rejected"` |
| `admin_notes` | `optional string` | |
| `created_at` | `number` | |

**Indexes:** `by_companyId`, `by_status`

#### `buyerProfiles`

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | `string` | Clerk user ID |
| `name` | `string` | |
| `email` | `string` | |
| `company_name` | `string` | |
| `job_title` | `string` | |
| `created_at` | `number` | |

**Indexes:** `by_userId`

### 2.2 Modified Tables

#### `agents` (modified)

Key changes from current schema:
- `provider_profile_id` replaced with `company_id: id("companies")`
- Single `category: string` replaced with multi-dimensional taxonomy
- New fields for scraped data (use_cases as strings, integrations, outcomes)
- Added `slug: string` for SEO-friendly URLs

| Field | Type | Notes |
|-------|------|-------|
| `slug` | `string` | URL-friendly, e.g., `agentbridge-sonata-software` |
| `agent_name` | `string` | |
| `tagline` | `optional string` | |
| `description` | `string` | |
| `company_id` | `id("companies")` | FK to companies (always set) |
| `logo_url` | `optional string` | |
| `functional_categories` | `string[]` | From 9 functional categories |
| `industry_categories` | `string[]` | From 13 industry categories |
| `infrastructure_categories` | `string[]` | From 3 infrastructure categories |
| `use_cases` | `string[]` | Use case descriptions |
| `business_functions` | `string[]` | Business functions supported |
| `expected_outcomes` | `string[]` | Business outcome descriptions |
| `integrations` | `string[]` | Platform/tool integrations |
| `source_url` | `optional string` | Where data was scraped from |
| `tags` | `string[]` | Free-form tags |
| `demo_url` | `optional string` | |
| `compliance_certifications` | `string[]` | |
| `security_features` | `string[]` | |
| `rating` | `number` | Default 0 |
| `review_count` | `number` | Default 0 |
| `status` | `string` | `"active"` / `"inactive"` |
| `search_text` | `optional string` | Concatenated search field |
| `created_at` | `number` | |
| `updated_at` | `number` | |

**Indexes:** `by_slug`, `by_status`, `by_companyId`
**Search:** `search_agents` on `search_text` filtered by `status`

#### `agentEdits` (modified)

Same structure as before but references `company_id` via the agent for ownership checks. No schema change needed — already references `agent_id`.

### 2.3 Tables to Remove

| Table | Reason |
|-------|--------|
| `providerProfiles` | Replaced by `companies` + `companyMembers` |
| `tspSubmissions` | No longer needed (data is scraped) |
| `startupSubmissions` | No longer needed |
| `tspEdits` | Replaced by `companyEdits` |
| `problemStatements` | Removed from MVP |
| `problemStatementInterests` | Removed from MVP |
| `gccQuota` | Removed from MVP |

### 2.4 Tables to Keep

- `earlyAccessSignups` — still useful for interest capture
- `adminSessions` — admin auth unchanged
- `selfAssessments` + `selfAssessmentResults` — keep for future
- `agentShortlists` — buyer shortlisting feature
- `contactLogs` — analytics
- `agentSubmissions` — providers can still submit new agents

---

## 3. Agent Category Taxonomy

Three-dimensional taxonomy. Every agent is mapped to 1+ categories from each applicable dimension.

### Functional Categories (9)

| Tag | Covers |
|-----|--------|
| Customer Experience | Support, contact center, conversational AI, voice agents |
| Sales & Marketing | Lead gen, prospecting, content, ad optimization, personalization |
| Finance & Accounting | AP/AR, reconciliation, FP&A, expense, treasury |
| HR & Workforce | Recruiting, onboarding, employee experience, workforce planning |
| Engineering & DevOps | Code generation, testing, CI/CD, QA automation |
| IT Operations | Service desk, infrastructure monitoring, AIOps, security ops |
| Data & Analytics | BI agents, data extraction, OCR, document intelligence |
| Legal & Compliance | Contract review, regulatory compliance, risk, audit |
| Operations & Supply Chain | Procurement, inventory, logistics, planning |

### Industry Categories (13)

| Tag | Covers |
|-----|--------|
| Healthcare & Life Sciences | Clinical, pharma, biotech, medical devices |
| Financial Services (BFSI) | Banking, insurance, capital markets |
| Manufacturing | Factory ops, quality, predictive maintenance |
| Automotive & Mobility | Vehicle software, fleet, autonomous systems |
| Retail & E-commerce | Product discovery, pricing, inventory, personalization |
| Telecom & Media | Network ops, content, voice/video generation |
| Energy & Utilities | Grid management, renewables, utility ops |
| Real Estate & Construction | Property management, permitting, site ops |
| Logistics & Transportation | Fleet management, routing, last-mile delivery |
| Government & Public Sector | Citizen services, governance, public infra |
| Education | EdTech, learning platforms, assessment |
| Agriculture & AgriTech | Precision farming, crop intelligence, supply chain |
| Aerospace & Defense | Defense systems, satellite, space analytics |

### Infrastructure Categories (3)

| Tag | Covers |
|-----|--------|
| Agent Platforms & Builders | No-code/low-code agent builders, orchestration platforms |
| AI Infrastructure & Models | LLMs, training infra, model serving |
| Agent Tooling & Monitoring | Evaluation, observability, debugging, testing |

---

## 4. User Flows

### 4.1 Flow A: Anonymous Browsing

```
Homepage (directory) → Browse/search agents → See agent card (name, tagline, company, categories)
  → Click agent → Agent detail page
      - Public: name, tagline, company, categories, description
      - Gated: blurred teaser for use cases, integrations, outcomes
      - CTA: "Sign up free to see full details"
```

### 4.2 Flow B: Buyer (GCC) Registration & Usage

```
Clicks "Sign up" or "See full details"
  → Clerk magic link signup form (name, work email, company name, job title)
  → Receives magic link → Signs in
  → buyerProfile created in Convex
  → Full agent detail unlocked
  → Can: compare (2-4 agents), shortlist, browse freely
```

### 4.3 Flow C: Claim Profile

```
Provider sees "Claim this profile" on company page or agent detail page
  → Clicks → Claim form (name, company email [free providers blocked], LinkedIn URL)
  → claimRequest created with status "pending"
  → Admin gets notification email (via Resend)
  → Admin reviews in dashboard → Approves or Rejects
  → On approval:
    1. Company claim_status → "claimed", claimed_by_user_id set
    2. Clerk magic link sent to claimant's email
    3. Claimant signs in → companyMembers entry created (role: "owner")
    4. Redirected to provider dashboard
```

### 4.4 Flow D: Provider Dashboard (Post-Claim)

```
Provider logs in → Provider Dashboard
  ├── Profile Tab
  │   └── Company info (pre-populated from scrape)
  │   └── "Edit" button → inline edit → submit → companyEdit created (pending admin approval)
  ├── Agents Tab
  │   └── List of all agents under this company
  │   └── Click agent → Editor view (mirrors marketplace detail page layout)
  │   └── "Edit" button → inline edit → submit → agentEdit created (pending admin approval)
  │   └── Can add new agents → agentSubmission created (pending admin approval)
  └── Team Tab
      └── View current members
      └── Invite new members via email → magic link → companyMembers entry created
```

### 4.5 Flow E: Admin Dashboard

```
Admin logs in (password-based session, same as current)
  ├── Claim Requests Tab
  │   └── Pending claims with claimant details + company info
  │   └── Approve / Reject buttons
  ├── Company Edits Tab
  │   └── Pending company profile edits → diff view
  │   └── Approve (apply changes) / Reject
  ├── Agent Edits Tab
  │   └── Pending agent edits → diff view
  │   └── Approve (apply changes) / Reject
  └── Directory Overview Tab
      └── Stats: total agents, total companies, claimed %, active buyers, recent activity
```

---

## 5. Page Architecture (Next.js App Router)

### 5.1 Public Pages (Server Components / SSG+ISR)

| Route | Purpose | Rendering |
|-------|---------|-----------|
| `/` | Homepage = agent directory with search, filters, category chips | ISR |
| `/agents/[slug]` | Agent detail page (public + blurred gated content) | SSG + ISR |
| `/companies/[slug]` | Company profile + agent list + "Claim Profile" button | SSG + ISR |
| `/categories/[slug]` | Category listing page | ISR |
| `/compare` | Comparison page (requires login) | Client-side |
| `/ai-pulse` | AI Pulse daily briefs | SSG |
| `/ai-pulse/[slug]` | Individual brief | SSG |
| `/benchmarks` | Benchmarks page | SSG |
| `/agentic-ai` | Thoughtbook | SSG |
| `/use-cases` | Use cases listing | SSG |
| `/use-cases/[slug]` | Use case detail | SSG |

### 5.2 Auth Pages

| Route | Purpose |
|-------|---------|
| `/sign-in` | Clerk magic link sign-in |
| `/sign-up` | Buyer registration (name, email, company, title) |
| `/claim/[company-slug]` | Claim profile form for a specific company |

### 5.3 Authenticated Pages (Client Components)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Provider dashboard (profile, agents, team tabs) |
| `/dashboard/agents/[slug]` | Agent editor view |
| `/admin` | Admin dashboard (claims, edits, overview) |
| `/shortlist` | Buyer's shortlisted agents |

### 5.4 SEO Infrastructure

- **Dynamic sitemap** at `/sitemap.xml` — auto-generated from all agents, companies, categories
- **JSON-LD schema markup** — `SoftwareApplication` on agent pages, `Organization` on company pages
- **Dynamic OG tags** — unique title, description, image per page
- **robots.txt** — allow all public pages
- **Canonical URLs** — prevent duplicate content

---

## 6. Project Structure (Next.js)

```
orbys360/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ConvexProviderWithClerk)
│   ├── page.tsx                  # Homepage = directory
│   ├── agents/[slug]/page.tsx    # Agent detail (SSG+ISR)
│   ├── companies/[slug]/page.tsx # Company detail (SSG+ISR)
│   ├── categories/[slug]/page.tsx
│   ├── compare/page.tsx          # Client component
│   ├── claim/[slug]/page.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── agents/[slug]/page.tsx
│   ├── admin/page.tsx
│   ├── shortlist/page.tsx
│   ├── ai-pulse/
│   ├── benchmarks/page.tsx
│   ├── agentic-ai/page.tsx
│   ├── use-cases/
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                       # Shadcn components (migrated)
│   ├── directory/                # Agent cards, filters, search
│   ├── agent-detail/             # Detail page sections
│   ├── company/                  # Company page components
│   ├── dashboard/                # Provider dashboard components
│   ├── admin/                    # Admin dashboard components
│   ├── compare/                  # Comparison tool
│   └── shared/                   # Navbar, footer, etc.
├── convex/                       # Backend (unchanged location)
├── lib/                          # Utilities, helpers
├── hooks/                        # Client-side hooks
├── types/                        # TypeScript types
├── data/                         # Static data (briefs, etc.)
└── public/                       # Static assets
```

---

## 7. Content Gating

### 7.1 What's Public (Anonymous)

- Agent name, tagline, company name, all category tags, description
- Agent card in directory listing
- Company name, description, website, headquarters on company page
- Category listing pages

### 7.2 What's Gated (Requires Free Account)

- Use cases, integrations, expected business outcomes, business functions
- Agent comparison tool
- Shortlisting
- Contact requests (future)

### 7.3 Teaser/Blur UX

Gated sections on agent detail pages are **partially visible but blurred**, with an overlay CTA:
- Section headers visible (e.g., "Use Cases", "Integrations")
- Content count shown (e.g., "4 use cases", "7 integrations")
- Content itself is blurred/overlaid
- Prominent CTA: "Create a free account to see full agent details, compare agents, and build your shortlist"

---

## 8. Comparison Tool

### 8.1 Entry Points

- "Add to Compare" button on agent cards in directory listing
- "Add to Compare" button on agent detail pages
- Clicking either while anonymous triggers signup flow

### 8.2 Compare Tray

Floating bottom bar appears when 1+ agents are selected:
- Shows selected agent thumbnails (max 4)
- "Compare Now" button (enabled at 2+ agents)
- "Clear" button

### 8.3 Comparison Page (`/compare?agents=slug1,slug2`)

Side-by-side table comparing:
- Description
- Functional categories
- Industry categories
- Use cases
- Integrations
- Expected business outcomes
- Business functions

Features:
- Shareable URL
- Highlight differences between agents
- Requires login (redirects to sign-up if anonymous)

---

## 9. Migration Strategy

### 9.1 Approach

Full migration from Vite SPA to Next.js App Router in one release.

### 9.2 Steps

1. Create Next.js project in the same repo (new branch)
2. Move `convex/` directory as-is (framework-agnostic)
3. Migrate React components (remove React Router, use Next.js `Link`/`useRouter`)
4. Add server components for public pages with Convex `fetchQuery`
5. Wrap authenticated pages in `ConvexProviderWithClerk` client boundary
6. Configure Clerk middleware for Next.js route protection
7. Add ISR with `revalidatePath` or time-based revalidation
8. Deploy to Vercel (natively supported)

### 9.3 Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | SSR/SSG for SEO, official Convex + Clerk support |
| Styling | Tailwind + Shadcn | No changes needed, works identically |
| Animations | Framer Motion (client components only) | Server components handle layout |
| Backend | Convex (`convex-nextjs` for server, `convex/react` for client) | Existing backend preserved |
| Auth | Clerk (`@clerk/nextjs`) with magic link | Native Next.js middleware support |
| Hosting | Vercel | Already in use, Next.js native |

---

## 10. Data Seeding

### 10.1 Process

1. User finishes scraping → exports as structured JSON
2. Node.js seed script reads JSON
3. For each company: call Convex mutation to insert into `companies`
4. For each agent under company: call Convex mutation to insert into `agents` with `company_id` reference
5. Generate slugs, search_text, map taxonomy categories
6. Script is idempotent (check by slug before inserting)

### 10.2 Data Mapping

| Scraped Field | Maps To |
|---------------|---------|
| Company name | `companies.name` + generate `companies.slug` |
| Website | `companies.website` |
| Headquarters | `companies.headquarters` |
| Founded | `companies.founded` |
| Company Size | `companies.company_size` |
| Description | `companies.description` |
| Primary Verticals | `companies.primary_verticals` |
| Contact Email | `companies.contact_email` |
| Verification | `companies.verification_status` |
| Agent Name | `agents.agent_name` + generate `agents.slug` |
| Tagline | `agents.tagline` |
| Description | `agents.description` |
| Use Cases | `agents.use_cases` (split into array) |
| Industries Supported | `agents.industry_categories` |
| Business Functions | `agents.business_functions` + `agents.functional_categories` |
| Expected Outcomes | `agents.expected_outcomes` |
| Integrations | `agents.integrations` |
| Source URL | `agents.source_url` |

---

## 11. Free Email Provider Blocking

Applied on the claim form's company email field:
- **Client-side:** Immediate validation feedback
- **Server-side:** Mutation rejects free email domains

Blocked domains include: gmail.com, yahoo.com, outlook.com, hotmail.com, live.com, aol.com, icloud.com, mail.com, protonmail.com, zoho.com, yandex.com, gmx.com, and similar.

---

## 12. What's Not In Scope (Future)

- Monetization (see `docs/plans/2026-03-09-monetization-options.md`)
- Contact request flow between buyers and providers
- Self-assessment integration with directory
- Auto-generated comparison pages for pSEO
- Category combination pages (e.g., `/agents/customer-experience/healthcare`)
- Analytics dashboards for providers (views, shortlists)
- Review/rating system
