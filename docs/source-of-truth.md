# Orbys360 — Source of Truth

> **Generated:** 2026-03-18
> Comprehensive documentation of all functionality, user flows, and persona capabilities across the entire platform.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Authentication & Role System](#2-authentication--role-system)
3. [The Three Personas](#3-the-three-personas)
4. [Public Pages (No Auth Required)](#4-public-pages-no-auth-required)
5. [GCC Buyer — Complete User Flow](#5-gcc-buyer--complete-user-flow)
6. [Provider — Complete User Flow](#6-provider--complete-user-flow)
7. [Admin — Complete User Flow](#7-admin--complete-user-flow)
8. [Cross-Persona Features](#8-cross-persona-features)
9. [Data Schema Reference](#9-data-schema-reference)
10. [API Surface Reference](#10-api-surface-reference)
11. [Route Map](#11-route-map)
12. [Component Inventory](#12-component-inventory)
13. [Content Pages (Placeholder)](#13-content-pages-placeholder)
14. [SEO Infrastructure](#14-seo-infrastructure)

---

## 1. Platform Overview

Orbys360 is an AI-first GCC (Global Capability Center) advisory platform. It serves as a marketplace connecting GCC buyers who need AI solutions with providers who offer AI agents and services. An admin layer moderates all submissions and edits.

**Stack:** Next.js 15 (App Router) + TypeScript + Convex (backend) + Clerk (auth) + Tailwind CSS + Framer Motion

**Data:** 78 companies, 231 agents (seeded from `data/seed/` JSON files)

---

## 2. Authentication & Role System

### Auth Provider
- **Clerk** handles all authentication (sign-up, sign-in, session management)
- `ClerkProvider` wraps the entire app in `src/app/layout.tsx`
- `ConvexClientProvider` provides Convex context inside Clerk

### Role Assignment
Roles are written to **Clerk `publicMetadata.role`** when available, but the live app now also relies on Convex state for routing. Provider intent is stored in `providerProfiles`, GCC completion is stored in `gccProfiles`, and active company ownership is stored in `companyMembers`.

Valid roles: `"gcc"` | `"provider"`

### Role Detection
`src/auth/useUserRole.ts` resolves role in this order:
1. Clerk `publicMetadata.role`
2. Active provider company membership (`companyMembers.getMyCompany`)
3. Provider setup intent (`providerProfiles.getMine`)
4. GCC profile (`gccProfiles.getProfile`)

This means provider routing no longer depends entirely on `POST /api/set-role`.

### Middleware Protection
`middleware.ts` uses `clerkMiddleware` with `createRouteMatcher` to protect:
- `/dashboard(.*)` — Provider dashboard
- `/gcc-dashboard(.*)` — GCC buyer dashboard
- `/shortlist(.*)` — Agent shortlist
- `/compare(.*)` — Compare tool
- `/onboarding(.*)` — Onboarding flow

All other routes (directory, agent pages, company pages, etc.) are **public**.

### Admin Auth
Admin uses **Clerk-authenticated allowlist access**:
- `/admin` is protected by Clerk middleware
- Convex admin functions derive identity from `ctx.auth.getUserIdentity()`
- Admin access is granted only when the Clerk user ID is included in `ADMIN_CLERK_USER_IDS` or the account email is included in `ADMIN_CLERK_EMAILS`
- Admin actions and moderation events are attributed in `adminAuditLogs`

### Convex Auth
`convex/lib/auth.ts` provides:
- `requireAuth(ctx)` — throws if unauthenticated, returns Clerk `subject` (userId)
- `getAuthUserId(ctx)` — returns userId or null

---

## 3. The Three Personas

| Persona | Role Value | Dashboard | Description |
|---------|-----------|-----------|-------------|
| **GCC Buyer** | `"gcc"` | `/gcc-dashboard` | Enterprise leaders looking for AI solutions. Browse, compare, shortlist agents, and contact providers. |
| **Provider** | `"provider"` | `/provider/setup` → `/dashboard` | Companies offering AI agents/services. Choose whether to claim an existing listing or create a net-new company profile, then manage company profile, agents, and team after ownership is active. |
| **Admin** | N/A (Clerk allowlist) | `/admin` | Platform moderators. Review all claims, edits, submissions, and contact requests. |

---

## 4. Public Pages (No Auth Required)

### 4.1 Landing Page — `/`
**File:** `src/app/page.tsx` (Server Component)
**Components:** Hero, AgentSearchSection, ValueProposition, SevenMandates, EnterprisesSection, ProvidersSection, EarlyMemberBenefits, InterestCapture, SocialProof, WhySection, Footer

**Functionality:**
- Marketing landing page with scroll-to-section navigation
- Early access email capture form (`earlyAccess.submit` mutation)
- "Join Now" CTA → `/sign-up`

### 4.2 Agent Directory — `/directory`
**File:** `src/app/directory/page.tsx` (Server Component) → `DirectoryContent` (Client)
**Auth:** Public
**SEO:** Static metadata, JSON-LD (`directoryJsonLd()`)

**Functionality:**
- Full-text search across agents (name, description, categories)
- Filter sidebar: category (9 categories), functional category, industry category, infrastructure category
- Mobile filter drawer
- Agent card grid with company logos, category dots, taglines
- "Compare" button on each card (adds to compare tray, max 4)
- Floating compare tray at bottom when agents selected
- Pagination

**Data Flow:**
- `useQuery(api.agents.listAll)` — loads all active agents client-side
- `useQuery(api.companies.listAll)` — loads all companies for logo lookup
- Client-side filtering and search

**Key Components:**
- `DirectoryContent` — main orchestrator, manages filters/search state
- `FilterSidebar` — desktop category filters
- `MobileFilterDrawer` — mobile filter UI
- `SearchBar` — text search input
- `AgentGrid` — responsive grid of AgentCards
- `AgentCard` — individual agent card (name, tagline, category, company logo, compare button)
- `FeaturedAgentCard` — featured/highlighted agent card
- `CompanyLogo` — renders company logo with fallback
- `CompareTray` — floating bottom tray showing selected agents

### 4.3 Agent Detail — `/agents/[slug]`
**File:** `src/app/agents/[slug]/page.tsx` (Server Component, ISR `revalidate=3600`)
**Auth:** Public
**SEO:** `generateMetadata`, `generateStaticParams`, JSON-LD (`agentJsonLd`, `breadcrumbJsonLd`), canonical URL, breadcrumbs

**Data Fetching (Server):**
- `fetchQuery(api.agents.getBySlug, { slug })`
- `fetchQuery(api.companies.getById, { id })` (if agent has company_id)

**Layout:** Two-column — main content (left) + sticky stats panel (right)

**Components:**
- `AgentHero` — agent name, tagline, company info, category badge, compare + shortlist buttons
- `AgentDetailSections` — description, functional categories, industry categories, use cases, integrations (with integration icons), expected outcomes
- `AgentStatsPanel` — sidebar with company info, source/demo URLs, "Contact Provider" button, shortlist button
- `Breadcrumbs` — visible breadcrumb navigation
- `CompareTray` — floating compare tray

### 4.4 Company Profile — `/companies/[slug]`
**File:** `src/app/companies/[slug]/page.tsx` (Server Component, ISR `revalidate=3600`)
**Auth:** Public
**SEO:** `generateMetadata`, `generateStaticParams`, JSON-LD (`companyJsonLd`, `breadcrumbJsonLd`)

**Data Fetching (Server):**
- `fetchQuery(api.companies.getBySlug, { slug })`
- `fetchQuery(api.agents.getByCompany, { company_id })`

**Functionality:**
- Company header (name, description, website, headquarters, size, verticals, logo)
- "Claim This Profile" button (visible when unclaimed or not already pending)
- Grid of agents by this company (reuses `AgentCard`)

### 4.5 Category Page — `/categories/[slug]`
**File:** `src/app/categories/[slug]/page.tsx` (Server Component, ISR `revalidate=3600`)
**Auth:** Public
**SEO:** `generateMetadata`, `generateStaticParams` (all 9 categories), JSON-LD (`categoryJsonLd`, `breadcrumbJsonLd`)

**Data:** `fetchQuery(api.agents.list, { category, limit: 50 })`

**Functionality:**
- Category name, agent count
- Grid of agent cards filtered to that category

**Categories (9):** Customer Experience, Sales & Marketing, Finance & Accounting, HR & Workforce, Engineering & DevOps, IT Operations, Data & Analytics, Legal & Compliance, Operations & Supply Chain

### 4.6 Provider Ecosystem — `/providers`
**File:** `src/app/providers/page.tsx` (Server Component)
**Status:** Placeholder with link to directory

### 4.7 Orbyt — `/orbyt`
**File:** `src/app/orbyt/page.tsx` (Server Component)
**Status:** Placeholder ("content migration in progress")

---

## 5. GCC Buyer — Complete User Flow

### 5.1 Onboarding Flow
1. **Sign up** at `/sign-up` via Clerk
2. **Redirect** to `/onboarding` (or `/auth-redirect` which auto-routes)
3. **Role selection** — `RoleSelector` presents two options:
   - "I'm looking for AI agents" → GCC flow
   - "I'm listing AI agents & services" → Provider flow
4. **GCC Profile Form** — `GccOnboardingForm` collects:
   - Name, Organization, Email, Industry (dropdown of 14 industries)
5. **On submit:**
   - Creates `gccProfiles` record via `gccProfiles.createProfile`
   - Calls `POST /api/set-role` with `{ role: "gcc" }` to set Clerk metadata
   - Reloads Clerk user
   - Redirects to `/gcc-dashboard`

### 5.2 GCC Dashboard — `/gcc-dashboard`
**File:** `src/app/gcc-dashboard/page.tsx` (Client, Auth Required)
**Access:** `role === "gcc"` only. Redirects providers to `/dashboard`, unroled users to `/onboarding`.

**Tabs (2):**

#### 5.2.1 Shortlisted Agents Tab
**Component:** `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx`
**Data:** `useQuery(api.shortlists.getMine)` → `useQuery(api.agents.getByIds, { ids })`

- Lists all agents the user has shortlisted
- Each card links to agent detail page
- Remove from shortlist (trash icon) via `shortlists.remove`
- Empty state with link to directory

#### 5.2.2 Current Requests Tab
**Component:** `src/components/gcc-dashboard/CurrentRequestsTab.tsx`
**Data:** `useQuery(api.gcc.getMyContactRequests)`

- Lists all contact requests the GCC user has sent
- Shows agent name, message, status badge (pending_admin / approved / rejected)
- Read-only — no actions available

### 5.3 Shortlist Feature
**Trigger:** Shortlist button on agent detail pages / agent cards
**Data:** `shortlists.add(agent_id)` / `shortlists.remove(agent_id)` / `shortlists.isShortlisted(agent_id)`
**Storage:** `agentShortlists` table (user_id + agent_id, unique index)

### 5.4 Compare Feature
**Hook:** `src/hooks/useCompare.ts` — module-level state with `useSyncExternalStore`
**Storage:** `localStorage` keys: `orbys360-compare`, `orbys360-compare-names`
**Max:** 4 agents

**Flow:**
1. Click "Compare" on agent cards in directory → adds slug to compare store
2. `CompareTray` appears at bottom showing selected agents
3. Navigate to `/compare` page
4. Side-by-side comparison grid: tagline, description, categories, industries, use cases, integrations, outcomes, functions
5. Can remove agents from comparison
6. "View full profile" links for each agent

### 5.5 Shortlist Page — `/shortlist`
**File:** `src/app/shortlist/page.tsx` (Client, Auth Required)
**Data:** `useQuery(api.shortlists.getMine)` → `useQuery(api.agents.getByIds)`

- Same as Shortlisted Agents Tab but as a standalone page
- Grid of shortlisted agents with remove buttons

### 5.6 Contact Provider (Legacy Component)
**Component:** `src/components/shared/ContactProviderModal.tsx`
**Note:** This component uses legacy imports (`@/hooks/use-gcc`, `@/types/agent`, `@/types/provider`) — appears to be from old architecture. The current contact flow uses `gcc.createContactRequest` mutation which creates `providerRequests` records with status `pending_admin`.

---

## 6. Provider — Complete User Flow

### 6.1 Onboarding Flow
1. **Sign up** at `/sign-up` via Clerk
2. **Redirect** to `/onboarding`
3. **Role selection** — choose "I'm listing AI agents & services"
4. **Provider setup intent** is created via `providerProfiles.ensureProvider`
5. **Redirect** to `/provider/setup`
6. Provider chooses one of two setup paths:
   - **Claim an existing company**
   - **Create a new company profile**

### 6.2 Provider Setup Hub — `/provider/setup`
**File:** `src/app/provider/setup/page.tsx` (Client, Auth Required)
**Access:** `role === "provider"` only. Redirects active providers to `/dashboard`.

This page is the new entry point for all provider users who do not yet own a company listing.

**Path A: Claim an Existing Company**
1. Browse directory → open company profile → click `Claim This Profile`
2. `ClaimForm` validates full name + corporate email
3. `claims.submitClaim` creates a `claimRequests` record and also links the request to the signed-in provider via `claimant_user_id`
4. Admin reviews the claim
5. On approval:
   - magic link token is generated
   - claim status becomes `approved`
   - provider setup shows a `Finish Activation` CTA if the claim is tied to the signed-in user
6. `claims.activateClaim`:
   - marks claim `activated`
   - marks company `claimed`
   - creates/updates active owner membership in `companyMembers`
   - upserts `providerProfiles` with `onboarding_path = "claim_existing"`
7. User is redirected to `/dashboard`

**Path B: Create a New Company Profile**
1. Choose `Create a new company profile` in `/provider/setup`
2. Submit company details via the inline setup form:
   - contact email
   - company name
   - website
   - headquarters
   - company size
   - primary verticals
   - description
3. `companySubmissions.create` inserts a pending `companySubmissions` record and upserts `providerProfiles` with `onboarding_path = "create_new"`
4. Admin reviews the submission in the `New Companies` tab
5. On approval:
   - a new `companies` record is created
   - the provider gets an active owner membership in `companyMembers`
   - the company submission is marked `approved`
6. User is redirected to `/dashboard`

### 6.3 Provider Dashboard — `/dashboard`
**File:** `src/app/dashboard/page.tsx` (Client, Auth Required)
**Access:** Active provider ownership only. Providers without an active company membership are redirected to `/provider/setup`.
**Data:** `useQuery(api.companyMembers.getMyCompany)` — finds company via user's membership

**States:**
- **Loading:** Spinner
- **No active company membership:** Redirect to `/provider/setup`
- **Has company:** Shows 3-tab interface

**Tabs (3):**

#### 6.3.1 Profile Tab
**Component:** `src/components/dashboard/ProfileTab.tsx`
**Data:** `useQuery(api.companyMembers.getMyCompany)` + `useMutation(api.companyEdits.create)`

- Displays company name, headquarters, description, website
- "Edit" button toggles inline edit form (description, website)
- On submit: compares form values to current, builds diff, calls `companyEdits.create`
- Success toast: "Edit submitted for admin review"
- All edits go through admin approval pipeline

#### 6.3.2 Agents Tab
**Component:** `src/components/dashboard/AgentsTab.tsx`
**Data:** `useQuery(api.agents.getByCompany)` + `useQuery(api.agents.getMyEdits)`

**3-view state machine:** `list` | `detail` | `submit`

**List View:**
- Grid of agent cards (clickable → detail view)
- Each card shows: agent name, tagline, category (with color dot)
- Clock icon on cards with pending edits
- "Submit New Agent" button → submit view

**Detail View** (`AgentDetailView`):
- Full read-only display of all agent fields
- Grouped sections: header, description, classification (chips), use cases (cards), integrations, expected outcomes, links
- "Edit Agent" button → toggles to `AgentForm` in edit mode
- Yellow banner if pending edits exist for this agent
- "Back to Agents" navigation

**Edit Mode** (within Detail View):
- `AgentForm` with `mode="edit"`, pre-filled with agent data
- Compares form state vs original (JSON.stringify per field)
- Only sends changed fields to `agents.createEdit({ agent_id, payload })`
- "No changes detected" message if nothing changed
- Success → returns to detail view with green toast

**Submit View:**
- `AgentForm` with `mode="submit"`
- Full agent submission form with collapsible sections:
  1. **Basic Info** (open by default): agent_name*, tagline, category* (dropdown), description*
  2. **Classification** (collapsed): functional_categories and industry_categories via taxonomy palettes; infrastructure_categories via TagInput
  3. **Use Cases** (collapsed): repeatable title+description groups
  4. **Integrations** (collapsed): TagInput
  5. **Expected Outcomes** (collapsed): TagInput
  6. **Links** (collapsed): source_url, demo_url
- Calls `agents.submit` mutation (creates `agentSubmissions` record, status: `pending`)
- Success → returns to list with green toast

**Form Sub-components** (`AgentFormFields.tsx`):
- `CategorySelect` — dropdown of 9 categories from `CATEGORY_COLORS`
- `TagInput` — text input + "Add" button → removable chips (for all `string[]` fields)
- `UseCaseFields` — repeatable `{title, description}` groups with add/remove
- `FormSection` — collapsible section with chevron toggle

#### 6.3.3 Team Tab
**Component:** `src/components/dashboard/TeamTab.tsx`
**Data:** `useQuery(api.companyMembers.getMembers)` + `useMutation(api.companyMembers.inviteMember)` + `useMutation(api.companyMembers.removeMember)`

- Lists all team members (email, role badge)
- "Invite" button → email input form → `companyMembers.inviteMember`
  - Only owners can invite (enforced server-side)
  - Creates member with role: `"member"`, status: `"pending"`
- When the invited email signs in, onboarding/auth redirect runs `companyMembers.acceptPendingInvite`
  - matching pending invite is converted to `status: "active"` and linked to `user_id`
  - provider profile is ensured and provider role is best-effort synced to Clerk metadata
- Remove button (trash icon) on non-owner members → `companyMembers.removeMember`

---

## 7. Admin — Complete User Flow

### 7.1 Admin Authentication
**Route:** `/admin`
**File:** `src/app/admin/page.tsx` (Client Component)
**Auth:** Clerk session required. Access is granted only to allowlisted Clerk user IDs from `ADMIN_CLERK_USER_IDS`.

**Flow:**
1. Clerk middleware protects `/admin`
2. Client queries `api.admin.getViewerAccess`
3. Convex admin functions enforce allowlist membership via `requireAdmin()`
4. "Logout" button signs the Clerk session out

### 7.2 Admin Dashboard
**7 tabs** with pending count badges in tab bar:

#### 7.2.1 Overview Tab
**Component:** `src/components/admin/AdminOverviewTab.tsx`
**Data:** `useQuery(api.admin.getDirectoryStats, {})`

**Stats displayed:**
- Total active agents
- Total companies
- Claimed percentage (companies)
- Total GCC profiles
- Pending counts for: claims, company edits, agent submissions, agent edits, contact requests

#### 7.2.2 Claims Tab
**Component:** `src/components/admin/AdminClaimsTab.tsx`
**Data:** `useQuery(api.admin.getPendingClaims)` / `useQuery(api.admin.getClaimsHistory)`

**Pending View:**
- Each claim card shows: company name, claimant name, claimant email, submission date
- **Approve** button → `admin.approveClaim` (action):
  - Generates magic link token (UUID)
  - Sets 7-day expiry
  - Updates claim status to `"approved"`
  - Sends activation email via Resend (uses `emails/claimApproved.ts` template)
- **Reject** button → optional rejection notes → `admin.rejectClaim`:
  - Sets claim to `"rejected"`, company back to `"unclaimed"`

**History View:**
- Shows resolved claims (approved/rejected) with status badges and dates

#### 7.2.3 Company Edits Tab
**Component:** `src/components/admin/AdminCompanyEditsTab.tsx`
**Data:** `useQuery(api.admin.getPendingCompanyEdits)` / `useQuery(api.admin.getCompanyEditsHistory)`

**Pending View:**
- Shows each edit with company name, changed fields (key-value pairs), submission date
- **Approve** → `admin.approveCompanyEdit`: applies payload directly to company record
- **Reject** → optional notes → `admin.rejectCompanyEdit`

**History View:** Resolved edits with status badges

#### 7.2.4 Agents Tab (Submissions)
**Component:** `src/components/admin/AdminAgentsTab.tsx`
**Data:** `useQuery(api.admin.getPendingAgents)` / `useQuery(api.admin.getAgentSubmissionsHistory)`

**Pending View:**
- Each submission shows: agent name, category, description, all submitted fields
- **Approve** → `admin.approveAgent`:
  - Creates new agent record in `agents` table
  - Auto-generates slug from agent name
  - Sets status `"active"`
  - Builds `search_text` for full-text search
- **Reject** → optional notes → `admin.rejectAgent`
- **Request Changes** → notes → `admin.requestChangesAgent` (sets `changes_requested` status)

**History View:** Resolved submissions with status badges

#### 7.2.5 Agent Edits Tab
**Component:** `src/components/admin/AdminAgentEditsTab.tsx`
**Data:** `useQuery(api.admin.getPendingAgentEdits)` / `useQuery(api.admin.getAgentEditsHistory)`

**Pending View:**
- Shows agent name, changed fields (payload key-value pairs), date
- **Approve** → `admin.approveAgentEdit`: applies payload directly to agent record
- **Reject** → optional notes → `admin.rejectAgentEdit`

**History View:** Resolved edits with status badges

#### 7.2.6 Contact Requests Tab
**Component:** `src/components/admin/AdminContactRequestsTab.tsx`
**Data:** `useQuery(api.admin.getPendingContactRequests)` / `useQuery(api.admin.getContactRequestsHistory)`

**Pending View:**
- Shows GCC email, agent name, company name, message, date
- **Approve** → `admin.approveContactRequest`
- **Reject** → optional notes → `admin.rejectContactRequest`

**History View:** Resolved requests with status badges

### 7.3 Admin Review Pipeline Summary

| What | Submitted By | Mutation | Admin Approve | Admin Reject | Effect on Approve |
|------|-------------|----------|---------------|--------------|-------------------|
| Claim Request | Provider | `claims.submitClaim` | `admin.approveClaim` | `admin.rejectClaim` | Sends magic link email, claim → `approved` |
| Company Edit | Provider | `companyEdits.create` | `admin.approveCompanyEdit` | `admin.rejectCompanyEdit` | Patches company record with payload |
| Agent Submission | Provider | `agents.submit` | `admin.approveAgent` | `admin.rejectAgent` | Creates new active agent in `agents` table |
| Agent Edit | Provider | `agents.createEdit` | `admin.approveAgentEdit` | `admin.rejectAgentEdit` | Patches agent record with payload |
| Contact Request | GCC | `gcc.createContactRequest` | `admin.approveContactRequest` | `admin.rejectContactRequest` | Status becomes `approved` |

---

## 8. Cross-Persona Features

### 8.1 Navbar
**Component:** `src/components/shared/Navbar.tsx`
**Behavior:** Renders on public pages plus the provider and GCC dashboards. Hidden only on standalone app flows (`/onboarding`, `/admin`, `/auth`).

**Auth-aware elements:**
- **Not signed in:** "Join Now" button → `/sign-up`
- **Signed in:** Dashboard link (routes to correct dashboard based on role) + Clerk `UserButton`

**Navigation:**
- Landing page section links (Why, Enterprises, Partners, Benefits)
- Directory link
- Resources dropdown (AI Pulse, Thought Leadership, Tools, Provider Ecosystem)
- LinkedIn link

### 8.2 Early Access
**Landing page form** (InterestCapture section)
**Backend:** `earlyAccess.submit({ email })` — idempotent, skips duplicates
**Storage:** `earlyAccessSignups` table

### 8.3 Auth Redirect
**Route:** `/auth-redirect`
**Purpose:** After Clerk sign-in/sign-up, routes user to correct destination based on role:
- `gcc` → `/gcc-dashboard`
- `provider` → `/dashboard`
- No role → `/onboarding`

---

## 9. Data Schema Reference

### 9.1 Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `earlyAccessSignups` | Landing page email capture | email, created_at |
| `companies` | Company directory entries (78 seeded) | slug, name, description, website, headquarters, company_size, primary_verticals[], logo_url, verification_status, claim_status, claimed_by_user_id |
| `agents` | AI agent directory entries (231 seeded) | slug, agent_name, tagline, description, category, company_id→companies, use_cases[], functional_categories[], industry_categories[], infrastructure_categories[], expected_outcomes[], integrations[], source_url, demo_url, status, search_text |
| `claimRequests` | Company claim requests | company_id→companies, claimant_name, claimant_email, claimant_user_id, status (pending/approved/rejected/activated), magic_link_token, magic_link_expires_at |
| `providerProfiles` | Provider setup intent + chosen path | user_id, onboarding_path (claim_existing/create_new) |
| `companySubmissions` | Net-new company creation requests | user_id, contact_email, company_name, website, headquarters, company_size, primary_verticals[], description, status, created_company_id |
| `companyMembers` | Company team membership | company_id→companies, user_id, email, role (owner/member), status (pending/active) |
| `companyEdits` | Pending company profile edits | company_id→companies, user_id, payload (any), status (pending/approved/rejected) |
| `gccProfiles` | GCC buyer profiles | user_id, name, email, organization, industry |
| `agentSubmissions` | New agent submissions (pending review) | user_id, company_id→companies, agent_name, description, category, all agent fields, submission_status (pending/approved/rejected/changes_requested) |
| `agentEdits` | Existing agent edit requests | agent_id→agents, user_id, payload (any), status (pending/approved/rejected) |
| `agentShortlists` | GCC user shortlisted agents | user_id, agent_id→agents |
| `contactLogs` | Contact interaction logs | gcc_user_id, agent_id→agents, company_id→companies |
| `providerRequests` | GCC-to-Provider contact requests | company_id→companies, gcc_user_email, gcc_user_id, agent_id→agents, message, status (pending_admin/approved/rejected/contacted/archived) |
| `adminAuditLogs` | Admin audit trail | actor_user_id, action, entity_type, entity_id, metadata, created_at |

### 9.2 Key Indexes

| Table | Index | Fields |
|-------|-------|--------|
| companies | by_slug | slug |
| companies | by_claimStatus | claim_status |
| companies | search_companies | name (search), claim_status (filter) |
| agents | by_slug | slug |
| agents | by_status | status |
| agents | by_category | category |
| agents | by_companyId | company_id |
| agents | search_agents | search_text (search), status + category (filter) |
| claimRequests | by_companyId | company_id |
| claimRequests | by_claimantUserId | claimant_user_id |
| claimRequests | by_status | status |
| claimRequests | by_magicLinkToken | magic_link_token |
| providerProfiles | by_userId | user_id |
| companySubmissions | by_userId | user_id |
| companySubmissions | by_status | status |
| companyMembers | by_userId | user_id |
| companyMembers | by_companyId | company_id |
| agentSubmissions | by_userId | user_id |
| agentSubmissions | by_status | submission_status |
| agentEdits | by_userId | user_id |
| agentEdits | by_status | status |
| agentShortlists | by_userId | user_id |
| agentShortlists | by_userAndAgent | user_id, agent_id |
| providerRequests | by_gccUserId | gcc_user_id |
| providerRequests | by_status | status |
---

## 10. API Surface Reference

### 10.1 Public Queries (No Auth)

| Query | File | Purpose |
|-------|------|---------|
| `agents.list` | convex/agents.ts | Search/filter agents (paginated) |
| `agents.listAll` | convex/agents.ts | All active agents (for directory) |
| `agents.getById` | convex/agents.ts | Single agent by ID |
| `agents.getBySlug` | convex/agents.ts | Single agent by slug |
| `agents.getByIds` | convex/agents.ts | Multiple agents by IDs |
| `agents.getByCompany` | convex/agents.ts | Agents belonging to a company |
| `agents.listAllSlugs` | convex/agents.ts | All slugs (for generateStaticParams) |
| `companies.list` | convex/companies.ts | Search/paginate companies |
| `companies.listAll` | convex/companies.ts | All companies |
| `companies.getBySlug` | convex/companies.ts | Single company by slug |
| `companies.getById` | convex/companies.ts | Single company by ID |
| `companies.listAllSlugs` | convex/companies.ts | All slugs (for generateStaticParams) |
| `claims.getClaimStatus` | convex/claims.ts | Claim requests for a company |
| `claims.getMine` | convex/claims.ts | Latest claim for signed-in provider |
| `claims.validateMagicLink` | convex/claims.ts | Validate activation token |
### 10.2 Auth-Required Queries

| Query | File | Persona | Purpose |
|-------|------|---------|---------|
| `agents.getMySubmissions` | convex/agents.ts | Provider | User's agent submissions |
| `agents.getMyEdits` | convex/agents.ts | Provider | User's agent edits |
| `companyMembers.getMyCompany` | convex/companyMembers.ts | Provider | User's company (via membership) |
| `companyMembers.getMembers` | convex/companyMembers.ts | Provider | Company team members |
| `companyEdits.getByCompany` | convex/companyEdits.ts | Provider | Edits for a company |
| `providerProfiles.getMine` | convex/providerProfiles.ts | Provider | Provider setup intent |
| `providerProfiles.getSetupState` | convex/providerProfiles.ts | Provider | Combined provider setup state (path, latest claim, latest company submission) |
| `companySubmissions.getMine` | convex/companySubmissions.ts | Provider | Latest new-company submission |
| `shortlists.getMine` | convex/shortlists.ts | GCC | User's shortlisted agents |
| `shortlists.isShortlisted` | convex/shortlists.ts | GCC | Check if agent is shortlisted |
| `gcc.getMyContactRequests` | convex/gcc.ts | GCC | User's contact requests |
| `gccProfiles.getProfile` | convex/gccProfiles.ts | GCC | User's GCC profile |

### 10.3 Auth-Required Mutations

| Mutation | File | Persona | Purpose |
|----------|------|---------|---------|
| `claims.submitClaim` | convex/claims.ts | Provider | Submit company claim |
| `claims.activateClaim` | convex/claims.ts | Provider | Activate claim via magic link |
| `providerProfiles.ensureProvider` | convex/providerProfiles.ts | Provider | Create provider setup intent |
| `providerProfiles.setOnboardingPath` | convex/providerProfiles.ts | Provider | Choose claim-existing vs create-new path |
| `companySubmissions.create` | convex/companySubmissions.ts | Provider | Submit a net-new company profile for review |
| `agents.submit` | convex/agents.ts | Provider | Submit new agent for review |
| `agents.createEdit` | convex/agents.ts | Provider | Submit agent edit for review |
| `agents.softDelete` | convex/agents.ts | Provider | Soft-delete agent |
| `companyMembers.inviteMember` | convex/companyMembers.ts | Provider | Invite team member (owner only) |
| `companyMembers.removeMember` | convex/companyMembers.ts | Provider | Remove team member (owner only) |
| `companyEdits.create` | convex/companyEdits.ts | Provider | Submit company edit for review |
| `shortlists.add` | convex/shortlists.ts | GCC | Add agent to shortlist |
| `shortlists.remove` | convex/shortlists.ts | GCC | Remove from shortlist |
| `gcc.createContactRequest` | convex/gcc.ts | GCC | Send contact request for agent |
| `gccProfiles.createProfile` | convex/gccProfiles.ts | GCC | Create GCC profile |
| `earlyAccess.submit` | convex/earlyAccess.ts | Public | Early access email signup |

### 10.4 Admin Operations

| Operation | Type | Purpose |
|-----------|------|---------|
| `admin.getViewerAccess` | Query | Return Clerk-authenticated admin allowlist access |
| `admin.getAuthReconciliationSnapshot` | Query | Snapshot local provider memberships and cached role targets |
| `admin.setCompanyClerkOrganization` | Mutation | Admin-only company ↔ Clerk org link |
| `admin.getDirectoryStats` | Query | Dashboard stats |
| `admin.getPendingClaims` | Query | Pending claim requests |
| `admin.approveClaim` | Action | Approve + send magic link email |
| `admin.rejectClaim` | Mutation | Reject claim |
| `admin.getPendingCompanySubmissions` | Query | Pending new-company submissions |
| `admin.approveCompanySubmission` | Mutation | Approve → create company + owner membership |
| `admin.rejectCompanySubmission` | Mutation | Reject new-company submission |
| `admin.getPendingAgents` | Query | Pending agent submissions |
| `admin.approveAgent` | Mutation | Approve → create agent record |
| `admin.rejectAgent` | Mutation | Reject submission |
| `admin.requestChangesAgent` | Mutation | Request changes on submission |
| `admin.getPendingCompanyEdits` | Query | Pending company edits |
| `admin.approveCompanyEdit` | Mutation | Approve → patch company |
| `admin.rejectCompanyEdit` | Mutation | Reject edit |
| `admin.getPendingAgentEdits` | Query | Pending agent edits |
| `admin.approveAgentEdit` | Mutation | Approve → patch agent |
| `admin.rejectAgentEdit` | Mutation | Reject edit |
| `admin.getPendingContactRequests` | Query | Pending contact requests |
| `admin.approveContactRequest` | Mutation | Approve request |
| `admin.rejectContactRequest` | Mutation | Reject request |
| `admin.getClaimsHistory` | Query | Resolved claims |
| `admin.getAgentSubmissionsHistory` | Query | Resolved submissions |
| `admin.getCompanyEditsHistory` | Query | Resolved company edits |
| `admin.getAgentEditsHistory` | Query | Resolved agent edits |
| `admin.getContactRequestsHistory` | Query | Resolved contact requests |

### 10.5 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `POST /api/set-role` | POST | Sets Clerk `publicMetadata.role` ("gcc" or "provider") |

---

## 11. Route Map

### Public Routes

| Route | Type | Component | Purpose |
|-------|------|-----------|---------|
| `/` | Server | `HomePage` | Landing page |
| `/directory` | Server → Client | `DirectoryContent` | Agent directory with search/filter |
| `/agents/[slug]` | Server (ISR) | `AgentDetailPage` | Agent detail page |
| `/companies/[slug]` | Server (ISR) | `CompanyProfilePage` | Company profile page |
| `/categories/[slug]` | Server (ISR) | `CategoryPage` | Category listing page |
| `/providers` | Server | `ProvidersPage` | Provider ecosystem (placeholder) |
| `/orbyt` | Server | `OrbytPage` | Orbyt marketplace (placeholder) |
| `/ai-pulse` | Server | `AIPulsePage` | AI Pulse listing (placeholder) |
| `/ai-pulse/[slug]` | — | `AIPulseDetail` | AI Pulse article (placeholder) |
| `/thought-leadership` | Server | `ThoughtLeadershipPage` | Articles (placeholder) |
| `/thought-leadership/[slug]` | — | — | Article detail (placeholder) |
| `/tools` | Server | `ToolsPage` | Tools hub (placeholder) |
| `/benchmarks` | Server | `BenchmarksPage` | Benchmarks (placeholder) |
| `/sign-in/[[...sign-in]]` | Client | Clerk `<SignIn>` | Sign in |
| `/sign-up/[[...sign-up]]` | Client | Clerk `<SignUp>` | Sign up |
| `/claim/[slug]` | Server → Client | `ClaimForm` | Company claim form |
| `/claim/activate` | Client | `ActivateContent` | Magic link activation |

### Auth-Protected Routes

| Route | Type | Persona | Component | Purpose |
|-------|------|---------|-----------|---------|
| `/onboarding` | Client | New users | `RoleSelector` / `GccOnboardingForm` | Role selection + GCC profile |
| `/provider/setup` | Client | Provider | `ProviderSetupPage` | Claim-existing vs create-new provider setup hub |
| `/dashboard` | Client | Provider | `ProviderDashboardPage` | Provider dashboard (Profile, Agents, Team) |
| `/gcc-dashboard` | Client | GCC | `GCCDashboardPage` | GCC dashboard (Shortlist, Requests) |
| `/shortlist` | Client | GCC | `ShortlistPage` | Standalone shortlist page |
| `/compare` | Client | Any signed-in | `ComparePage` | Side-by-side agent comparison |
| `/auth-redirect` | Client | Any signed-in | `AuthRedirectPage` | Smart redirect based on role |

### Admin Route (Password Auth)

| Route | Type | Component | Purpose |
|-------|------|-----------|---------|
| `/admin` | Client | `AdminDashboardPage` | Admin dashboard (7 tabs) |

---

## 12. Component Inventory

### Landing Page (`src/components/sections/`)

| Component | Purpose |
|-----------|---------|
| `Hero` | Hero section with CTA |
| `AgentSearchSection` | Quick agent search preview |
| `ValueProposition` | Platform value proposition |
| `SevenMandates` | 7 mandates of the platform |
| `EnterprisesSection` | For enterprises messaging |
| `ProvidersSection` | For providers messaging |
| `EarlyMemberBenefits` | Early member benefits |
| `InterestCapture` | Email capture form |
| `SocialProof` | Social proof elements |
| `WhySection` | Why Orbys360 |
| `Footer` | Site footer |

### Shared (`src/components/shared/`)

| Component | Purpose |
|-----------|---------|
| `Navbar` | Global navigation (auth-aware, role-aware, hidden on app pages) |
| `Container` | Max-width wrapper |
| `Breadcrumbs` | Breadcrumb navigation (visible + JSON-LD) |
| `AnimatedSection` | Framer Motion scroll animation wrapper |
| `FloatingCTA` | Floating call-to-action |
| `ContactProviderModal` | Contact provider modal (legacy) |
| `ShortlistButton` | Shortlist toggle button (legacy, uses old hooks) |
| `Pagination` | Pagination component |

### Directory (`src/components/directory/`)

| Component | Purpose |
|-----------|---------|
| `DirectoryContent` | Main directory orchestrator |
| `AgentCard` | Individual agent card |
| `AgentGrid` | Responsive agent grid |
| `FeaturedAgentCard` | Featured agent card |
| `FilterSidebar` | Desktop filter panel |
| `MobileFilterDrawer` | Mobile filter drawer |
| `SearchBar` | Search input |
| `CompanyLogo` | Company logo with fallback |

### Agent Detail (`src/components/agent-detail/`)

| Component | Purpose |
|-----------|---------|
| `AgentHero` | Agent header with name, tagline, company, category |
| `AgentDetailSections` | Description, categories, use cases, integrations, outcomes |
| `AgentStatsPanel` | Sidebar stats + contact/shortlist actions |
| `GatedSection` | Content gating wrapper |
| `IntegrationIcon` | Integration logo renderer |

### Company (`src/components/company/`)

| Component | Purpose |
|-----------|---------|
| `CompanyHeader` | Company profile header |
| `ClaimProfileButton` | "Claim This Profile" CTA |

### Claim (`src/components/claim/`)

| Component | Purpose |
|-----------|---------|
| `ClaimForm` | Company claim form (name, email, validation) |

### Compare (`src/components/compare/`)

| Component | Purpose |
|-----------|---------|
| `CompareTray` | Floating bottom compare tray |

### Provider Dashboard (`src/components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `ProfileTab` | Company profile view/edit |
| `AgentsTab` | Agent list/detail/submit (3-view state machine) |
| `AgentDetailView` | Agent detail read-only + edit toggle |
| `AgentForm` | Full agent submit/edit form (15 fields) |
| `AgentFormFields` | CategorySelect, TagInput, UseCaseFields, FormSection |
| `TeamTab` | Team member management |

### GCC Dashboard (`src/components/gcc-dashboard/`)

| Component | Purpose |
|-----------|---------|
| `ShortlistedAgentsTab` | Shortlisted agents list |
| `CurrentRequestsTab` | Contact request history |

### Admin (`src/components/admin/`)

| Component | Purpose |
|-----------|---------|
| `AdminOverviewTab` | Stats overview |
| `AdminClaimsTab` | Claim review (pending + history) |
| `AdminCompanySubmissionsTab` | Net-new company submission review |
| `AdminCompanyEditsTab` | Company edit review |
| `AdminAgentsTab` | Agent submission review |
| `AdminAgentEditsTab` | Agent edit review |
| `AdminContactRequestsTab` | Contact request review |

### Onboarding (`src/components/onboarding/`)

| Component | Purpose |
|-----------|---------|
| `RoleSelector` | GCC vs Provider role choice |
| `GccOnboardingForm` | GCC profile form (name, org, email, industry) |

### Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useCompare` | Compare store (localStorage + useSyncExternalStore, max 4 agents) |

### Auth (`src/auth/`)

| Hook | Purpose |
|------|---------|
| `useUserRole` | Reads role from Clerk `publicMetadata.role` |

---

## 13. Content Pages (Placeholder)

These routes exist with static metadata but have placeholder content:

| Route | Title | Status |
|-------|-------|--------|
| `/ai-pulse` | AI Pulse — Daily Briefs | "Content coming soon" |
| `/ai-pulse/[slug]` | AI Pulse Detail | Components exist (`BriefCard`, `BriefHeader`, etc.) |
| `/thought-leadership` | Thought Leadership | "Content migration in progress" |
| `/thought-leadership/[slug]` | Article Detail | Route exists |
| `/tools` | Tools Hub | "Content migration in progress" |
| `/benchmarks` | Benchmarks | "Content migration in progress" |
| `/orbyt` | Orbyt Marketplace | "Content migration in progress" |
| `/providers` | Provider Ecosystem | Placeholder with directory link |

**AI Pulse components exist** (`src/components/ai-pulse/`): BriefCard, BriefHeader, DevelopmentSection, ImpactSection, OpportunitiesRisksSection, UseCaseSection

**Orbyt components exist** (`src/components/orbyt/`): CategoriesSection, HowItWorks, OrbytHero, SecuritySection, WhatIsOrbyt, WhyChooseOrbyt

---

## 14. SEO Infrastructure

### Metadata
- `metadataBase` set in `layout.tsx` for relative OG URL resolution
- All dynamic pages have `generateMetadata` with title, description, canonical URL, Open Graph, Twitter Cards
- All detail pages have `generateStaticParams` for SSG at build time

### JSON-LD Structured Data
**Utility:** `src/lib/json-ld.ts`

| Function | Schema Type | Used On |
|----------|-------------|---------|
| `agentJsonLd()` | SoftwareApplication | `/agents/[slug]` |
| `companyJsonLd()` | Organization | `/companies/[slug]` |
| `categoryJsonLd()` | CollectionPage | `/categories/[slug]` |
| `breadcrumbJsonLd()` | BreadcrumbList | All detail pages |
| `directoryJsonLd()` | CollectionPage | `/directory` |

### ISR
All server-rendered detail pages use `export const revalidate = 3600` (1 hour)

### Breadcrumbs
- **Visible:** `<Breadcrumbs>` component on all detail pages
- **Schema:** BreadcrumbList JSON-LD injected via `<script type="application/ld+json">`
- **Path:** Home → Directory → [Category] → [Agent/Company]

### Categories
9 categories defined in `src/lib/category-colors.ts`, also used by:
- `src/lib/categories.ts` — `ALL_CATEGORIES`, `slugifyCategory()`, `categoryFromSlug()`
- `generateStaticParams` on `/categories/[slug]`
- `CategorySelect` dropdown in agent form

---

## 15. Legacy & Dual-Backend Notes

### Supabase (Legacy)
Several hooks in `src/hooks/` still reference Supabase via React Query (`@tanstack/react-query`):
- `src/hooks/use-admin.ts` — admin session management, approval/rejection hooks (Supabase-backed)
- `src/hooks/use-gcc.ts` — legacy Supabase GCC helpers from the pre-Convex implementation
- `src/hooks/use-provider.ts` — provider profile, TSP/Startup wizard drafts, requests (Supabase-backed)

These are **legacy hooks from the pre-Convex architecture**. The active pages (dashboards, directory, etc.) now use **Convex `useQuery`/`useMutation` directly**. The legacy hooks remain for components that haven't been fully migrated (e.g., `ShortlistButton`, `ContactProviderModal`).

**Supabase client:** `src/lib/supabase.ts` + `src/lib/supabase-auth.ts` (Clerk JWT bridge)

### Provider Wizard Components (Legacy)
Multi-step onboarding wizards exist under `src/components/provider/`:
- `wizard/WizardShell.tsx` — shared multi-page form shell
- `wizard/TspPage1-5.tsx` — 5-page wizard for Traditional Service Providers
- `wizard/StartupPage1-5.tsx` — 5-page wizard for Startup providers
- `agent-wizard/AgentPage1-5.tsx` — 5-page agent submission wizard
- `OnboardingBanner.tsx` — welcome banner for new providers

These are **not currently wired into the active `/dashboard` route** — the current provider flow uses the simpler `AgentsTab` + `AgentForm` for agent management. These wizards appear to be from an earlier, more complex onboarding design.

### Auth Guard Components (Legacy)
Additional auth wrappers exist in `src/auth/` beyond `useUserRole`:
- `RequireAuth.tsx` — redirects unauthenticated users
- `RequireRole.tsx` — generic role guard
- `RequireGCCRole.tsx` — composition of RequireAuth + RequireRole("gcc")
- `RequireProviderRole.tsx` — composition of RequireAuth + RequireRole("provider")
- `RequireProviderProfile.tsx` — ensures provider has company profile

These are **not used by the current App Router pages** (which handle role checks inline via `useUserRole` + `useEffect` redirects). They appear to be from the previous routing architecture.

### Configuration Notes
- `next.config.ts` has `typescript: { ignoreBuildErrors: true }` due to legacy files
- `images.remotePatterns` allows `**.convex.cloud` for Convex-hosted images
- Tailwind custom colors: `primary` (HSL 215 blue), `enterprise` (gray scale 50-950)
- Custom fonts: DM Sans (body), Outfit (display), Playfair Display (editorial)

---

*End of Source of Truth*
