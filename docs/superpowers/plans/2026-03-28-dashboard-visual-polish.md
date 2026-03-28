# Dashboard Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the Provider and GCC dashboards from wireframe-quality to polished SaaS — dark sidebar, elevated cards, animations, branded workspace header, better empty/loading states.

**Architecture:** Modify the shared DashboardShell/Sidebar/MobileNav components for the dark sidebar + branding, then polish each tab component (ProfileTab, AgentsTab, TeamTab, ShortlistedAgentsTab, CurrentRequestsTab) with elevated cards, framer-motion entrance animations, and styled empty states.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Clerk (`useUser`), Convex

**Spec:** `docs/superpowers/specs/2026-03-28-dashboard-visual-polish-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/dashboard/DashboardSidebar.tsx` | Modify | Dark theme, branding header (logo + name), left-border active state |
| `src/components/dashboard/DashboardShell.tsx` | Modify | Pass branding props, bg-enterprise-50 content area, sidebar shadow |
| `src/components/dashboard/DashboardMobileNav.tsx` | Modify | Show brand name in mobile sticky bar |
| `src/app/dashboard/page.tsx` | Modify | Pass company branding data to DashboardShell |
| `src/app/gcc-dashboard/page.tsx` | Modify | Pass Clerk user branding data to DashboardShell |
| `src/components/dashboard/ProfileTab.tsx` | Modify | Company header card with logo, polished edit mode |
| `src/components/dashboard/AgentsTab.tsx` | Modify | Elevated cards, count badge, gradient CTA, animations, empty state |
| `src/components/dashboard/TeamTab.tsx` | Modify | Avatar circles, styled badges, invite animation, empty state |
| `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx` | Modify | Elevated cards, company logo, hover lift, styled empty state |
| `src/components/gcc-dashboard/CurrentRequestsTab.tsx` | Modify | Status left-borders, icon badges, styled empty state |

**Existing reusable components:**
- `src/components/directory/CompanyLogo.tsx` — handles `logo_url` + `logo_bg` + initials fallback
- `src/lib/types.ts` — `Company` interface with `logo_url?: string` and `logo_bg?: string`
- `src/auth/useUserRole.ts` — uses `useUser()` from Clerk internally

---

### Task 1: Dark Sidebar with Branding Header

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`

- [ ] **Step 1: Add branding props and header section**

Replace the entire file with:

```tsx
"use client";

import Image from "next/image";
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
}

export function DashboardSidebar({ navItems, activeKey, onNavigate, brand }: DashboardSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Brand header */}
      {brand && (
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <div className={`w-9 h-9 rounded-lg shrink-0 overflow-hidden flex items-center justify-center ${brand.logoBg === "dark" ? "bg-slate-800" : "bg-white"}`}>
                <Image src={brand.logoUrl} alt={brand.name} width={36} height={36} className="w-full h-full object-contain p-0.5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white text-sm font-bold shrink-0">
                {brand.fallbackInitial}
              </div>
            )}
            <span className="text-sm font-semibold text-white truncate">{brand.name}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-1">
        {navItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-white/10 text-white font-semibold border-l-[3px] border-primary pl-[9px]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent pl-[9px]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes with no errors (admin dashboard still uses the old props — it will work because `brand` is optional)

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat: dark sidebar with branding header and left-border active state"
```

---

### Task 2: DashboardShell — Content Background, Shadow, Branding Props

**Files:**
- Modify: `src/components/dashboard/DashboardShell.tsx`

- [ ] **Step 1: Add branding props and visual updates**

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
}: DashboardShellProps) {
  const topOffset = hideNavbar ? "pt-0" : "pt-16 md:pt-20";
  const sidebarTop = hideNavbar ? "md:top-0" : "md:top-20";
  const mobileStickyTop = hideNavbar ? "top-0" : "top-16";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={`min-h-screen bg-enterprise-50 ${topOffset}`}>
        {/* Sidebar — fixed, desktop only */}
        <aside className={`hidden md:fixed ${sidebarTop} md:bottom-0 md:left-0 md:flex md:w-64 md:flex-col z-30 shadow-xl`}>
          <DashboardSidebar navItems={navItems} activeKey={activeKey} onNavigate={onNavigate} brand={brand} />
        </aside>

        {/* Main content — offset for sidebar on desktop */}
        <main className="md:ml-64">
          <DashboardMobileNav navItems={navItems} activeKey={activeKey} onNavigate={onNavigate} stickyTop={mobileStickyTop} brandName={brand?.name} />
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

Key changes: `bg-enterprise-50` on content area, `shadow-xl` on sidebar instead of `border-r`, `brand` prop passed through.

**Note:** Do NOT verify the build yet — Task 3 adds the `brandName` prop to `DashboardMobileNav` that this file references. Complete Task 3 first, then verify.

---

### Task 3: DashboardMobileNav — Brand Name

**Files:**
- Modify: `src/components/dashboard/DashboardMobileNav.tsx`

- [ ] **Step 1: Add brandName prop to mobile nav**

Add `brandName` to the props interface and display it:

In the props interface, change:

```tsx
interface DashboardMobileNavProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  stickyTop?: string;
}
```

to:

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
export function DashboardMobileNav({ navItems, activeKey, onNavigate, stickyTop = "top-16", brandName }: DashboardMobileNavProps) {
```

In the button's `<span>` that shows the active label, prepend the brand name if available. Replace:

```tsx
        <span className="flex items-center gap-2">
          {activeItem && <activeItem.icon className="w-4 h-4" />}
          {activeItem?.label}
        </span>
```

with:

```tsx
        <span className="flex items-center gap-2 min-w-0">
          {activeItem && <activeItem.icon className="w-4 h-4 shrink-0" />}
          <span className="truncate">
            {brandName ? `${brandName} — ${activeItem?.label}` : activeItem?.label}
          </span>
        </span>
```

- [ ] **Step 2: Verify build (Tasks 2+3 together)**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes with no errors

- [ ] **Step 3: Commit tasks 2+3**

```bash
git add src/components/dashboard/DashboardShell.tsx src/components/dashboard/DashboardMobileNav.tsx
git commit -m "feat: dark sidebar shell with bg-enterprise-50 content and mobile brand name"
```

---

### Task 4: Provider Dashboard Page — Pass Brand Data

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Construct brand object and pass to DashboardShell**

After the early returns (auth guards), before the return JSX, add a brand object. Insert this block just before the `return (` line:

```tsx
  const brand = {
    name: myCompany.name,
    logoUrl: myCompany.logo_url,
    logoBg: myCompany.logo_bg,
    fallbackInitial: myCompany.name.charAt(0).toUpperCase(),
  };
```

Then add the `brand` prop to the `<DashboardShell>`:

```tsx
  return (
    <DashboardShell
      title="Provider Dashboard"
      navItems={NAV_ITEMS}
      activeKey={activeTab}
      onNavigate={handleNavigate}
      brand={brand}
    >
```

Also add the import for `SidebarBrand` — actually it's not needed since we're passing a plain object that matches the shape. TypeScript will structurally type-check it.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes. Note: `myCompany` from `companyMembers.getMyCompany` returns the company doc which has `name`, `logo_url`, `logo_bg` fields.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: pass company brand data to provider dashboard sidebar"
```

---

### Task 5: GCC Dashboard Page — Pass User Brand Data

**Files:**
- Modify: `src/app/gcc-dashboard/page.tsx`

- [ ] **Step 1: Import useUser and construct brand**

Add `useUser` import:

```tsx
import { useAuth, useUser } from "@clerk/nextjs";
```

Inside the component, add after the existing hooks:

```tsx
  const { user } = useUser();
```

Before the `return (` with `<DashboardShell>`, add:

```tsx
  const brand = user ? {
    name: user.firstName || user.primaryEmailAddress?.emailAddress || "User",
    fallbackInitial: (user.firstName || user.primaryEmailAddress?.emailAddress || "U").charAt(0).toUpperCase(),
    logoUrl: user.imageUrl || undefined,
  } : undefined;
```

Add `brand` prop to `<DashboardShell>`:

```tsx
  return (
    <DashboardShell
      title="GCC Dashboard"
      navItems={NAV_ITEMS}
      activeKey={activeTab}
      onNavigate={handleNavigate}
      brand={brand}
    >
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 3: Commit**

```bash
git add src/app/gcc-dashboard/page.tsx
git commit -m "feat: pass Clerk user brand data to GCC dashboard sidebar"
```

---

### Task 6: ProfileTab — Company Header Card with Logo

**Files:**
- Modify: `src/components/dashboard/ProfileTab.tsx`

- [ ] **Step 1: Rewrite ProfileTab with elevated company card**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, CheckCircle, Pencil, MapPin, Globe, AlertCircle } from "lucide-react";
import { CompanyLogo } from "@/components/directory/CompanyLogo";

export function ProfileTab() {
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const createEdit = useMutation(api.companyEdits.create);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ description: "", website: "" });
  const [submitted, setSubmitted] = useState(false);

  if (myCompany === undefined) {
    return <ProfileSkeleton />;
  }

  if (!myCompany) {
    return <p className="text-enterprise-500">No company profile found. Complete the claim process first.</p>;
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (form.description && form.description !== myCompany.description) payload.description = form.description;
    if (form.website && form.website !== myCompany.website) payload.website = form.website;
    if (Object.keys(payload).length === 0) return;

    await createEdit({ company_id: myCompany._id, payload });
    setEditing(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const startEditing = () => {
    setForm({ description: myCompany.description || "", website: myCompany.website || "" });
    setEditing(true);
  };

  return (
    <div>
      {submitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">Edit submitted for admin review.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-6">
        {/* Header row: logo + name + edit button */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <CompanyLogo company={myCompany as any} size="lg" />
            <div>
              <h3 className="text-xl font-bold text-enterprise-900">{myCompany.name}</h3>
              {myCompany.headquarters && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-enterprise-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {myCompany.headquarters}
                </div>
              )}
              {myCompany.website && !editing && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Globe className="w-3.5 h-3.5 text-enterprise-400" />
                  <a href={myCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {myCompany.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-enterprise-600 hover:text-enterprise-900 hover:bg-enterprise-100 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>

        {/* Description / Edit form */}
        {editing ? (
          <form onSubmit={handleSubmitEdit} className="mt-5 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Changes will be sent for admin review before going live.</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-enterprise-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-enterprise-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-enterprise-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-enterprise-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Submit Changes for Review
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-enterprise-600 hover:text-enterprise-900">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-enterprise-600 leading-relaxed">
            {myCompany.description || "No description set."}
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-enterprise-200" />
        <div className="flex-1">
          <div className="h-5 w-48 bg-enterprise-200 rounded" />
          <div className="h-3 w-32 bg-enterprise-100 rounded mt-3" />
          <div className="h-3 w-40 bg-enterprise-100 rounded mt-2" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full bg-enterprise-100 rounded" />
        <div className="h-3 w-3/4 bg-enterprise-100 rounded" />
        <div className="h-3 w-1/2 bg-enterprise-100 rounded" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ProfileTab.tsx
git commit -m "feat: polished ProfileTab with company logo, elevated card, skeleton loader"
```

---

### Task 7: AgentsTab — Elevated Cards, Animations, Empty State

**Files:**
- Modify: `src/components/dashboard/AgentsTab.tsx`

This is the largest tab. The changes are focused on the **list view** rendering — the `detail`, `submit`, and `resubmit` sub-views remain unchanged.

- [ ] **Step 1: Add framer-motion import and update list view rendering**

At the top of the file, add the import:

```tsx
import { motion } from "framer-motion";
```

Replace the **list view return** section. Find the block starting with `// List view` and `return (` through to the end of the function (before the closing `}`). Replace it with:

```tsx
  // List view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-enterprise-900">Your Agents</h3>
          <span className="text-xs text-enterprise-500 bg-enterprise-100 px-2 py-0.5 rounded-full">
            {agents.length}
          </span>
        </div>
        <button
          onClick={() => setView({ mode: "submit" })}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent-purple text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Submit New Agent
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {pendingSubmissions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h4 className="text-sm font-semibold uppercase tracking-wide text-enterprise-500">
              Pending Review
            </h4>
          </div>
          <div className="space-y-3">
            {pendingSubmissions.map((submission: any) => (
              <div
                key={submission._id}
                className="bg-white rounded-2xl shadow-card p-5 border-l-[3px] border-amber-400 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => submission.submission_status === "changes_requested"
                  ? setView({ mode: "resubmit", submission })
                  : undefined
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-enterprise-900">{submission.agent_name}</p>
                      <SubmissionStatusBadge status={submission.submission_status} />
                    </div>
                    {submission.tagline && (
                      <p className="mt-1 text-sm text-enterprise-600 line-clamp-2">{submission.tagline}</p>
                    )}
                  </div>
                  <div className="text-xs text-enterprise-500">
                    Submitted {new Date(submission.created_at).toLocaleDateString("en-US")}
                  </div>
                </div>
                {submission.admin_notes && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{submission.admin_notes}</span>
                  </div>
                )}
                {submission.submission_status === "changes_requested" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setView({ mode: "resubmit", submission }); }}
                      className="rounded-lg border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                    >
                      Revise Submission
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!agents.length ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center">
            <Bot className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold text-enterprise-900 mt-4">No agents listed yet</h3>
          <p className="text-sm text-enterprise-500 mt-2 max-w-sm mx-auto">
            {pendingSubmissions.length > 0
              ? "Pending submissions will appear here once approved."
              : "Submit your first AI agent to the directory."}
          </p>
          {pendingSubmissions.length === 0 && (
            <button
              onClick={() => setView({ mode: "submit" })}
              className="mt-6 px-5 py-2.5 bg-gradient-to-r from-primary to-accent-purple text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Submit an Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent: any, i: number) => {
            const categoryColor = CATEGORY_COLORS[agent.category] ?? "bg-enterprise-400";
            const hasPending = pendingEdits.some((e: any) => e.agent_id === agent._id);

            return (
              <motion.button
                key={agent._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setView({ mode: "detail", agent })}
                className="relative bg-white rounded-2xl shadow-card p-6 text-left hover:-translate-y-[2px] hover:shadow-lg active:translate-y-0 active:scale-[0.99] transition-all duration-300"
              >
                {hasPending && (
                  <span className="absolute top-4 right-4" title="Pending edits">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </span>
                )}
                <h4 className="font-semibold text-enterprise-900">{agent.agent_name}</h4>
                {agent.tagline && (
                  <p className="text-sm text-enterprise-600 mt-1 line-clamp-2">{agent.tagline}</p>
                )}
                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`w-2 h-2 rounded-full ${categoryColor}`} />
                  <span className="text-xs text-enterprise-500">{agent.category}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
```

- [ ] **Step 2: Update loading state to skeleton**

Replace the existing loading return at the top of the component:

```tsx
  if (agents === undefined || companySubmissions === undefined || myEdits === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }
```

with:

```tsx
  if (agents === undefined || companySubmissions === undefined || myEdits === undefined) {
    return <AgentsTabSkeleton />;
  }
```

Add the skeleton component at the bottom of the file (before the `SubmissionStatusBadge` function):

```tsx
function AgentsTabSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-32 bg-enterprise-200 rounded animate-pulse" />
        <div className="h-9 w-40 bg-enterprise-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
            <div className="h-4 w-40 bg-enterprise-200 rounded" />
            <div className="h-3 w-full bg-enterprise-100 rounded mt-3" />
            <div className="h-3 w-2/3 bg-enterprise-100 rounded mt-2" />
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-2 h-2 rounded-full bg-enterprise-200" />
              <div className="h-3 w-16 bg-enterprise-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/AgentsTab.tsx
git commit -m "feat: polished AgentsTab with elevated cards, animations, gradient CTA, skeleton loader"
```

---

### Task 8: TeamTab — Avatar Circles, Styled Badges, Invite Animation

**Files:**
- Modify: `src/components/dashboard/TeamTab.tsx`

- [ ] **Step 1: Rewrite TeamTab with polish**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import { Loader2, Users, Plus, Trash2, CheckCircle, AlertCircle, Shield, Mail, Star, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

type TeamTabProps = {
  companyId: string;
  membershipRole: "owner" | "member";
};

export function TeamTab({ companyId, membershipRole }: TeamTabProps) {
  const members = useQuery(api.companyMembers.getMembers, { company_id: companyId as any });
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageTeam = membershipRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !canManageTeam) return;

    setIsInviting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/provider-team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "We couldn't send that invite.");
      }

      setEmail("");
      setShowInvite(false);
      setSuccess("Invite sent. The teammate will appear as pending until they accept it.");
    } catch (err: any) {
      setError(err?.message || "We couldn't send that invite.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!canManageTeam) return;
    setIsRemovingId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/provider-team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "We couldn't remove that team member.");
      }

      setSuccess("Team member removed.");
    } catch (err: any) {
      setError(err?.message || "We couldn't remove that team member.");
    } finally {
      setIsRemovingId(null);
    }
  };

  if (members === undefined) {
    return <TeamSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-enterprise-900">Team Members</h3>
          <span className="text-xs text-enterprise-500 bg-enterprise-100 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        {canManageTeam && (
          <button
            onClick={() => { setError(""); setSuccess(""); setShowInvite(!showInvite); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {!canManageTeam && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-enterprise-100 px-4 py-3">
          <Shield className="w-4 h-4 text-enterprise-500 mt-0.5 shrink-0" />
          <span className="text-sm text-enterprise-600">Only company owners can invite or remove team members.</span>
        </div>
      )}

      <AnimatePresence>
        {showInvite && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleInvite}
            className="overflow-hidden mb-6"
          >
            <div className="flex gap-3 p-4 bg-white rounded-2xl shadow-card">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-enterprise-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <button type="submit" disabled={isInviting}
                className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors whitespace-nowrap">
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!members.length ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold text-enterprise-900 mt-4">Your team</h3>
          <p className="text-sm text-enterprise-500 mt-2 max-w-sm mx-auto">
            Invite colleagues to help manage your company profile and agents.
          </p>
          {canManageTeam && (
            <button
              onClick={() => setShowInvite(true)}
              className="mt-6 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Invite a Team Member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member: any, i: number) => {
            const initial = (member.email || member.user_id || "?").charAt(0).toUpperCase();
            const isOwner = member.role === "owner";

            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {initial}
                    </div>
                    {isOwner && (
                      <Star className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-enterprise-900 text-sm">{member.email || member.user_id}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isOwner ? "bg-primary/10 text-primary" : "bg-enterprise-100 text-enterprise-600"
                      }`}>
                        {member.role}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        member.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {member.status === "pending" && <Clock className="w-3 h-3" />}
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                {canManageTeam && !isOwner && (
                  <button
                    onClick={() => handleRemove(member._id)}
                    disabled={isRemovingId === member._id}
                    className="p-2 text-enterprise-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {isRemovingId === member._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-36 bg-enterprise-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-enterprise-200 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-enterprise-200" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-enterprise-200 rounded" />
              <div className="h-3 w-24 bg-enterprise-100 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/TeamTab.tsx
git commit -m "feat: polished TeamTab with avatar circles, styled badges, invite animation, skeleton"
```

---

### Task 9: ShortlistedAgentsTab — Elevated Cards, Styled Empty State

**Files:**
- Modify: `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx`

- [ ] **Step 1: Rewrite with elevated cards and polish**

Replace the entire file:

```tsx
"use client";

import Link from "next/link";
import { Trash2, Loader2, Star, ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/category-colors";

export function ShortlistedAgentsTab() {
  const shortlist = useQuery(api.shortlists.getMine);
  const agents = useQuery(
    api.agents.getByIds,
    shortlist ? { ids: shortlist.map((s: any) => s.agent_id) } : "skip"
  );
  const removeFromShortlist = useMutation(api.shortlists.remove);

  if (shortlist === undefined) {
    return <ShortlistSkeleton />;
  }

  if (!shortlist.length) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center">
          <Star className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-lg font-semibold text-enterprise-900 mt-4">No shortlisted agents yet</h3>
        <p className="text-sm text-enterprise-500 mt-2 max-w-sm mx-auto">
          Browse the directory to find and shortlist AI agents for your organization.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent-purple text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse Directory
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-semibold text-enterprise-900">Shortlisted Agents</h3>
        <span className="text-xs text-enterprise-500 bg-enterprise-100 px-2 py-0.5 rounded-full">
          {shortlist.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(agents ?? []).map((agent: any, i: number) => {
          const categoryColor = CATEGORY_COLORS[agent.category] ?? "bg-enterprise-400";

          return (
            <motion.div
              key={agent._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl shadow-card p-6 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-enterprise-900">{agent.agent_name}</h4>
                  {agent.tagline && (
                    <p className="text-sm text-enterprise-600 mt-1 line-clamp-2">{agent.tagline}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className={`w-2 h-2 rounded-full ${categoryColor}`} />
                    <span className="text-xs text-enterprise-500">{agent.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromShortlist({ agent_id: agent._id })}
                  className="p-2 text-enterprise-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                  title="Remove from shortlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-enterprise-100">
                <Link
                  href={agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`}
                  className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ShortlistSkeleton() {
  return (
    <div>
      <div className="h-5 w-40 bg-enterprise-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
            <div className="h-4 w-40 bg-enterprise-200 rounded" />
            <div className="h-3 w-full bg-enterprise-100 rounded mt-3" />
            <div className="h-3 w-2/3 bg-enterprise-100 rounded mt-2" />
            <div className="mt-4 pt-3 border-t border-enterprise-100">
              <div className="h-3 w-20 bg-enterprise-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 3: Commit**

```bash
git add src/components/gcc-dashboard/ShortlistedAgentsTab.tsx
git commit -m "feat: polished ShortlistedAgentsTab with elevated cards, animations, styled empty state"
```

---

### Task 10: CurrentRequestsTab — Status Borders, Icon Badges, Empty State

**Files:**
- Modify: `src/components/gcc-dashboard/CurrentRequestsTab.tsx`

The CurrentRequestsTab is already more polished than originally assumed (has timestamps, detail rows, etc.). Focus on: elevated card treatment, status left-border, icon in badges, and styled empty state.

- [ ] **Step 1: Update StatusBadge to include icons and update card styling**

Add imports at the top:

```tsx
import { Loader2, MessageCircle, Building2, CheckCircle, XCircle, Clock } from "lucide-react";
```

Replace the `StatusBadge` function:

```tsx
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; icon: React.ReactNode }> = {
    pending_admin: { bg: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock className="w-3 h-3" /> },
    approved: { bg: "bg-blue-50 text-blue-700 border border-blue-200", icon: <CheckCircle className="w-3 h-3" /> },
    contacted: { bg: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { bg: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle className="w-3 h-3" /> },
  };

  const { bg, icon } = config[status] ?? { bg: "bg-enterprise-100 text-enterprise-600", icon: null };
  const label = status.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bg}`}>
      {icon}
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Add status left-border to request cards**

In the main card `<div>`, update the className. Find:

```tsx
          className="rounded-2xl border border-enterprise-200 bg-white p-5"
```

Replace with a function that adds a left-border based on status. Wrap the card render in a computed border color. Replace the card mapping section:

Find the `requests.map` block and update the card `<div>`:

```tsx
      {requests.map((request: any) => {
        const borderColor: Record<string, string> = {
          pending_admin: "border-l-amber-400",
          approved: "border-l-blue-400",
          contacted: "border-l-green-400",
          rejected: "border-l-red-400",
        };
        const leftBorder = borderColor[request.status] ?? "border-l-enterprise-300";

        return (
          <div
            key={request._id}
            className={`bg-white rounded-2xl shadow-card p-5 border-l-[3px] ${leftBorder}`}
          >
```

Make sure the rest of the card content remains unchanged (the detail rows, admin notes, etc. are already good).

- [ ] **Step 3: Update empty state**

Replace the empty state return:

```tsx
  if (!requests.length) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-lg font-semibold text-enterprise-900 mt-4">No contact requests yet</h3>
        <p className="text-sm text-enterprise-500 mt-2 max-w-sm mx-auto">
          When you reach out to providers, your requests will appear here.
        </p>
      </div>
    );
  }
```

- [ ] **Step 4: Update loading state to skeleton**

Replace the loading return:

```tsx
  if (requests === undefined) {
    return <RequestsSkeleton />;
  }
```

Add the skeleton at the bottom of the file:

```tsx
function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse border-l-[3px] border-l-enterprise-200">
          <div className="flex justify-between">
            <div>
              <div className="h-5 w-40 bg-enterprise-200 rounded" />
              <div className="h-3 w-32 bg-enterprise-100 rounded mt-2" />
            </div>
            <div className="h-3 w-24 bg-enterprise-100 rounded" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><div className="h-3 w-16 bg-enterprise-100 rounded mb-2" /><div className="h-3 w-full bg-enterprise-100 rounded" /></div>
            <div><div className="h-3 w-16 bg-enterprise-100 rounded mb-2" /><div className="h-3 w-full bg-enterprise-100 rounded" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes

- [ ] **Step 6: Commit**

```bash
git add src/components/gcc-dashboard/CurrentRequestsTab.tsx
git commit -m "feat: polished CurrentRequestsTab with status borders, icon badges, skeleton loader"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Full build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build completes with no errors

- [ ] **Step 2: Run tests**

Run: `npm test 2>&1 | tail -15`
Expected: Same pass/fail count as before (no new failures introduced)

- [ ] **Step 3: Commit any remaining changes**

```bash
git status
```

If any uncommitted files remain, stage and commit them with an appropriate message.
