# Join Page & Role Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all "Join Now" / "Join as Provider" CTAs with a `/join` intermediate page that lets users choose GCC vs Provider before signing up, and remove the InterestCapture (early access email) section entirely.

**Architecture:** Create a new `/join` route with two role cards (reusing the `RoleSelector` design). Each card links to `/sign-up?role=gcc` or `/sign-up?role=provider`. The sign-up page passes the role through to onboarding via URL param, and onboarding skips the `RoleSelector` step when a role is already specified. The `InterestCapture` section and its Convex mutation are removed from the landing page.

**Tech Stack:** Next.js App Router, Tailwind CSS, Clerk (`fallbackRedirectUrl`), Convex

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/join/page.tsx` | `/join` route — full-page role selection with polished design |
| Modify | `src/components/sections/Hero.tsx:110-119` | Change "Join as Provider" → "Join Now", link to `/join` |
| Modify | `src/components/shared/Navbar.tsx:13,222,349` | Add `/join` to `APP_ROUTES`, desktop+mobile "Join Now" → link to `/join` |
| Modify | `src/components/agent-detail/GatedSection.tsx:34` | Update `/sign-up` link → `/join` |
| Modify | `src/app/sign-up/[[...sign-up]]/page.tsx` | Read `?role` param, preserve `redirect_url` for claim flow, pass to Clerk's `fallbackRedirectUrl` |
| Modify | `src/app/onboarding/page.tsx` | Read `?role` param from URL, skip `RoleSelector` when present |
| Modify | `src/app/page.tsx:8,25` | Remove `InterestCapture` import and usage |
| Delete | `src/components/sections/InterestCapture.tsx` | No longer needed |
| Delete | `src/components/shared/FloatingCTA.tsx` | Legacy file (uses react-router-dom, not imported anywhere) |

**Note:** `convex/earlyAccess.ts` and the `earlyAccessSignups` table in `convex/schema.ts` are left in place — removing a Convex table could drop production data. Mark as follow-up cleanup.

---

### Task 1: Create the `/join` Route

**Files:**
- Create: `src/app/join/page.tsx`

**Design reference:** Reuse the card pattern from `src/components/onboarding/RoleSelector.tsx` but make it a full page with the same `enterprise-50` background, centered card, and Framer Motion entrance animations.

- [ ] **Step 1: Create the join page**

```tsx
// src/app/join/page.tsx
import Link from "next/link";
import { Search, Upload, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Orbys360 | Choose Your Role",
  description:
    "Join Orbys360 as a GCC buyer looking for AI agents or as a provider listing AI agents and services.",
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img
              src="/aifirstgcclogo.svg"
              alt="Orbys360"
              className="h-10 w-auto mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-enterprise-900">
            Join Orbys360
          </h1>
          <p className="text-enterprise-600 mt-2">
            How will you be using the platform?
          </p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/sign-up?role=gcc"
            className="group p-6 bg-white border-2 border-enterprise-200 rounded-xl text-left hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-enterprise-900 mb-1">
                  I&apos;m looking for AI agents
                </h2>
                <p className="text-sm text-enterprise-500">
                  Discover, compare, and shortlist AI agents for your
                  organization.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-enterprise-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-2" />
            </div>
          </Link>

          <Link
            href="/sign-up?role=provider"
            className="group p-6 bg-white border-2 border-enterprise-200 rounded-xl text-left hover:border-purple-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-enterprise-900 mb-1">
                  I&apos;m listing AI agents &amp; services
                </h2>
                <p className="text-sm text-enterprise-500">
                  Manage your company profile and showcase your AI agents to GCC
                  buyers.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-enterprise-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all mt-2" />
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-enterprise-500 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev` and navigate to `http://localhost:3000/join`
Expected: Full-page role selection with two cards, "Sign in" link at bottom, logo at top.

- [ ] **Step 3: Commit**

```bash
git add src/app/join/page.tsx
git commit -m "feat: add /join route with GCC vs Provider role selection"
```

---

### Task 2: Update Hero CTA to "Join Now" → `/join`

**Files:**
- Modify: `src/components/sections/Hero.tsx:110-119`

- [ ] **Step 1: Change the Hero secondary button**

Replace lines 110-119:

```tsx
// BEFORE:
<Link href="/sign-up">
  <Button
    size="lg"
    variant="secondary"
    className="group min-w-[220px] border border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
  >
    Join as Provider
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </Button>
</Link>

// AFTER:
<Link href="/join">
  <Button
    size="lg"
    variant="secondary"
    className="group min-w-[220px] border border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
  >
    Join Now
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </Button>
</Link>
```

- [ ] **Step 2: Verify the Hero renders correctly**

Run: `npm run dev` and navigate to `http://localhost:3000`
Expected: Hero shows "Explore Agent Marketplace" and "Join Now" buttons. "Join Now" links to `/join`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: change Hero CTA from 'Join as Provider' to generic 'Join Now' linking to /join"
```

---

### Task 3: Update Navbar, GatedSection → `/join`

**Files:**
- Modify: `src/components/shared/Navbar.tsx:13,222,349`
- Modify: `src/components/agent-detail/GatedSection.tsx:34`

- [ ] **Step 1: Add `/join` to `APP_ROUTES` so Navbar hides on the join page**

The `/join` page has its own centered layout with logo — showing the Navbar would create a double-nav experience. Add `/join` to the array on line 13:

```tsx
// BEFORE:
const APP_ROUTES = ['/dashboard', '/gcc-dashboard', '/onboarding', '/admin', '/auth']

// AFTER:
const APP_ROUTES = ['/dashboard', '/gcc-dashboard', '/onboarding', '/admin', '/auth', '/join']
```

- [ ] **Step 2: Update the desktop "Join Now" link**

Replace line 222:
```tsx
// BEFORE:
<Link href="/sign-up" className="ml-2">

// AFTER:
<Link href="/join" className="ml-2">
```

- [ ] **Step 3: Update the mobile "Join Now" link**

Replace line 349:
```tsx
// BEFORE:
<Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>

// AFTER:
<Link href="/join" onClick={() => setIsMobileMenuOpen(false)}>
```

- [ ] **Step 4: Update GatedSection sign-up link**

In `src/components/agent-detail/GatedSection.tsx`, line 34:
```tsx
// BEFORE:
<Link href="/sign-up" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark">

// AFTER:
<Link href="/join" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark">
```

- [ ] **Step 5: Verify Navbar and GatedSection render correctly**

Run: `npm run dev`, check:
- Desktop: "Join Now" button links to `/join`
- Mobile (responsive view): "Join Now" button links to `/join`
- `/join` page does NOT show the Navbar (standalone layout)
- Agent detail gated section links to `/join`

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/Navbar.tsx src/components/agent-detail/GatedSection.tsx
git commit -m "feat: update Navbar and GatedSection Join links to /join, hide Navbar on /join"
```

---

### Task 4: Pass Role Through Sign-Up to Onboarding

**Files:**
- Modify: `src/app/sign-up/[[...sign-up]]/page.tsx`
- Modify: `src/app/onboarding/page.tsx`

- [ ] **Step 1: Update sign-up page to read `?role` and forward it (preserving `redirect_url` for claim flow)**

The claim/activate flow (`src/app/claim/activate/page.tsx:144`) links to `/sign-up?redirect_url=/claim/activate?token=XXX`. We must preserve this — when `redirect_url` is present, use it instead of the role-based redirect.

```tsx
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; redirect_url?: string }>;
}) {
  const { role, redirect_url } = await searchParams;

  // Priority: explicit redirect_url (from claim flow) > role-based > default
  const redirectUrl = redirect_url
    ? redirect_url
    : role === "gcc" || role === "provider"
      ? `/onboarding?role=${role}`
      : "/onboarding";

  return (
    <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
      <SignUp fallbackRedirectUrl={redirectUrl} />
    </div>
  );
}
```

Note: In Next.js 15 with App Router, `searchParams` is a Promise that must be awaited. This makes the page a server component (remove any `"use client"` if present — the current file has none, so this is fine).

- [ ] **Step 2: Update onboarding page to read `?role` and skip RoleSelector**

In `src/app/onboarding/page.tsx`, the page is `"use client"`, so read the search param using `useSearchParams()` from `next/navigation`:

```tsx
// Add to imports:
import { useRouter, useSearchParams } from "next/navigation";

// Inside OnboardingPage component, after existing hooks:
const searchParams = useSearchParams();
const roleParam = searchParams.get("role");

// Replace the existing selectedRole useState:
// BEFORE:
const [selectedRole, setSelectedRole] = useState<"gcc" | "provider" | null>(null);

// AFTER:
const initialRole = roleParam === "gcc" || roleParam === "provider" ? roleParam : null;
const [selectedRole, setSelectedRole] = useState<"gcc" | "provider" | null>(initialRole);
```

With this change:
- If `?role=gcc` → `selectedRole` starts as `"gcc"` → `GccOnboardingForm` shows immediately (skips `RoleSelector`)
- If `?role=provider` → `selectedRole` starts as `"provider"` → `handleRoleSelect("provider")` needs to be triggered automatically

For the provider auto-redirect, add a `useEffect`. Guard on `user` being available — Clerk's `useUser()` may return `null` initially, and `handleRoleSelect` calls `user?.reload()`:

```tsx
// Add after the existing useEffect that handles role-based redirect:
useEffect(() => {
  if (!isLoaded || !user || role) return; // wait for Clerk to fully load
  if (initialRole === "provider") {
    handleRoleSelect("provider");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoaded, user, role, initialRole]);
```

And update the render logic so `selectedRole === "provider"` shows the loading state:

```tsx
// The existing settingRole state already handles this — when handleRoleSelect("provider")
// is called, it sets settingRole = true which shows the "Setting up your account..." loader.
// No render changes needed.
```

- [ ] **Step 3: Verify the full flow**

Test both paths:
1. Navigate to `/join` → click GCC card → Clerk sign-up → after sign-up lands on `/onboarding?role=gcc` → GccOnboardingForm shown (no RoleSelector)
2. Navigate to `/join` → click Provider card → Clerk sign-up → after sign-up lands on `/onboarding?role=provider` → auto-redirects to `/dashboard`
3. Navigate to `/onboarding` directly (no role param) → RoleSelector shown (fallback works)

- [ ] **Step 4: Commit**

```bash
git add src/app/sign-up/[[...sign-up]]/page.tsx src/app/onboarding/page.tsx
git commit -m "feat: pass role through sign-up to onboarding, skip RoleSelector when role is known"
```

---

### Task 5: Remove InterestCapture Section from Landing Page

**Files:**
- Modify: `src/app/page.tsx:8,25` — remove import and usage
- Delete: `src/components/sections/InterestCapture.tsx`
- Delete: `src/components/shared/FloatingCTA.tsx` (legacy, uses react-router-dom, not imported)

- [ ] **Step 1: Remove InterestCapture from landing page**

In `src/app/page.tsx`, remove line 8 (`import { InterestCapture }...`) and line 25 (`<InterestCapture />`).

The page should go from:
```tsx
<EarlyMemberBenefits />
<InterestCapture />
<SocialProof />
```
to:
```tsx
<EarlyMemberBenefits />
<SocialProof />
```

- [ ] **Step 2: Delete the InterestCapture component file**

```bash
rm src/components/sections/InterestCapture.tsx
```

- [ ] **Step 3: Delete the legacy FloatingCTA component**

This file uses `react-router-dom` (not Next.js), is not imported anywhere in the app, and references `#signup` which no longer exists.

```bash
rm src/components/shared/FloatingCTA.tsx
```

- [ ] **Step 4: Verify landing page renders without errors**

Run: `npm run dev` and navigate to `http://localhost:3000`
Expected: Landing page loads without the email capture section. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git add src/components/sections/InterestCapture.tsx
git add src/components/shared/FloatingCTA.tsx
git commit -m "feat: remove InterestCapture section and legacy FloatingCTA from landing page"
```

---

### Task 6: Verify Build & Lint

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: No new lint errors.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds. No type errors or missing imports.

- [ ] **Step 3: Fix any issues found and commit**

If lint/build fails, fix the issues and create a new commit.

---

## Summary of User-Facing Changes

| Before | After |
|--------|-------|
| Hero: "Join as Provider" → `/sign-up` | Hero: "Join Now" → `/join` |
| Navbar: "Join Now" → `/sign-up` | Navbar: "Join Now" → `/join` |
| GatedSection: "Create account" → `/sign-up` | GatedSection: "Create account" → `/join` |
| InterestCapture email form on landing page | Removed |
| Sign-up → onboarding shows RoleSelector always | Sign-up → onboarding skips RoleSelector if role is in URL |
| Claim/activate flow uses `redirect_url` param | Preserved — sign-up page respects `redirect_url` over role param |

## Flow After Implementation

```
User clicks "Join Now" (Hero or Navbar)
  ↓
/join — picks GCC or Provider
  ↓
/sign-up?role=gcc (or provider) — Clerk sign-up form
  ↓
/onboarding?role=gcc (or provider)
  ↓
GCC: shows GccOnboardingForm → /gcc-dashboard
Provider: auto-sets role → /dashboard
```
