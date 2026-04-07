# Dashboard Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Revision note:** This version replaces the earlier March 28 draft and resolves four planning defects: unsupported sidebar avatar rendering, unscoped admin shell changes, infeasible shortlist branding, and verification steps that assumed a green build baseline.

**Goal:** Polish the Provider and GCC dashboards from wireframe-quality to polished SaaS while keeping Admin visually unchanged.

**Architecture:** Keep `DashboardShell`, `DashboardSidebar`, and `DashboardMobileNav` as shared components, but make the dark polished variant opt-in via `sidebarTheme="dark"`. Provider and GCC pages opt into the dark shell and branded sidebar. Admin remains on the existing light shell. Tab-level polish stays focused on `ProfileTab`, `AgentsTab`, `TeamTab`, `ShortlistedAgentsTab`, and `CurrentRequestsTab`.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Clerk (`useUser`, `useAuth`), Convex

**Spec:** `docs/superpowers/specs/2026-03-28-dashboard-visual-polish-design.md`

**Plan-specific interface decisions:**
- Standardize shared shell branding on `brand?: SidebarBrand`
- Add `sidebarTheme?: "light" | "dark"` to keep dark visuals opt-in
- Do not use `next/image` in the sidebar brand block
- Use a dedicated shortlist query that returns joined shortlist, agent, and company data

---

## Known Baseline Constraint

- Current baseline `npm run build` already fails while prerendering `/dashboard`
- Root cause: `useSearchParams()` in `src/app/dashboard/page.tsx` is not wrapped in a Suspense boundary
- Treat that failure as pre-existing and out of scope for this polish plan
- Task-level verification must check for no new lint or file-local type issues in touched files
- Full build may still fail for the known `/dashboard` baseline reason unless that issue is fixed separately

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/dashboard/DashboardSidebar.tsx` | Modify | Add `brand` and opt-in `theme`, keep admin light, use resilient `<img>` fallback |
| `src/components/dashboard/DashboardShell.tsx` | Modify | Add `sidebarTheme`, only apply dark shell visuals when requested |
| `src/components/dashboard/DashboardMobileNav.tsx` | Modify | Add `brandName` in mobile sticky bar |
| `src/app/dashboard/page.tsx` | Modify | Pass provider brand data and `sidebarTheme="dark"` |
| `src/app/gcc-dashboard/page.tsx` | Modify | Pass GCC brand data and `sidebarTheme="dark"` without relying on remote avatar URLs |
| `src/components/dashboard/ProfileTab.tsx` | Modify | Elevated company card, inline edit polish, skeleton loader |
| `src/components/dashboard/AgentsTab.tsx` | Modify | Elevated cards, gradient CTA, staggered entrance animations, skeleton loader |
| `src/components/dashboard/TeamTab.tsx` | Modify | Avatar circles, styled pills, animated invite panel, skeleton loader |
| `convex/shortlists.ts` | Modify | Add joined shortlist query returning `{ shortlistId, agent, company }[]` |
| `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx` | Modify | Consume joined shortlist query and render company logo/name |
| `src/components/gcc-dashboard/CurrentRequestsTab.tsx` | Modify | Status left border, icon badge polish, skeleton loader |

**Existing reusable components and data:**
- `src/components/directory/CompanyLogo.tsx` already implements resilient logo rendering with `<img>` plus fallback
- `src/lib/types.ts` exposes `Company.logo_url` and `Company.logo_bg`
- `src/auth/useUserRole.ts` already depends on Clerk and Convex role data
- `src/app/admin/page.tsx` uses `DashboardShell`, so shared shell changes must stay opt-in

---

## Task 1: DashboardSidebar - Opt-in Dark Theme and Resilient Brand Rendering

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`

- [ ] **Step 1: Replace the file with an opt-in themed sidebar**

Replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface SidebarBrand {
  name: string;
  logoUrl?: string;
  logoBg?: string;
  fallbackInitial: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  brand?: SidebarBrand;
  theme?: "light" | "dark";
}

export function DashboardSidebar({
  navItems,
  activeKey,
  onNavigate,
  brand,
  theme = "light",
}: DashboardSidebarProps) {
  const [imgError, setImgError] = useState(false);
  const isDark = theme === "dark";

  const wrapperClasses = isDark
    ? "flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-950"
    : "flex h-full flex-col bg-white";

  const headerClasses = isDark
    ? "px-5 py-5 border-b border-white/10"
    : "px-5 py-5 border-b border-enterprise-200";

  const brandTextClasses = isDark
    ? "text-sm font-semibold text-white truncate"
    : "text-sm font-semibold text-enterprise-900 truncate";

  return (
    <div className={wrapperClasses}>
      {brand && (
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            {brand.logoUrl && !imgError ? (
              <div
                className={`w-9 h-9 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border ${
                  isDark
                    ? brand.logoBg === "dark"
                      ? "bg-slate-800 border-white/10"
                      : "bg-white border-white/10"
                    : brand.logoBg === "dark"
                      ? "bg-enterprise-900 border-enterprise-800"
                      : "bg-white border-enterprise-100"
                }`}
              >
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain p-0.5"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  isDark
                    ? "bg-gradient-to-br from-primary to-accent-purple text-white"
                    : "bg-enterprise-900 text-white"
                }`}
              >
                {brand.fallbackInitial}
              </div>
            )}
            <span className={brandTextClasses}>{brand.name}</span>
          </div>
        </div>
      )}

      <nav className={`flex flex-col gap-1 ${isDark ? "p-3 mt-1" : "p-4"}`}>
        {navItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;

          const buttonClasses = isDark
            ? isActive
              ? "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 bg-white/10 text-white font-semibold border-l-[3px] border-primary pl-[9px]"
              : "flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent pl-[9px]"
            : isActive
              ? "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 bg-primary/10 text-primary font-semibold"
              : "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-enterprise-600 hover:bg-enterprise-100 hover:text-enterprise-900";

          const badgeClasses = isDark
            ? "text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center"
            : "text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold";

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={buttonClasses}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className={badgeClasses}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
```

**Implementation notes:**
- Do not import `next/image`
- Keep initials fallback even when a logo URL is provided but fails to load
- `theme="light"` must preserve current Admin visuals closely enough that Admin does not join the dark polish pass

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/DashboardSidebar.tsx
```

Expected: no new lint errors in the touched file. Do not treat the repo's existing `/dashboard` build blocker as a regression from this task.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat: add opt-in themed dashboard sidebar with resilient brand rendering"
```

---

## Task 2: DashboardShell - Add `sidebarTheme` and Keep Admin Light

**Files:**
- Modify: `src/components/dashboard/DashboardShell.tsx`

- [ ] **Step 1: Replace the file with a theme-aware shared shell**

Replace the entire file with:

```tsx
"use client";

import { Navbar } from "@/components/shared/Navbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { NavItem, SidebarBrand } from "./DashboardSidebar";

interface DashboardShellProps {
  title: string;
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  hideNavbar?: boolean;
  headerActions?: React.ReactNode;
  brand?: SidebarBrand;
  sidebarTheme?: "light" | "dark";
}

export function DashboardShell({
  title,
  navItems,
  activeKey,
  onNavigate,
  children,
  hideNavbar,
  headerActions,
  brand,
  sidebarTheme = "light",
}: DashboardShellProps) {
  const topOffset = hideNavbar ? "pt-0" : "pt-16 md:pt-20";
  const sidebarTop = hideNavbar ? "md:top-0" : "md:top-20";
  const mobileStickyTop = hideNavbar ? "top-0" : "top-16";
  const isDarkSidebar = sidebarTheme === "dark";

  const shellBg = isDarkSidebar ? "bg-enterprise-50" : "";
  const asideChrome = isDarkSidebar
    ? "shadow-xl"
    : "border-r border-enterprise-200 overflow-y-auto";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={`min-h-screen ${shellBg} ${topOffset}`}>
        <aside
          className={`hidden md:fixed ${sidebarTop} md:bottom-0 md:left-0 md:flex md:w-64 md:flex-col z-30 ${asideChrome}`}
        >
          <DashboardSidebar
            navItems={navItems}
            activeKey={activeKey}
            onNavigate={onNavigate}
            brand={brand}
            theme={sidebarTheme}
          />
        </aside>

        <main className="md:ml-64">
          <DashboardMobileNav
            navItems={navItems}
            activeKey={activeKey}
            onNavigate={onNavigate}
            stickyTop={mobileStickyTop}
            brandName={brand?.name}
          />
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-enterprise-900">{title}</h1>
              {headerActions}
            </div>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
```

**Implementation notes:**
- `sidebarTheme` defaults to `"light"` so Admin stays out of scope
- `bg-enterprise-50` and `shadow-xl` are dark-shell-only visuals
- Leave layout spacing and max width unchanged

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/DashboardShell.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardShell.tsx
git commit -m "feat: add opt-in sidebar theme to shared dashboard shell"
```

---

## Task 3: DashboardMobileNav - Add Brand Name to the Mobile Sticky Bar

**Files:**
- Modify: `src/components/dashboard/DashboardMobileNav.tsx`

- [ ] **Step 1: Add `brandName?: string` and render it inline with the active label**

Update the props interface:

```tsx
interface DashboardMobileNavProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  stickyTop?: string;
  brandName?: string;
}
```

Update the function signature:

```tsx
export function DashboardMobileNav({
  navItems,
  activeKey,
  onNavigate,
  stickyTop = "top-16",
  brandName,
}: DashboardMobileNavProps) {
```

Replace the active label block with:

```tsx
<span className="flex items-center gap-2 min-w-0">
  {activeItem && <activeItem.icon className="w-4 h-4 shrink-0" />}
  <span className="truncate">
    {brandName ? `${brandName} - ${activeItem?.label}` : activeItem?.label}
  </span>
</span>
```

**Implementation notes:**
- Keep the mobile nav light-themed for all dashboards
- This task does not introduce dark mobile chrome

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/DashboardMobileNav.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardMobileNav.tsx
git commit -m "feat: show dashboard brand name in mobile nav"
```

---

## Task 4: Provider Dashboard Page - Pass Brand Data and Opt Into the Dark Shell

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Construct `brand` from `myCompany` and pass `sidebarTheme="dark"`**

Before the return, add:

```tsx
const brand = {
  name: myCompany.name,
  logoUrl: myCompany.logo_url,
  logoBg: myCompany.logo_bg,
  fallbackInitial: myCompany.name.charAt(0).toUpperCase(),
};
```

Update `DashboardShell` usage:

```tsx
<DashboardShell
  title="Provider Dashboard"
  navItems={NAV_ITEMS}
  activeKey={activeTab}
  onNavigate={handleNavigate}
  brand={brand}
  sidebarTheme="dark"
>
```

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/app/dashboard/page.tsx
```

Expected: no new lint errors in the touched file. Ignore the repo's existing `/dashboard` full-build blocker here.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: pass provider brand data to dark dashboard shell"
```

---

## Task 5: GCC Dashboard Page - Pass GCC Brand Data and Opt Into the Dark Shell

**Files:**
- Modify: `src/app/gcc-dashboard/page.tsx`

- [ ] **Step 1: Import `useUser`, build `brand`, and pass `sidebarTheme="dark"`**

Update imports:

```tsx
import { useAuth, useUser } from "@clerk/nextjs";
```

Inside the component, add:

```tsx
const { user } = useUser();
```

Before the return, add:

```tsx
const displayName =
  user?.firstName ||
  user?.fullName ||
  user?.primaryEmailAddress?.emailAddress ||
  "User";

const brand = {
  name: displayName,
  fallbackInitial: displayName.charAt(0).toUpperCase(),
};
```

Update `DashboardShell` usage:

```tsx
<DashboardShell
  title="GCC Dashboard"
  navItems={NAV_ITEMS}
  activeKey={activeTab}
  onNavigate={handleNavigate}
  brand={brand}
  sidebarTheme="dark"
>
```

**Implementation notes:**
- Do not pass `user.imageUrl` into the sidebar plan
- Remote Clerk avatar support is intentionally out of scope for this polish pass

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/app/gcc-dashboard/page.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/app/gcc-dashboard/page.tsx
git commit -m "feat: pass GCC brand data to dark dashboard shell"
```

---

## Task 6: ProfileTab - Elevated Company Card and Skeleton Loader

**Files:**
- Modify: `src/components/dashboard/ProfileTab.tsx`

- [ ] **Step 1: Carry forward the visual polish implementation with no data-model changes**

Implement the same polish intent as the earlier draft, with these concrete requirements:
- Replace the loading spinner with a skeleton card
- Use `CompanyLogo` for the company mark instead of inline image logic
- Wrap the profile in `bg-white rounded-2xl shadow-card p-6`
- Header row must show:
  - company logo on the left
  - company name
  - headquarters with `MapPin`
  - website with `Globe` when present
  - ghost-style edit button with `Pencil`
- Edit mode must stay inline and keep the existing `companyEdits.create` mutation
- Include an amber review callout in edit mode
- Keep the green success banner auto-dismiss behavior

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/ProfileTab.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ProfileTab.tsx
git commit -m "feat: polish provider profile tab card and loading state"
```

---

## Task 7: AgentsTab - Elevated Cards, Animations, Gradient CTA, Skeleton Loader

**Files:**
- Modify: `src/components/dashboard/AgentsTab.tsx`

- [ ] **Step 1: Keep detail, submit, and resubmit views intact; only polish the loading and list states**

Requirements:
- Add `motion` from `framer-motion`
- Replace the top loading spinner with an `AgentsTabSkeleton`
- Leave `detail`, `submit`, and `resubmit` sub-views functionally unchanged
- In list view:
  - header shows `Your Agents`, count badge, and gradient submit CTA
  - pending submissions render as elevated cards with amber left border
  - active agent cards use `bg-white rounded-2xl shadow-card p-6`
  - active agent cards animate in with staggered `motion.button`
  - empty state uses a gradient icon circle and CTA
- Keep pending edit indicator, category dot, and current `CATEGORY_COLORS` mapping

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/AgentsTab.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/AgentsTab.tsx
git commit -m "feat: polish agents tab list states and animations"
```

---

## Task 8: TeamTab - Avatar Circles, Styled Pills, Animated Invite Panel

**Files:**
- Modify: `src/components/dashboard/TeamTab.tsx`

- [ ] **Step 1: Rewrite TeamTab with visual polish only**

Requirements:
- Replace the top loading spinner with a skeleton stack
- Add `motion` and `AnimatePresence` for the invite panel and list entrance
- Header shows `Team Members`, count badge, and `Invite Member` button for owners
- Non-owner users see a styled `Shield` callout instead of plain text
- Invite panel slides open and includes `Mail` icon prefix
- Member rows render as elevated cards with:
  - gradient initial avatar
  - owner indicator
  - role pill
  - status pill with `Clock` for pending invites
- Remove action remains owner-only and keeps current API routes
- Empty state uses the shared gradient-circle pattern

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/dashboard/TeamTab.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/TeamTab.tsx
git commit -m "feat: polish team tab cards, invite panel, and loading state"
```

---

## Task 9: ShortlistedAgentsTab - Joined Data Query, Company Branding, Styled Empty State

**Files:**
- Modify: `convex/shortlists.ts`
- Modify: `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx`

- [ ] **Step 1: Add a joined shortlist query in Convex**

Add a new query in `convex/shortlists.ts` named `getMineWithDetails` with this shape:

```ts
export const getMineWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const shortlist = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
      .collect();

    const rows = await Promise.all(
      shortlist.map(async (entry) => {
        const agent = await ctx.db.get(entry.agent_id);
        if (!agent) return null;

        const company = agent.company_id
          ? await ctx.db.get(agent.company_id)
          : null;

        return {
          shortlistId: entry._id,
          agent,
          company,
          createdAt: entry.created_at,
        };
      })
    );

    return rows
      .filter(Boolean)
      .sort((left, right) => (right?.createdAt ?? 0) - (left?.createdAt ?? 0));
  },
});
```

**Why this change is required:**
- `api.agents.getByIds` only returns agent docs
- shortlist card branding requires `company.name`, `company.logo_url`, and `company.logo_bg`
- this plan must provide a real data path instead of leaving that join implicit

- [ ] **Step 2: Update `ShortlistedAgentsTab` to use the joined query**

Requirements:
- Replace the two-query flow (`shortlists.getMine` plus `agents.getByIds`) with `api.shortlists.getMineWithDetails`
- Replace the loading spinner with a skeleton tied to the joined query loading state
- Header shows `Shortlisted Agents` and a count badge based on joined rows
- Each card renders:
  - `CompanyLogo company={row.company}`
  - company name in muted text
  - agent name
  - tagline
  - category dot using `CATEGORY_COLORS`
  - `View Details` link
  - remove button that still calls `api.shortlists.remove`
- Empty state keeps the gradient-circle pattern and CTA to `/directory`

- [ ] **Step 3: Verify touched files**

Run:

```bash
npx eslint convex/shortlists.ts src/components/gcc-dashboard/ShortlistedAgentsTab.tsx
```

Expected: no new lint errors in the touched files.

- [ ] **Step 4: Commit**

```bash
git add convex/shortlists.ts src/components/gcc-dashboard/ShortlistedAgentsTab.tsx
git commit -m "feat: add joined shortlist query and polish shortlisted agents tab"
```

---

## Task 10: CurrentRequestsTab - Status Borders, Icon Badges, Skeleton Loader

**Files:**
- Modify: `src/components/gcc-dashboard/CurrentRequestsTab.tsx`

- [ ] **Step 1: Polish the existing cards without changing the underlying request query**

Requirements:
- Replace the top loading spinner with `RequestsSkeleton`
- Expand `StatusBadge` to include icon plus bordered pill styling
- Map request status to a left border color on each card
- Keep current detail rows, timestamps, and admin notes content intact
- Keep empty state in the shared polished pattern
- Do not add new data dependencies; this tab already has the fields it needs

Suggested status mapping:
- `pending_admin` -> amber left border + `Clock`
- `approved` -> blue left border + `CheckCircle`
- `contacted` -> green left border + `CheckCircle`
- `rejected` -> red left border + `XCircle`

- [ ] **Step 2: Verify touched file**

Run:

```bash
npx eslint src/components/gcc-dashboard/CurrentRequestsTab.tsx
```

Expected: no new lint errors in the touched file.

- [ ] **Step 3: Commit**

```bash
git add src/components/gcc-dashboard/CurrentRequestsTab.tsx
git commit -m "feat: polish current requests tab cards and loading state"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run targeted lint for all touched files**

Run:

```bash
npx eslint \
  src/components/dashboard/DashboardSidebar.tsx \
  src/components/dashboard/DashboardShell.tsx \
  src/components/dashboard/DashboardMobileNav.tsx \
  src/app/dashboard/page.tsx \
  src/app/gcc-dashboard/page.tsx \
  src/components/dashboard/ProfileTab.tsx \
  src/components/dashboard/AgentsTab.tsx \
  src/components/dashboard/TeamTab.tsx \
  convex/shortlists.ts \
  src/components/gcc-dashboard/ShortlistedAgentsTab.tsx \
  src/components/gcc-dashboard/CurrentRequestsTab.tsx
```

Expected: no new lint errors in the touched files.

- [ ] **Step 2: Run targeted tests if the implementation adds or updates tests**

Expected:
- If tests are added for touched components, run them
- If no tests are added, explicitly note that verification is lint-only plus manual UI review

- [ ] **Step 3: Optional full build**

Run:

```bash
npm run build
```

Expected:
- The build may still fail on the known baseline blocker:
  - `/dashboard` prerender failure from `useSearchParams()` without Suspense in `src/app/dashboard/page.tsx`
- Treat any new error outside that known blocker as a regression from the polish work

- [ ] **Step 4: Commit any final follow-up fixes**

```bash
git status
```

If follow-up edits were required during verification, stage and commit them with an appropriate message.

---

## Acceptance Checklist

- [ ] Provider and GCC dashboards opt into a dark branded sidebar
- [ ] Admin dashboard keeps the existing light shell
- [ ] Sidebar branding does not rely on `next/image`
- [ ] Sidebar branding preserves initials fallback when a logo fails to load
- [ ] Shortlisted agents cards have a real company data source
- [ ] Verification steps do not assume a green full-build baseline
- [ ] Final verification explicitly names the existing `/dashboard` Suspense blocker
