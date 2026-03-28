# Orbys360 Platform Scaffolding — Implementation Tickets

> **Created:** 2026-02-11
> **Branch:** `develop`
> **Total tickets:** 14
> **Prerequisite:** Clerk account with publishable key ready

---

## Ticket Overview

| # | Ticket | Status | Blocked By |
|---|--------|--------|------------|
| 1 | Install Dependencies | `not_started` | — |
| 2 | Vite & Environment Configuration | `not_started` | #1 |
| 3 | Type Definitions | `not_started` | — |
| 4 | Route & Category Constants | `not_started` | — |
| 5 | Auth Infrastructure (Guards & Hooks) | `not_started` | #1, #2 |
| 6 | Layout System (3 Layouts) | `not_started` | #5 |
| 7 | Auth Page (Clerk Sign-In / Sign-Up) | `not_started` | #1, #2 |
| 8 | Placeholder Pages (18 Pages) | `not_started` | #3, #4 |
| 9 | Route Tree Rewrite (App.tsx) | `not_started` | #5, #6, #7, #8 |
| 10 | Bootstrap Providers (main.tsx) | `not_started` | #1, #9 |
| 11 | Navbar Auth-Aware Update | `not_started` | #5, #10 |
| 12 | Hero Dual CTA Update | `not_started` | #9 |
| 13 | FloatingCTA Context-Aware Update | `not_started` | #5, #10 |
| 14 | Supabase Foundation Migration | `not_started` | #3 |

---

## Ticket 1: Install Dependencies

### Status: `not_started`

### Description

Install the two new npm packages required for the platform: `@clerk/clerk-react` (authentication) and `@tanstack/react-query` (server-state management). These are foundational — every subsequent ticket depends on at least one of them.

### What Changes

- `package.json` — two new entries in `dependencies`
- `package-lock.json` — auto-generated lockfile update
- `node_modules/` — new packages installed

### Acceptance Criteria

- [ ] `@clerk/clerk-react` is listed in `package.json` dependencies
- [ ] `@tanstack/react-query` is listed in `package.json` dependencies
- [ ] `npm install` completes without errors
- [ ] `npm run build` still passes (no type conflicts or version mismatches)
- [ ] No changes to any source files in `src/`

### Machine Verification

```bash
# Check packages are installed
node -e "require('@clerk/clerk-react'); console.log('clerk: OK')"
node -e "require('@tanstack/react-query'); console.log('react-query: OK')"

# Build still passes
npm run build
```

### Human Verification

1. Open `package.json` and confirm the two new dependencies exist
2. Run `npm run dev` — the landing page loads identically to before
3. No visual changes anywhere

### Prerequisites from User

**None** — this is a pure dependency installation.

### State Awareness

- **Before:** `package.json` has 15 dependencies. No auth or query library present.
- **After:** `package.json` has 17 dependencies. Both packages are available for import but NOT yet used anywhere in code.
- **Risk:** Version conflicts. Mitigated by pinning to stable versions.

### Dependencies

None — this is the first ticket.

---

## Ticket 2: Vite & Environment Configuration

### Status: `not_started`

### Description

Configure the build tooling and environment variables for the new dependencies. This ensures Clerk and TanStack Query are code-split into their own chunks (so they don't inflate the landing page bundle) and that TypeScript knows about the new env vars.

### What Changes

**`vite.config.ts`** — add two entries to `manualChunks`:
```typescript
'vendor-clerk': ['@clerk/clerk-react'],
'vendor-query': ['@tanstack/react-query'],
```

**`.env.example`** — add:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**`src/vite-env.d.ts`** — extend `ImportMetaEnv`:
```typescript
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
}
```

### Acceptance Criteria

- [ ] `vite.config.ts` has 6 manual chunks (4 existing + 2 new)
- [ ] `.env.example` documents `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `src/vite-env.d.ts` declares `VITE_CLERK_PUBLISHABLE_KEY` in `ImportMetaEnv`
- [ ] `npm run build` produces separate `vendor-clerk` and `vendor-query` chunks in `dist/assets/`
- [ ] Existing chunks (`vendor-react`, `vendor-motion`, `vendor-forms`, `vendor-ui`) are unchanged in size
- [ ] The landing page chunk does NOT contain Clerk or TanStack Query code

### Machine Verification

```bash
# Build and check chunks
npm run build

# Verify chunk files exist
ls dist/assets/ | grep vendor-clerk
ls dist/assets/ | grep vendor-query

# Verify landing page bundle hasn't grown (compare sizes)
# Check that vendor-react chunk size is same as before
```

### Human Verification

1. Run `npm run build` and inspect the terminal output — you should see 6 vendor chunks listed
2. Open `.env.example` and confirm the new key is documented
3. Run `npm run dev` — landing page loads identically

### Prerequisites from User

- [ ] **Create a `.env` file** (not `.env.example`) in the project root with your actual Clerk publishable key:
  ```
  VITE_SUPABASE_URL=<your existing value>
  VITE_SUPABASE_ANON_KEY=<your existing value>
  VITE_CLERK_PUBLISHABLE_KEY=<your Clerk publishable key>
  ```
  (Find this in Clerk Dashboard → API Keys → Publishable key)

### State Awareness

- **Before:** 4 vendor chunks. No Clerk env var. `vite-env.d.ts` only declares Supabase vars.
- **After:** 6 vendor chunks. Clerk env var documented. TypeScript autocomplete works for `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`.
- **Caution:** If the `.env` file is missing the Clerk key, the app will still run but protected routes won't work. This is by design (graceful degradation).

### Dependencies

- **Blocked by:** Ticket #1 (packages must be installed for chunks to reference them)

---

## Ticket 3: Type Definitions

### Status: `not_started`

### Description

Create TypeScript interfaces that mirror the database schema from the PRD. These types are used across the app for type-safe data handling — in components, hooks, API calls, and form validation.

### What Changes

Create 3 new files in `src/types/`:

**`src/types/provider.ts`**
```typescript
export interface ProviderProfile {
  id: string
  user_id: string
  organization_id: string
  company_name: string
  location: string
  company_size: string
  logo_url: string | null
  website: string | null
  category: 'enabler' | 'startup'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface EnablerSubmission { /* fields from PRD Section 3.2 */ }
export interface StartupSubmission { /* fields from PRD Section 3.2 */ }
```

**`src/types/agent.ts`**
```typescript
export interface Agent {
  id: string
  agent_name: string
  tagline: string | null
  description: string
  category: string
  provider_profile_id: string
  logo_url: string | null
  tags: string[]
  use_cases: AgentUseCase[]
  industries: string[]
  integration_type: string | null
  supported_platforms: string[]
  data_requirements: string | null
  impact_metrics: ImpactMetric[]
  demo_url: string | null
  compliance_certifications: string[]
  security_features: string[]
  rating: number
  review_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface AgentUseCase {
  title: string
  description: string
}

export interface ImpactMetric {
  type: string
  value: string
  description: string
}

export interface AgentSubmission extends Omit<Agent, 'id' | 'rating' | 'review_count' | 'status'> {
  id: string
  user_id: string
  submission_status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  admin_notes: string | null
}
```

**`src/types/problem.ts`**
```typescript
export interface ProblemStatement {
  id: string
  gcc_org_id: string
  title: string
  description: string
  category: string
  industry: string
  desired_outcome: string
  timeline: 'immediate' | 'short' | 'medium' | 'long'
  budget_range: string
  status: 'pending_review' | 'approved' | 'rejected'
  interest_count: number
  rejection_reason: string | null
  created_at: string
}
```

### Acceptance Criteria

- [ ] `src/types/provider.ts` exports `ProviderProfile`, `EnablerSubmission`, `StartupSubmission`
- [ ] `src/types/agent.ts` exports `Agent`, `AgentUseCase`, `ImpactMetric`, `AgentSubmission`
- [ ] `src/types/problem.ts` exports `ProblemStatement`
- [ ] All interfaces match the data model in PRD Section 6
- [ ] `npm run build` passes — types compile without errors
- [ ] All fields use strict union types where applicable (`'pending' | 'approved' | 'rejected'`, not `string`)
- [ ] Nullable fields use `| null` (not optional `?`) to match Supabase conventions

### Machine Verification

```bash
# TypeScript compiles
npx tsc --noEmit

# Types are importable
# (verified by build — if any type is malformed, tsc -b will fail)
npm run build
```

### Human Verification

1. Open each file in `src/types/` and cross-reference fields against PRD Section 6 (Data Model Summary)
2. Confirm union types are used for status fields (not plain strings)
3. Confirm `use_cases` and `impact_metrics` use typed arrays (not `any[]`)

### Prerequisites from User

**None** — types are derived from the PRD, which is already available.

### State Awareness

- **Before:** No `src/types/` directory. Data types only exist for AI Pulse briefs (`src/data/aiPulseTypes.ts`).
- **After:** `src/types/` directory with 3 files. Every database entity from the PRD has a TypeScript interface. These types are NOT yet consumed by any component (that happens in later tickets).

### Dependencies

None — can be done in parallel with Tickets #1, #2, #4.

---

## Ticket 4: Route & Category Constants

### Status: `not_started`

### Description

Create centralized constants for route paths and agent categories. These prevent typos, enable IDE autocomplete, and make refactoring route paths a single-file change instead of a find-and-replace across the codebase.

### What Changes

Create 2 new files in `src/data/constants/`:

**`src/data/constants/routes.ts`** — all route paths as a typed `const` object:
```typescript
export const ROUTES = {
  HOME: '/',
  ORBYT: '/orbyt',
  MARKETPLACE: '/marketplace',
  AGENT_DETAIL: (id: string) => `/marketplace/agent/${id}`,
  PROBLEMS: '/problems',
  THOUGHT_LEADERSHIP: '/thought-leadership',
  TOOLS: '/tools',
  BENCHMARKS: '/benchmarks',
  PROVIDERS: '/providers',
  AI_PULSE: '/ai-pulse',
  AI_PULSE_DETAIL: (slug: string) => `/ai-pulse/${slug}`,
  AUTH: '/auth',
  AUTH_SIGNUP: (role: 'gcc' | 'provider') => `/auth?mode=signup&role=${role}`,
  ONBOARDING_CATEGORY: '/onboarding/category',
  ONBOARDING_BASICS: '/onboarding/basics',
  ONBOARDING_FORM: '/onboarding/form',
  PROVIDER_DASHBOARD: '/provider',
  LIST_AGENT: '/list-your-agent',
  EDIT_AGENT: (agentId: string) => `/provider/agents/${agentId}/edit`,
  GCC_DASHBOARD: '/gcc-dashboard',
  SELF_ASSESSMENT: '/self-assessment',
  ADMIN: (token: string) => `/admin/${token}`,
} as const
```

**`src/data/constants/agentCategories.ts`** — 25 categories from PRD Section 3.6:
```typescript
export const AGENT_CATEGORIES = [
  'Customer Service',
  'Operations',
  // ... all 25 from PRD
  'Other',
] as const

export type AgentCategory = typeof AGENT_CATEGORIES[number]
```

### Acceptance Criteria

- [ ] `src/data/constants/routes.ts` exports a `ROUTES` object covering all 20+ routes from the PRD
- [ ] Dynamic routes (agent detail, AI pulse detail, admin) use functions that return interpolated strings
- [ ] `src/data/constants/agentCategories.ts` exports exactly 25 categories matching PRD Section 3.6
- [ ] `AgentCategory` type is derived from the array (not manually maintained)
- [ ] `npm run build` passes
- [ ] No existing code is modified

### Machine Verification

```bash
# TypeScript compiles
npx tsc --noEmit

# Count categories
node -e "const c = require('./src/data/constants/agentCategories.ts'); console.log(c.AGENT_CATEGORIES.length)"
# Should output: 25
```

Note: The `node -e` check won't work directly with TypeScript. Verification is best done via the build (`npm run build`).

### Human Verification

1. Open `routes.ts` and confirm every route from the PRD's Section 7 (Route Map) is represented
2. Open `agentCategories.ts` and cross-reference with PRD Section 3.6 (25 categories)
3. Confirm `ROUTES.AUTH_SIGNUP('provider')` produces `/auth?mode=signup&role=provider`

### Prerequisites from User

**None.**

### State Awareness

- **Before:** No `src/data/constants/` directory. Route paths are hardcoded strings scattered across components.
- **After:** Single source of truth for all routes and categories. Not yet consumed by components (that happens in Tickets #8, #9, #11, #12).

### Dependencies

None — can be done in parallel with Tickets #1, #2, #3.

---

## Ticket 5: Auth Infrastructure (Guards & Hooks)

### Status: `not_started`

### Description

Create the authentication guard components and hooks that protect routes based on sign-in status and user role. This is the security backbone — every protected route in the app depends on these guards.

### What Changes

Create 6 new files in `src/auth/`:

**`src/auth/useUserRole.ts`**
- Hook that calls `useUser()` from Clerk
- Reads `user.publicMetadata.role` → returns `'gcc' | 'provider' | null`
- Returns `isLoaded` boolean for loading states

**`src/auth/RequireAuth.tsx`**
- Wrapper component
- Uses `useAuth()` from Clerk to check `isSignedIn`
- If not loaded → renders a spinner (reuse `PageLoader` pattern from App.tsx)
- If not signed in → `<Navigate to="/auth" state={{ from: location.pathname }} />`
- If signed in → renders `children`

**`src/auth/RequireRole.tsx`**
- Takes a `role` prop (`'gcc' | 'provider'`)
- Uses `useUserRole()` hook
- If role doesn't match → `<Navigate to="/" />`
- If role matches → renders `children`

**`src/auth/RequireProviderRole.tsx`**
- Composes `RequireAuth` + `RequireRole role="provider"`
- Convenience wrapper for route groups

**`src/auth/RequireGCCRole.tsx`**
- Composes `RequireAuth` + `RequireRole role="gcc"`
- Convenience wrapper for route groups

**`src/auth/RequireProviderProfile.tsx`**
- Queries `provider_profiles` table via Supabase for the current user
- If no profile → redirects to `/onboarding/category`
- If profile exists but not approved + `requireApproved` prop is true → redirects to `/provider` (shows pending banner)
- If profile is approved → renders `children`
- Uses a simple `useEffect` + `useState` fetch (TanStack Query hook deferred to a later ticket)

### Acceptance Criteria

- [ ] All 6 files exist in `src/auth/`
- [ ] `useUserRole()` returns `{ role, isLoaded }` tuple
- [ ] `RequireAuth` renders a loading spinner while Clerk loads
- [ ] `RequireAuth` redirects to `/auth` when not signed in, preserving the return URL in `location.state`
- [ ] `RequireRole` redirects to `/` when user has wrong role
- [ ] `RequireProviderRole` composes both auth + role check
- [ ] `RequireGCCRole` composes both auth + role check
- [ ] `RequireProviderProfile` queries Supabase and handles 3 states (no profile, pending, approved)
- [ ] All components show a loading spinner during async checks (no flash of unauthorized content)
- [ ] `npm run build` passes
- [ ] No existing files modified

### Machine Verification

```bash
# TypeScript compiles cleanly
npm run build

# All files exist
ls src/auth/useUserRole.ts src/auth/RequireAuth.tsx src/auth/RequireRole.tsx \
   src/auth/RequireProviderRole.tsx src/auth/RequireGCCRole.tsx \
   src/auth/RequireProviderProfile.tsx
```

### Human Verification

1. Read each guard component and trace the redirect logic:
   - Unauthenticated → `/auth` (RequireAuth)
   - Wrong role → `/` (RequireRole)
   - No provider profile → `/onboarding/category` (RequireProviderProfile)
   - Pending profile + requireApproved → `/provider` (RequireProviderProfile)
2. Confirm there is NO flash of content before redirect (loading spinner shows first)
3. Confirm `RequireAuth` passes `state={{ from: location.pathname }}` to the Navigate (needed for post-login redirect)
4. Confirm `RequireProviderProfile` handles Supabase being `null` gracefully (the existing pattern in `lib/supabase.ts`)

### Prerequisites from User

- [ ] **Clerk publishable key** must be in `.env` (from Ticket #2 prerequisites)
- [ ] **Clerk user roles**: Ensure your Clerk dashboard allows setting `publicMetadata.role` on users. You'll need to manually set roles on test users via Clerk Dashboard → Users → [user] → Public metadata → `{ "role": "provider" }` or `{ "role": "gcc" }` until the webhook is set up.

### State Awareness

- **Before:** No auth in the app. All routes are public. No concept of user roles.
- **After:** Auth infrastructure exists but is NOT yet wired into routes (that's Ticket #9). The guards are importable but unused until App.tsx references them.
- **Critical:** These guards depend on `@clerk/clerk-react` being installed (Ticket #1) and env vars configured (Ticket #2).

### Dependencies

- **Blocked by:** Ticket #1 (Clerk package), Ticket #2 (env vars)
- **Blocks:** Ticket #6 (layouts use guards), Ticket #9 (route tree uses guards)

---

## Ticket 6: Layout System (3 Layouts)

### Status: `not_started`

### Description

Create three layout components that define the structural shell for different sections of the app. These use React Router's `<Outlet />` pattern for nested routing.

### What Changes

Create 3 new files in `src/layouts/`:

**`src/layouts/MarketingLayout.tsx`**
- Renders: `<Navbar />` → `<main><Outlet /></main>` → `<Footer />`
- Footer is lazy-loaded (existing pattern)
- Used by all public pages EXCEPT the landing page (which renders its own Navbar + sections inline)
- Minimal wrapper — just provides consistent chrome

**`src/layouts/AppLayout.tsx`**
- Renders: sticky header (logo + `<UserButton />`) → flex container with sidebar + `<Outlet />`
- **Header**: 64px tall, white bg, bottom border, logo left, UserButton right
- **Sidebar**: 256px wide, hidden on mobile (`hidden md:flex`), white bg, left border
  - Sidebar nav items are role-based (reads `useUserRole()` hook):
    - Provider: Dashboard, List Agent, Profile
    - GCC: Dashboard, Shortlist, Problem Hub, Self-Assessment
  - Each nav item: icon + label, active state (purple bg), hover state
- **Main content**: `flex-1`, `p-6`, `bg-enterprise-50`
- Uses existing `enterprise-*` color tokens from Tailwind config
- Mobile: sidebar collapses, content is full-width

**`src/layouts/OnboardingLayout.tsx`**
- Renders: header (logo + "Provider Onboarding") → centered content (`max-w-2xl mx-auto py-12`)
- No sidebar, no footer — clean single-column flow
- Used only for `/onboarding/*` routes

### Acceptance Criteria

- [ ] `MarketingLayout` renders Navbar, Outlet, and Footer
- [ ] `AppLayout` renders a dashboard shell with header, sidebar, and content area
- [ ] `AppLayout` sidebar shows different navigation items based on user role
- [ ] `AppLayout` sidebar is hidden on mobile (responsive)
- [ ] `OnboardingLayout` renders a minimal header and centered content area
- [ ] All layouts use `<Outlet />` from React Router for child route rendering
- [ ] All layouts use existing design tokens (enterprise colors, font families)
- [ ] `AppLayout` imports and renders `<UserButton />` from `@clerk/clerk-react`
- [ ] `npm run build` passes
- [ ] No existing files modified

### Machine Verification

```bash
# TypeScript compiles
npm run build

# Files exist
ls src/layouts/MarketingLayout.tsx src/layouts/AppLayout.tsx src/layouts/OnboardingLayout.tsx
```

### Human Verification

1. **Cannot fully verify visually yet** — layouts need to be wired into routes (Ticket #9) to render
2. Read the code and confirm:
   - MarketingLayout imports Navbar from `@/components/shared/Navbar`
   - AppLayout imports UserButton from `@clerk/clerk-react`
   - AppLayout uses `useUserRole()` to conditionally render sidebar items
   - OnboardingLayout is intentionally minimal (no sidebar)
3. Confirm all layouts use `<Outlet />` (not `children` prop)
4. Confirm responsive breakpoints follow existing patterns (`hidden md:flex`, `px-4 sm:px-6 lg:px-8`)

### Prerequisites from User

**None** — uses only existing design tokens and installed packages.

### State Awareness

- **Before:** No `src/layouts/` directory. The Navbar is rendered globally in `App.tsx` above all routes.
- **After:** Three layout shells exist. They are NOT yet wired into routes (Ticket #9 handles that). The current `<Navbar />` in App.tsx is still the global one.
- **Important:** When Ticket #9 rewrites App.tsx, the global `<Navbar />` will be removed and replaced by layout-specific rendering. Until then, layouts are importable but dormant.

### Dependencies

- **Blocked by:** Ticket #5 (AppLayout uses `useUserRole()` hook)
- **Blocks:** Ticket #9 (route tree references layouts)

---

## Ticket 7: Auth Page (Clerk Sign-In / Sign-Up)

### Status: `not_started`

### Description

Create the authentication page that renders Clerk's pre-built sign-in and sign-up components. This is the gateway between the public landing page and the authenticated app.

### What Changes

Create `src/pages/auth/AuthPage.tsx`:

- Reads URL search params: `?mode=signup|signin` and `?role=gcc|provider`
- If `mode=signup`: renders `<SignUp />` from Clerk
  - Sets `unsafeMetadata.role` to the `role` param (for development; production uses Clerk webhooks)
  - `afterSignUpUrl`: provider → `/onboarding/category`, gcc → `/gcc-dashboard`
- If `mode=signin` (default): renders `<SignIn />`
  - `afterSignInUrl`: reads role from session → route to appropriate dashboard, fallback `/`
- Centered on page with `min-h-screen`, `bg-enterprise-50`
- Orbys360 logo above the Clerk component
- "Back to home" link below

### Acceptance Criteria

- [ ] File exists at `src/pages/auth/AuthPage.tsx`
- [ ] Default export (for `React.lazy()` compatibility)
- [ ] `/auth` shows Clerk sign-in form
- [ ] `/auth?mode=signup` shows Clerk sign-up form
- [ ] `/auth?mode=signup&role=provider` pre-sets role for signup redirect
- [ ] After provider signup → redirected to `/onboarding/category`
- [ ] After GCC signup → redirected to `/gcc-dashboard`
- [ ] After sign-in → redirected based on existing role
- [ ] Page is centered, uses enterprise design tokens
- [ ] Logo links back to `/`
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build

# File exists
ls src/pages/auth/AuthPage.tsx
```

### Human Verification

1. **After Ticket #9 wires routes:** Navigate to `/auth` — Clerk sign-in form appears
2. Navigate to `/auth?mode=signup&role=provider` — Clerk sign-up form appears
3. Complete a test signup → confirm redirect goes to correct dashboard
4. Sign out → confirm you're returned to the landing page
5. Confirm the page looks clean (centered, branded, not raw Clerk default)

### Prerequisites from User

- [ ] **Clerk publishable key in `.env`** (from Ticket #2)
- [ ] **Clerk project configured** to allow email/password signup (or social providers you want)
- [ ] **(Optional but recommended):** Set up a Clerk sign-up redirect URL in Clerk Dashboard → Paths → to allow `/auth` as a valid redirect

### State Awareness

- **Before:** No auth page. No way for users to sign in or sign up.
- **After:** Auth page exists. Cannot be navigated to yet (not in route tree until Ticket #9). But can be previewed by directly lazy-loading it in a test.
- **Clerk state:** Uses `unsafeMetadata` for role assignment (client-settable). This is fine for development but **must be replaced with `publicMetadata` via Clerk webhook** before production. This is documented as a known gap.

### Dependencies

- **Blocked by:** Ticket #1 (Clerk package), Ticket #2 (env vars)
- **Blocks:** Ticket #9 (route tree references AuthPage)

---

## Ticket 8: Placeholder Pages (18 Pages)

### Status: `not_started`

### Description

Create minimal but real page components for every route in the app. Each placeholder is a navigable, rendered component — not an empty file. This proves the route tree works end-to-end and gives a skeleton to build features into later.

### What Changes

Create 18 new files across `src/pages/`:

| File | Route | Icon | Title |
|------|-------|------|-------|
| `pages/marketing/OrbytLanding.tsx` | `/orbyt` | Bot | Orbyt Agent Marketplace |
| `pages/marketing/ProvidersPage.tsx` | `/providers` | Building2 | Provider Ecosystem |
| `pages/marketplace/MarketplaceListing.tsx` | `/marketplace` | Search | Agent Marketplace |
| `pages/marketplace/AgentDetail.tsx` | `/marketplace/agent/:id` | Bot | Agent Detail |
| `pages/provider/ProviderDashboard.tsx` | `/provider` | LayoutDashboard | Provider Dashboard |
| `pages/provider/ListAgent.tsx` | `/list-your-agent` | PlusCircle | List Your Agent |
| `pages/provider/EditAgent.tsx` | `/provider/agents/:id/edit` | Pencil | Edit Agent |
| `pages/provider/onboarding/CategorySelect.tsx` | `/onboarding/category` | ListChecks | Select Provider Category |
| `pages/provider/onboarding/BasicInfo.tsx` | `/onboarding/basics` | FileText | Basic Information |
| `pages/provider/onboarding/DetailedForm.tsx` | `/onboarding/form` | ClipboardList | Detailed Submission |
| `pages/gcc/GCCDashboard.tsx` | `/gcc-dashboard` | LayoutDashboard | GCC Dashboard |
| `pages/gcc/SelfAssessment.tsx` | `/self-assessment` | ClipboardCheck | AI Readiness Assessment |
| `pages/content/ThoughtLeadership.tsx` | `/thought-leadership` | BookOpen | Thought Leadership |
| `pages/content/ToolsHub.tsx` | `/tools` | Wrench | AI-First Tools |
| `pages/content/Benchmarks.tsx` | `/benchmarks` | BarChart3 | GCC Benchmarks |
| `pages/content/ProblemsListing.tsx` | `/problems` | MessageSquare | Problem Statements |
| `pages/admin/AdminDashboard.tsx` | `/admin/:token` | Shield | Admin Dashboard |

(Note: `AuthPage.tsx` is created in Ticket #7, not here.)

**Each placeholder follows this template:**
```tsx
import { Container } from '@/components/shared/Container'
import { IconName } from 'lucide-react'

export default function PageName() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <IconName className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Page Title</h1>
          <p className="text-lg text-enterprise-600">
            Brief description of what this page will contain.
          </p>
        </div>
      </Container>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] All 18 files exist in the correct directories
- [ ] Every file has a `export default function` (not named export) — required for `React.lazy()` without `.then()` gymnastics
- [ ] Every file imports and uses `Container` from `@/components/shared/Container`
- [ ] Every file uses a relevant Lucide icon
- [ ] Every file has a descriptive `<h1>` and `<p>` (not just "Coming soon")
- [ ] Dashboard pages (`ProviderDashboard`, `GCCDashboard`) include a tab-like structure hint (e.g., list the tab names from the PRD in the description)
- [ ] `AgentDetail.tsx` reads `:agentId` from `useParams()` and displays it
- [ ] `AdminDashboard.tsx` reads `:secretToken` from `useParams()`
- [ ] `npm run build` passes
- [ ] No existing files modified

### Machine Verification

```bash
# TypeScript compiles
npm run build

# Count files (should be 18, excluding AuthPage which is Ticket #7)
find src/pages -name "*.tsx" -not -path "*/auth/*" | wc -l
# Expected: 17 (18 minus AuthPage)

# All use default exports
grep -r "export default function" src/pages/ | wc -l
# Expected: 18 (including AuthPage from Ticket #7)
```

### Human Verification

1. **After Ticket #9 wires routes:** Navigate to each route and confirm:
   - The page renders without errors
   - The correct icon and title appear
   - The description is relevant to the PRD feature
2. Check that `AgentDetail` shows the agent ID from the URL
3. Check that dashboard placeholders mention their tabs (Requests, Submissions, Profile for Provider; Shortlisted Agents, Current Requests, Problem Hub for GCC)

### Prerequisites from User

**None.**

### State Awareness

- **Before:** No `src/pages/` directory (only `src/components/pages/` with AI Pulse pages, which are untouched).
- **After:** 18 new page files. Not yet reachable via routing (Ticket #9). Existing `src/components/pages/AIPulseListing.tsx` and `AIPulseDetail.tsx` are unchanged and stay where they are.

### Dependencies

- **Blocked by:** Ticket #3 (some pages may import types), Ticket #4 (pages may reference route constants)
- **Blocks:** Ticket #9 (route tree lazy-imports these pages)

---

## Ticket 9: Route Tree Rewrite (App.tsx)

### Status: `not_started`

### Description

Rewrite `src/App.tsx` to define the full route tree with layout nesting, auth guards, and lazy-loaded pages. This is the **most critical ticket** — it's the architectural spine that connects everything from Tickets #5–#8.

### What Changes

**`src/App.tsx`** — significant rewrite:

1. **Remove global `<Navbar />`** — Navbar moves into MarketingLayout and the LandingPage component
2. **Keep `LandingPage` function** — unchanged, but now renders `<Navbar />` above itself
3. **Keep `SectionLoader` and `PageLoader`** — reused
4. **Add lazy imports** for all 19 pages (18 placeholders + AuthPage)
5. **Define route groups:**

```
<Routes>
  {/* Landing — standalone, preserves current behavior */}
  <Route path="/" element={<><Navbar /><LandingPage /></>} />

  {/* Auth — minimal chrome */}
  <Route path="/auth" element={<Suspense><AuthPage /></Suspense>} />

  {/* Public — MarketingLayout */}
  <Route element={<MarketingLayout />}>
    <Route path="/ai-pulse" ... />
    <Route path="/ai-pulse/:slug" ... />
    <Route path="/orbyt" ... />
    <Route path="/marketplace" ... />
    <Route path="/marketplace/agent/:agentId" ... />
    {/* ... more public routes */}
  </Route>

  {/* Provider Onboarding — OnboardingLayout + RequireProviderRole */}
  <Route element={<RequireProviderRole><OnboardingLayout /></RequireProviderRole>}>
    <Route path="/onboarding/category" ... />
    <Route path="/onboarding/basics" ... />
    <Route path="/onboarding/form" ... />
  </Route>

  {/* Provider Dashboard — AppLayout + RequireProviderRole */}
  <Route element={<RequireProviderRole><AppLayout /></RequireProviderRole>}>
    <Route path="/provider" ... />
    <Route path="/list-your-agent" ... />
    <Route path="/provider/agents/:agentId/edit" ... />
  </Route>

  {/* GCC Dashboard — AppLayout + RequireGCCRole */}
  <Route element={<RequireGCCRole><AppLayout /></RequireGCCRole>}>
    <Route path="/gcc-dashboard" ... />
    <Route path="/self-assessment" ... />
  </Route>

  {/* Admin — standalone */}
  <Route path="/admin/:secretToken" element={<Suspense><AdminDashboard /></Suspense>} />
</Routes>
```

### Acceptance Criteria

- [ ] **Landing page (`/`)** renders identically to current production — same Navbar, Hero, all 10 sections, FloatingCTA
- [ ] **AI Pulse pages** work exactly as before (now nested inside MarketingLayout)
- [ ] All public routes render their placeholder pages inside MarketingLayout (Navbar + Footer)
- [ ] All provider routes are wrapped in `RequireProviderRole` — redirects to `/auth` if not signed in
- [ ] All GCC routes are wrapped in `RequireGCCRole` — redirects to `/auth` if not signed in
- [ ] `/list-your-agent` has an additional `RequireProviderProfile requireApproved` guard
- [ ] Admin route is standalone (no Clerk auth)
- [ ] Every page is lazy-loaded with `React.lazy()`
- [ ] Every lazy page is wrapped in `<Suspense>` with the PageLoader spinner
- [ ] `npm run build` passes
- [ ] No changes to any component files other than `App.tsx`

### Machine Verification

```bash
# Build passes
npm run build

# Count routes (grep for <Route path= in App.tsx)
grep -c "path=" src/App.tsx
# Expected: 20+

# Verify lazy imports
grep -c "React.lazy\|lazy(" src/App.tsx
# Expected: 19+ (pages) + existing section lazy imports
```

### Human Verification

1. `npm run dev` and navigate to:
   - `/` — landing page loads identically (critical: no regression)
   - `/ai-pulse` — listing page loads inside MarketingLayout (has Navbar + Footer)
   - `/marketplace` — placeholder loads inside MarketingLayout
   - `/auth` — Clerk sign-in renders
   - `/provider` — redirects to `/auth` (not signed in)
   - `/gcc-dashboard` — redirects to `/auth` (not signed in)
   - `/admin/test-token` — admin placeholder renders (no redirect)
2. Sign in as a provider (via Clerk) → navigate to `/provider` → placeholder renders inside AppLayout (sidebar + header)
3. Sign in as a GCC user → navigate to `/gcc-dashboard` → placeholder renders inside AppLayout
4. Confirm no console errors on any route
5. Confirm browser back/forward navigation works across all route groups

### Prerequisites from User

- [ ] **Clerk test users** with roles set. Create at least:
  - 1 user with `publicMetadata: { "role": "provider" }`
  - 1 user with `publicMetadata: { "role": "gcc" }`
  - (Set via Clerk Dashboard → Users → Edit metadata)

### State Awareness

- **Before:** App.tsx has 3 routes (`/`, `/ai-pulse`, `/ai-pulse/:slug`). Navbar is rendered globally above all routes.
- **After:** App.tsx has 20+ routes across 6 layout groups. Navbar is NOT global — it's rendered inside MarketingLayout (for public pages) and inside the standalone landing page. Dashboard pages have their own header (AppLayout).
- **Critical state change:** The `<Navbar />` is removed from the top level of `App()` and moved into the landing page's Route element. This means non-MarketingLayout, non-landing routes (like `/auth`, `/admin`) do NOT show the Navbar. This is intentional.
- **Rollback:** If something breaks, reverting `App.tsx` to its previous state restores the original 3-route app. No other files are changed in this ticket.

### Dependencies

- **Blocked by:** Ticket #5 (guards), #6 (layouts), #7 (AuthPage), #8 (placeholder pages)
- **Blocks:** Ticket #10 (main.tsx depends on App.tsx being ready), #11, #12, #13

---

## Ticket 10: Bootstrap Providers (main.tsx)

### Status: `not_started`

### Description

Update the app's entry point to wrap the application with `ClerkProvider` and `QueryClientProvider`. This activates authentication and server-state management for the entire app.

### What Changes

**`src/main.tsx`** — modify to add two providers:

```typescript
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

// Nesting order:
// StrictMode → BrowserRouter → ClerkProvider → QueryClientProvider → App
```

### Acceptance Criteria

- [ ] `ClerkProvider` wraps inside `BrowserRouter` (Clerk needs router context for redirects)
- [ ] `QueryClientProvider` wraps inside `ClerkProvider` (queries may need auth context)
- [ ] `queryClient` is instantiated at module level (not inside a component)
- [ ] `staleTime` is set to 5 minutes (reduces unnecessary refetches)
- [ ] `retry` is set to 1 (fail fast, show error instead of silent retries)
- [ ] If `VITE_CLERK_PUBLISHABLE_KEY` is undefined, the app still renders (public routes work)
- [ ] `npm run build` passes
- [ ] `npm run dev` — landing page loads normally

### Machine Verification

```bash
npm run build
npm run dev
# Landing page at localhost:5173 loads without errors
```

### Human Verification

1. Open browser dev tools → Console. No Clerk errors if key is set.
2. Open React DevTools → Component tree shows `ClerkProvider` and `QueryClientProvider` wrapping `App`
3. Landing page visually unchanged
4. Navigate to `/auth` — Clerk sign-in form renders (proves ClerkProvider is working)

### Prerequisites from User

- [ ] `.env` file has `VITE_CLERK_PUBLISHABLE_KEY` set

### State Awareness

- **Before:** main.tsx wraps App in `StrictMode` + `BrowserRouter` only. No auth context. No query context.
- **After:** main.tsx wraps App in `StrictMode` + `BrowserRouter` + `ClerkProvider` + `QueryClientProvider`. Auth is now available in any component via `useAuth()`, `useUser()`. Server state management via `useQuery()`, `useMutation()`.
- **This is the activation point.** Once this ticket is done, all auth guards from Ticket #5 start working. The route tree from Ticket #9 starts enforcing role-based access.

### Dependencies

- **Blocked by:** Ticket #1 (packages), Ticket #9 (App.tsx should be ready)
- **Blocks:** Ticket #11 (Navbar needs auth context), Ticket #13 (FloatingCTA needs auth context)

---

## Ticket 11: Navbar Auth-Aware Update

### Status: `not_started`

### Description

Update the existing Navbar to be aware of authentication state and the current route context. Currently the Navbar always shows "Join Waitlist" and scroll-to-section links. It needs to adapt to three contexts: landing page, public pages, and signed-in state.

### What Changes

**`src/components/shared/Navbar.tsx`** — modify existing file:

1. **Import Clerk hooks:** `useAuth`, `useUser` from `@clerk/clerk-react`, and `UserButton`
2. **Import `useUserRole`** from `@/auth/useUserRole`
3. **Context detection:** Use `useLocation()` (already imported) to determine:
   - `isLandingPage` = `pathname === '/'`
   - `isAppPage` = pathname starts with `/provider` or `/gcc-dashboard` or `/onboarding` or `/admin`
4. **Desktop nav behavior:**
   - If on landing page: section scroll links (current behavior) + "AI Pulse" link + "Marketplace" link
   - If on other marketing pages: links navigate to `/#section-id` instead of scrolling
   - "Marketplace" nav item added (always visible, links to `/marketplace`)
5. **Auth-aware CTA:**
   - If not loaded: show nothing (prevent flash)
   - If signed in: show `<UserButton />` + "Dashboard" link (routes to `/provider` or `/gcc-dashboard` based on role)
   - If not signed in: show "Join Now" button → links to `/auth?mode=signup`
6. **Mobile menu:** Same auth-aware logic
7. **Hide on app pages:** If `isAppPage`, return `null` (AppLayout has its own header)

### Acceptance Criteria

- [ ] On landing page (`/`): Navbar looks and behaves identically to current production EXCEPT "Join Waitlist" → "Join Now"
- [ ] On `/marketplace`: Navbar shows, "Why Orbys360" links to `/#value` (navigates to landing + scrolls)
- [ ] On `/provider` or `/gcc-dashboard`: Navbar is NOT rendered (AppLayout header takes over)
- [ ] When signed out: "Join Now" button visible, links to `/auth?mode=signup`
- [ ] When signed in: Clerk `<UserButton />` visible (avatar/initials), "Join Now" hidden
- [ ] When signed in: "Dashboard" link visible, routes based on role
- [ ] "Marketplace" link always visible in desktop nav
- [ ] Mobile menu has same auth-aware behavior
- [ ] No flash of "Join Now" → `<UserButton />` on page load (loading state handled)
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. **Signed out:**
   - Visit `/` — Navbar shows "Join Now", "Marketplace" link, section scroll links work
   - Visit `/marketplace` — Navbar shows, section links navigate to landing page
   - Visit `/provider` — redirected to `/auth`, Navbar not visible
2. **Signed in (provider):**
   - Visit `/` — Navbar shows `<UserButton />`, "Dashboard" link
   - Click "Dashboard" → goes to `/provider`
   - Visit `/provider` — Navbar is hidden, AppLayout header shown instead
3. **Signed in (GCC):**
   - Click "Dashboard" → goes to `/gcc-dashboard`
4. Mobile: toggle menu, confirm same behavior

### Prerequisites from User

- [ ] Test users created in Clerk with roles (from Ticket #9 prerequisites)

### State Awareness

- **Before:** Navbar always shows the same UI. "Join Waitlist" scrolls to `#signup`. No auth awareness.
- **After:** Navbar adapts to 3 states (signed out, signed in, on app page). "Join Waitlist" becomes "Join Now" → `/auth`. Marketplace link added.
- **This is a visual-facing change.** If the user is running `main` (production), this won't affect it because we're on `develop`. But once merged to `main`, the Navbar changes are live.

### Dependencies

- **Blocked by:** Ticket #5 (useUserRole hook), Ticket #10 (ClerkProvider must be in tree)
- **Blocks:** Nothing directly

---

## Ticket 12: Hero Dual CTA Update

### Status: `not_started`

### Description

Update the Hero section to replace the single "Join the Early Access List" CTA with two CTAs that direct users toward the platform's two audiences: GCCs exploring the marketplace, and providers joining the ecosystem.

### What Changes

**`src/components/sections/Hero.tsx`** — modify:

Replace the single CTA button:
```tsx
// BEFORE (single button scrolling to #signup):
<Button onClick={() => scrollToSection('signup')}>
  Join the Early Access List
  <ArrowRight />
</Button>

// AFTER (two buttons linking to routes):
<Link to="/marketplace">
  <Button size="lg" className="primary-gradient...">
    Explore Agent Marketplace
    <ArrowRight />
  </Button>
</Link>
<Link to="/auth?mode=signup&role=provider">
  <Button size="lg" variant="secondary" className="border-white/30 text-white...">
    Join as Provider
    <ArrowRight />
  </Button>
</Link>
```

- Import `Link` from `react-router-dom` (not currently imported in Hero)
- Primary CTA: "Explore Agent Marketplace" → `/marketplace`
- Secondary CTA: "Join as Provider" → `/auth?mode=signup&role=provider`
- Keep the existing animation, sizing, and gradient styling
- Secondary button: white border on transparent bg (to match the dark hero background)

### Acceptance Criteria

- [ ] Hero shows two CTA buttons side-by-side (stacked on mobile)
- [ ] "Explore Agent Marketplace" navigates to `/marketplace`
- [ ] "Join as Provider" navigates to `/auth?mode=signup&role=provider`
- [ ] Neither CTA scrolls to `#signup` anymore (that section still exists, just not linked from Hero)
- [ ] Both buttons have the existing Framer Motion entrance animation
- [ ] Mobile: buttons stack vertically (existing `flex-col sm:flex-row` behavior)
- [ ] Primary button has gradient bg (blue → purple)
- [ ] Secondary button has a transparent bg with white border
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build

# Verify Link import exists in Hero
grep "from 'react-router-dom'" src/components/sections/Hero.tsx
```

### Human Verification

1. Visit `/` → Hero loads, two CTAs visible
2. Click "Explore Agent Marketplace" → navigates to `/marketplace`
3. Click "Join as Provider" → navigates to `/auth?mode=signup&role=provider`
4. Resize to mobile → buttons stack vertically
5. Visual check: buttons look balanced, text is readable against the gradient background
6. Compare with current Hero screenshot — only the CTA area has changed

### Prerequisites from User

**None.**

### State Awareness

- **Before:** Hero has one CTA ("Join the Early Access List") that scrolls to `#signup`.
- **After:** Hero has two CTAs linking to routes. The `#signup` section (InterestCapture) still exists on the landing page and is still accessible via scrolling — it's just not directly linked from the Hero anymore. The Navbar's "Join Now" button could optionally still scroll to it or link to `/auth`.

### Dependencies

- **Blocked by:** Ticket #9 (routes must exist for the links to work)
- **Blocks:** Nothing

---

## Ticket 13: FloatingCTA Context-Aware Update

### Status: `not_started`

### Description

Update the FloatingCTA component to be context-aware: it should only show on marketing pages and hide when the user is on authenticated dashboard pages (which have their own navigation).

### What Changes

**`src/components/shared/FloatingCTA.tsx`** — modify:

1. Import `useAuth` from `@clerk/clerk-react`
2. Import `useLocation` from `react-router-dom` (may already be imported)
3. Determine context:
   - `isAppRoute` = pathname starts with `/provider`, `/gcc-dashboard`, `/onboarding`, `/admin`, `/auth`
4. If `isAppRoute`: return `null` (don't render)
5. Update "Join Waitlist" text to "Join Now"
6. On landing page: scroll to `#signup` (current behavior)
7. On other marketing pages: link to `/auth?mode=signup`

### Acceptance Criteria

- [ ] FloatingCTA shows on `/` (landing page) — scrolls to `#signup`
- [ ] FloatingCTA shows on `/marketplace`, `/ai-pulse`, etc. — links to `/auth?mode=signup`
- [ ] FloatingCTA is hidden on `/provider`, `/gcc-dashboard`, `/onboarding/*`, `/admin/*`, `/auth`
- [ ] "Join Waitlist" text changed to "Join Now"
- [ ] If signed in: FloatingCTA is hidden entirely (user doesn't need to join)
- [ ] Existing scroll animations and "Scroll to Top" button still work
- [ ] `npm run build` passes

### Machine Verification

```bash
npm run build
```

### Human Verification

1. Visit `/` → scroll down → FloatingCTA appears, says "Join Now"
2. Visit `/marketplace` → scroll → FloatingCTA appears, clicking it goes to `/auth`
3. Visit `/provider` (signed in) → no FloatingCTA
4. Sign in → visit `/` → no FloatingCTA
5. Scroll behavior (show after 600px, "Scroll to Top" after 2000px) still works

### Prerequisites from User

**None.**

### State Awareness

- **Before:** FloatingCTA always shows after 600px scroll, says "Join Waitlist", always scrolls to `#signup`.
- **After:** FloatingCTA is context-aware — hidden on app routes and when signed in. Text says "Join Now". Behavior varies by page.

### Dependencies

- **Blocked by:** Ticket #5 (`useAuth` needs ClerkProvider), Ticket #10 (ClerkProvider in tree)
- **Blocks:** Nothing

---

## Ticket 14: Supabase Foundation Migration

### Status: `not_started`

### Description

Create the first database migration that adds the core platform tables to Supabase. These tables are the minimum needed for the auth guards to function (provider profile check) and for future marketplace features.

### What Changes

Create `supabase/migrations/20260211000000_create_platform_foundation.sql`:

**Table 1: `provider_profiles`**
- `id` UUID PK
- `user_id` TEXT NOT NULL UNIQUE (Clerk user ID)
- `organization_id` TEXT NOT NULL UNIQUE (Clerk org ID)
- `company_name`, `location`, `company_size` TEXT NOT NULL
- `logo_url`, `website` TEXT nullable
- `category` TEXT CHECK ('enabler' | 'startup')
- `status` TEXT DEFAULT 'pending' CHECK ('pending' | 'approved' | 'rejected')
- `created_at`, `updated_at` TIMESTAMPTZ
- RLS: owner can read/insert/update own; public can read approved

**Table 2: `agents`**
- `id` UUID PK
- `agent_name`, `description`, `category` TEXT NOT NULL
- `provider_profile_id` UUID FK → provider_profiles
- `tagline`, `logo_url`, `demo_url`, `integration_type`, `data_requirements` TEXT nullable
- `tags`, `industries`, `supported_platforms`, `compliance_certifications`, `security_features` TEXT[]
- `use_cases`, `impact_metrics` JSONB
- `rating` NUMERIC(2,1) DEFAULT 0, `review_count` INTEGER DEFAULT 0
- `status` TEXT DEFAULT 'active' CHECK ('active' | 'inactive')
- `created_at`, `updated_at` TIMESTAMPTZ
- RLS: public can read active agents

**Table 3: `agent_submissions`**
- Mirrors `agents` table structure + `user_id`, `submission_status`, `admin_notes`
- `submission_status` CHECK ('pending' | 'approved' | 'rejected' | 'changes_requested')
- RLS: owner can read/insert own

**Table 4: `admin_sessions`**
- `id` UUID PK, `session_token` TEXT UNIQUE, `expires_at` TIMESTAMPTZ

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
- [ ] Migration SQL is syntactically valid

### Machine Verification

```bash
# Syntax check (if supabase CLI is available)
supabase db lint

# Or validate SQL syntax locally
# The migration will be tested when applied to a Supabase instance
```

### Human Verification

1. Read the migration file and cross-reference every table/column against PRD Section 6
2. Confirm JSONB columns (`use_cases`, `impact_metrics`) use `DEFAULT '[]'` not `DEFAULT NULL`
3. Confirm TEXT[] columns have `DEFAULT '{}'`
4. Confirm RLS policies allow:
   - Anon users: SELECT active agents, SELECT approved provider profiles
   - Authenticated providers: INSERT/SELECT/UPDATE own profile, INSERT/SELECT own submissions
5. **Apply the migration** to your Supabase project and verify in the Supabase Dashboard → Table Editor

### Prerequisites from User

- [ ] **Supabase project** must be accessible
- [ ] **Supabase CLI** installed locally (for `supabase db push`) OR ability to run SQL in Supabase Dashboard → SQL Editor
- [ ] **Decision needed:** RLS policies reference `auth.uid()`. Since we use Clerk (not Supabase Auth), these policies won't work out-of-the-box. For now, the migration creates the policies but they can be adjusted later when the Clerk-Supabase JWT bridge is set up. The user should understand this gap.

### State Awareness

- **Before:** One table in Supabase: `early_access_signups`. One migration file.
- **After:** Five tables total. The new tables are empty but structured. RLS is enabled. The `RequireProviderProfile` guard from Ticket #5 can now query `provider_profiles`.
- **Clerk + Supabase auth gap:** RLS policies use `auth.uid()::text` which relies on Supabase's auth layer. Since Clerk handles auth, these policies need a JWT bridge to work. For scaffolding, the anon key provides public reads. Writes will need the service role key or a JWT integration (future ticket).

### Dependencies

- **Blocked by:** Ticket #3 (types should match the schema)
- **Blocks:** Nothing directly (guards fall back gracefully when tables don't exist)

---

## Implementation Order (Recommended)

**Phase A — No dependencies (parallelize):**
- Ticket #1: Install Dependencies
- Ticket #3: Type Definitions
- Ticket #4: Route & Category Constants

**Phase B — Depends on Phase A:**
- Ticket #2: Vite & Environment Configuration (needs #1)
- Ticket #8: Placeholder Pages (needs #3, #4)
- Ticket #14: Supabase Foundation Migration (needs #3)

**Phase C — Depends on Phase B:**
- Ticket #5: Auth Infrastructure (needs #1, #2)
- Ticket #7: Auth Page (needs #1, #2)

**Phase D — Depends on Phase C:**
- Ticket #6: Layout System (needs #5)

**Phase E — Integration (the big merge):**
- Ticket #9: Route Tree Rewrite (needs #5, #6, #7, #8)
- Ticket #10: Bootstrap Providers (needs #1, #9)

**Phase F — Polish:**
- Ticket #11: Navbar Auth-Aware Update (needs #5, #10)
- Ticket #12: Hero Dual CTA Update (needs #9)
- Ticket #13: FloatingCTA Context-Aware Update (needs #5, #10)

```
Phase A:  [#1] [#3] [#4]          (parallel)
Phase B:  [#2] [#8] [#14]         (parallel, after A)
Phase C:  [#5] [#7]               (parallel, after B)
Phase D:  [#6]                    (after C)
Phase E:  [#9] → [#10]           (sequential, after D)
Phase F:  [#11] [#12] [#13]      (parallel, after E)
```
