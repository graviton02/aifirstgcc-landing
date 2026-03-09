# Directory + Claim Profile — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Orbys360 from a Vite SPA with provider-submitted agents to a Next.js directory-first platform with ~1000 scraped agents, company claim flow, content gating, and comparison tool.

**Architecture:** Next.js App Router with server components for SEO-critical public pages (directory, agent detail, company, categories) and client components for authenticated flows (dashboards, compare, shortlist). Convex backend preserved with new schema. Clerk magic link auth via `@clerk/nextjs`.

**Tech Stack:** Next.js 15, React 18, TypeScript, Convex, Clerk, Tailwind CSS, Shadcn UI, Framer Motion, Vitest, React Testing Library

---

## Phase 1: Next.js Project Setup & Foundation

> **Dependencies:** None — this is the starting point
> **Outcome:** A working Next.js app with Convex + Clerk wired up, rendering a "Hello World" at `/`

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json` (new — replaces existing)
- Create: `next.config.ts`
- Create: `tsconfig.json` (new — Next.js defaults + path aliases)
- Create: `tailwind.config.ts` (migrate from existing)
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Preserve: `convex/` directory (no changes)

**Step 1: Create a new branch from develop**

```bash
git checkout develop
git checkout -b feature/nextjs-migration
```

**Step 2: Initialize Next.js in a temporary directory**

```bash
npx create-next-app@latest orbys360-next --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

**Step 3: Merge Next.js config into the existing repo**

Copy the following from `orbys360-next/` into the project root:
- `next.config.ts`
- `tsconfig.json` (merge path aliases: keep `@/*` → `./src/*` pattern but adapt for Next.js)
- `postcss.config.mjs`
- `app/` directory structure

Remove old Vite files:
- `vite.config.ts`
- `index.html`

**Step 4: Update `package.json`**

Replace Vite scripts with Next.js:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch"
  }
}
```

Add dependencies:
```bash
npm install next@latest @clerk/nextjs convex-nextjs
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom convex-test
```

Remove old dependencies:
```bash
npm uninstall react-router-dom @clerk/clerk-react vite @vitejs/plugin-react
```

**Step 5: Configure `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Convex deployment URLs
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
    ],
  },
};

export default nextConfig;
```

**Step 6: Create root layout with Convex + Clerk providers**

Create `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Orbys360 — AI Agent Directory",
  description: "Discover, compare, and connect with 1000+ AI agents across industries and functions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

Create `components/providers/ConvexClientProvider.tsx`:
```tsx
"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

**Step 7: Create minimal homepage**

Create `app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Orbys360 — AI Agent Directory</h1>
      <p>Coming soon: 1000+ AI agents to discover.</p>
    </main>
  );
}
```

**Step 8: Update environment variables**

Rename in `.env`:
- `VITE_CLERK_PUBLISHABLE_KEY` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `VITE_CONVEX_URL` → `NEXT_PUBLIC_CONVEX_URL`

**Step 9: Configure Clerk middleware**

Create `middleware.ts` at project root:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/shortlist(.*)",
  "/compare(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
```

**Step 10: Verify the app starts**

```bash
npm run dev
# Visit http://localhost:3000 — should show "Orbys360 — AI Agent Directory"
```

**Step 11: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `tests/setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
```

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js App Router with Convex + Clerk providers"
```

---

### Task 1.2: Migrate Tailwind & Shadcn UI Components

**Files:**
- Move: `src/components/ui/*` → `components/ui/*`
- Create: `lib/utils.ts` (cn helper)
- Move: `src/styles/globals.css` → `styles/globals.css` (or `app/globals.css`)

**Step 1: Copy Shadcn UI components**

Move all files from `src/components/ui/` to `components/ui/`. These are framework-agnostic — no changes needed except import paths.

**Step 2: Update import paths**

All Shadcn components use `@/lib/utils` for the `cn` helper. Ensure `lib/utils.ts` exists:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Copy global CSS**

Move Tailwind base styles to `app/globals.css` (or wherever layout.tsx imports from).

**Step 4: Verify a Shadcn component renders**

Write a quick smoke test:
```typescript
// tests/components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });
});
```

Run: `npm test -- tests/components/ui/button.test.tsx`

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: migrate Tailwind config and Shadcn UI components to Next.js"
```

---

### Task 1.3: Migrate Shared Components (Navbar, Footer)

**Files:**
- Move: `src/components/shared/Navbar.tsx` → `components/shared/Navbar.tsx`
- Create: `components/shared/Footer.tsx`
- Modify: `app/layout.tsx` (add Navbar)

**Step 1: Migrate Navbar**

Copy `Navbar.tsx`. Key changes:
- Replace `import { Link } from "react-router-dom"` → `import Link from "next/link"`
- Replace `<Link to="/path">` → `<Link href="/path">`
- Replace `useNavigate()` → `useRouter()` from `next/navigation`
- Add `"use client"` directive at top (Navbar uses hooks)

**Step 2: Update Navbar routes**

Update navigation links to match new route structure:
- `/marketplace` → `/` (directory is homepage)
- `/providers` → `/companies` (or remove)
- Other routes as per the design doc

**Step 3: Add Navbar to layout**

Update `app/layout.tsx` to include `<Navbar />` in the body.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: migrate Navbar and shared components to Next.js"
```

---

## Phase 2: New Convex Schema & Backend

> **Dependencies:** Phase 1 complete (Next.js app running)
> **Outcome:** New Convex schema deployed with `companies`, `claimRequests`, `companyMembers`, `companyEdits`, `buyerProfiles` tables. Modified `agents` table. Backend functions for directory queries.

### Task 2.1: Update Convex Schema

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Write the new schema**

Update `convex/schema.ts` to add new tables and modify `agents`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- NEW TABLES ---

  companies: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    website: v.string(),
    headquarters: v.string(),
    founded: v.optional(v.number()),
    company_size: v.string(),
    logo_url: v.optional(v.string()),
    primary_verticals: v.array(v.string()),
    contact_email: v.optional(v.string()),
    verification_status: v.string(),
    claim_status: v.string(), // "unclaimed" | "pending" | "claimed"
    claimed_by_user_id: v.optional(v.string()),
    claimed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_claimStatus", ["claim_status"])
    .index("by_claimedByUserId", ["claimed_by_user_id"])
    .searchIndex("search_companies", {
      searchField: "name",
      filterFields: ["claim_status"],
    }),

  claimRequests: defineTable({
    company_id: v.id("companies"),
    claimant_name: v.string(),
    claimant_email: v.string(),
    claimant_linkedin: v.string(),
    status: v.string(), // "pending" | "approved" | "rejected"
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_companyId", ["company_id"])
    .index("by_status", ["status"]),

  companyMembers: defineTable({
    company_id: v.id("companies"),
    user_id: v.string(),
    email: v.string(),
    role: v.string(), // "owner" | "member"
    invited_by: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_companyId", ["company_id"])
    .index("by_userId", ["user_id"]),

  companyEdits: defineTable({
    company_id: v.id("companies"),
    user_id: v.string(),
    payload: v.any(),
    status: v.string(), // "pending" | "approved" | "rejected"
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_companyId", ["company_id"])
    .index("by_status", ["status"]),

  buyerProfiles: defineTable({
    user_id: v.string(),
    name: v.string(),
    email: v.string(),
    company_name: v.string(),
    job_title: v.string(),
    created_at: v.number(),
  }).index("by_userId", ["user_id"]),

  // --- MODIFIED TABLES ---

  agents: defineTable({
    slug: v.string(),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    company_id: v.id("companies"),
    logo_url: v.optional(v.string()),
    functional_categories: v.array(v.string()),
    industry_categories: v.array(v.string()),
    infrastructure_categories: v.array(v.string()),
    use_cases: v.array(v.string()),
    business_functions: v.array(v.string()),
    expected_outcomes: v.array(v.string()),
    integrations: v.array(v.string()),
    source_url: v.optional(v.string()),
    tags: v.array(v.string()),
    demo_url: v.optional(v.string()),
    compliance_certifications: v.array(v.string()),
    security_features: v.array(v.string()),
    rating: v.number(),
    review_count: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    search_text: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_companyId", ["company_id"])
    .searchIndex("search_agents", {
      searchField: "search_text",
      filterFields: ["status"],
    }),

  agentEdits: defineTable({
    agent_id: v.id("agents"),
    user_id: v.string(),
    payload: v.any(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_userId", ["user_id"])
    .index("by_status", ["status"]),

  agentSubmissions: defineTable({
    user_id: v.string(),
    company_id: v.id("companies"),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    functional_categories: v.array(v.string()),
    industry_categories: v.array(v.string()),
    infrastructure_categories: v.array(v.string()),
    use_cases: v.array(v.string()),
    business_functions: v.array(v.string()),
    expected_outcomes: v.array(v.string()),
    integrations: v.array(v.string()),
    logo_url: v.optional(v.string()),
    tags: v.array(v.string()),
    demo_url: v.optional(v.string()),
    compliance_certifications: v.array(v.string()),
    security_features: v.array(v.string()),
    submission_status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested")
    ),
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_userId", ["user_id"])
    .index("by_status", ["submission_status"]),

  // --- KEPT TABLES (unchanged) ---

  earlyAccessSignups: defineTable({
    email: v.string(),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  agentShortlists: defineTable({
    user_id: v.string(),
    agent_id: v.id("agents"),
    created_at: v.number(),
  })
    .index("by_userId", ["user_id"])
    .index("by_userAndAgent", ["user_id", "agent_id"]),

  contactLogs: defineTable({
    buyer_user_id: v.string(),
    agent_id: v.id("agents"),
    company_id: v.id("companies"),
    contacted_at: v.number(),
  }).index("by_buyerUserId", ["buyer_user_id"]),

  adminSessions: defineTable({
    session_token: v.string(),
    expires_at: v.number(),
    created_at: v.number(),
  }).index("by_token", ["session_token"]),

  selfAssessments: defineTable({
    user_id: v.string(),
    org_id: v.string(),
    answers: v.optional(v.any()),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    completed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_userId", ["user_id"]),

  selfAssessmentResults: defineTable({
    assessment_id: v.id("selfAssessments"),
    overall_score: v.optional(v.number()),
    category_scores: v.any(),
    analysis: v.any(),
    recommendations: v.optional(v.any()),
    pdf_url: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_assessmentId", ["assessment_id"]),
});
```

**Step 2: Push schema to Convex dev**

```bash
npx convex dev --once
```

Expected: Schema deploys successfully. Some existing tables will need data migration (or fresh DB if dev is empty).

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: update Convex schema for directory model with companies, claims, and multi-category agents"
```

---

### Task 2.2: Create Companies Backend Functions

**Files:**
- Create: `convex/companies.ts`

**Step 1: Write company query and mutation functions**

```typescript
// convex/companies.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const list = query({
  args: {
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, limit }) => {
    const pageSize = limit ?? 20;

    if (search && search.trim()) {
      const results = await ctx.db
        .query("companies")
        .withSearchIndex("search_companies", (q) =>
          q.search("name", search)
        )
        .take(pageSize);
      return { data: results, count: results.length };
    }

    const all = await ctx.db.query("companies").collect();
    return { data: all.slice(0, pageSize), count: all.length };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
```

**Step 2: Push and verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/companies.ts
git commit -m "feat: add company queries (list, getBySlug, getById)"
```

---

### Task 2.3: Update Agents Backend Functions

**Files:**
- Modify: `convex/agents.ts`

**Step 1: Update agent queries for new schema**

Key changes:
- `list` query: support multi-category filtering (functional, industry, infrastructure)
- `getBySlug`: new query for SEO-friendly URLs
- `getByCompany`: replace `getByProvider` with company-based lookup
- Remove provider_profile_id references

```typescript
// convex/agents.ts — updated list query
export const list = query({
  args: {
    search: v.optional(v.string()),
    functional_category: v.optional(v.string()),
    industry_category: v.optional(v.string()),
    infrastructure_category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { search, functional_category, industry_category, infrastructure_category, limit } = args;
    const pageSize = limit ?? 12;

    if (search && search.trim()) {
      const results = await ctx.db
        .query("agents")
        .withSearchIndex("search_agents", (q) => {
          let sq = q.search("search_text", search);
          sq = sq.eq("status", "active");
          return sq;
        })
        .take(pageSize * 3); // Over-fetch for client-side filtering

      const filtered = results.filter((a) => {
        if (functional_category && !a.functional_categories.includes(functional_category)) return false;
        if (industry_category && !a.industry_categories.includes(industry_category)) return false;
        if (infrastructure_category && !a.infrastructure_categories.includes(infrastructure_category)) return false;
        return true;
      });

      return { data: filtered.slice(0, pageSize), count: filtered.length };
    }

    const all = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const filtered = all.filter((a) => {
      if (functional_category && !a.functional_categories.includes(functional_category)) return false;
      if (industry_category && !a.industry_categories.includes(industry_category)) return false;
      if (infrastructure_category && !a.infrastructure_categories.includes(infrastructure_category)) return false;
      return true;
    });

    return { data: filtered.slice(0, pageSize), count: filtered.length };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getByCompany = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});
```

**Step 2: Update mutation functions**

Update `submit` and `createEdit` to use `company_id` instead of `provider_profile_id`.

**Step 3: Push and verify**

```bash
npx convex dev --once
```

**Step 4: Commit**

```bash
git add convex/agents.ts
git commit -m "feat: update agent queries for directory model with multi-category filtering"
```

---

### Task 2.4: Create Claims Backend Functions

**Files:**
- Create: `convex/claims.ts`

**Step 1: Write claim request functions**

```typescript
// convex/claims.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com",
]);

export const submitClaim = mutation({
  args: {
    company_id: v.id("companies"),
    claimant_name: v.string(),
    claimant_email: v.string(),
    claimant_linkedin: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email domain
    const domain = args.claimant_email.split("@")[1]?.toLowerCase();
    if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
      throw new Error("Please use a company email address, not a free email provider.");
    }

    // Check company exists and isn't already claimed
    const company = await ctx.db.get(args.company_id);
    if (!company) throw new Error("Company not found");
    if (company.claim_status === "claimed") throw new Error("This company has already been claimed.");

    // Check for existing pending claim
    const existing = await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", args.company_id))
      .collect();
    const pendingClaim = existing.find((c) => c.status === "pending");
    if (pendingClaim) throw new Error("A claim request is already pending for this company.");

    const id = await ctx.db.insert("claimRequests", {
      ...args,
      status: "pending",
      created_at: Date.now(),
    });

    // Update company claim_status to pending
    await ctx.db.patch(args.company_id, {
      claim_status: "pending",
      updated_at: Date.now(),
    });

    // Notify admin
    await ctx.scheduler.runAfter(0, internal.notifications.sendAdminAlert, {
      type: "claim_request",
      submission_id: id,
    });

    return id;
  },
});

export const getClaimStatus = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    const claims = await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
    return claims;
  },
});
```

**Step 2: Push and verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/claims.ts
git commit -m "feat: add claim request submission with email validation and admin notification"
```

---

### Task 2.5: Create Buyer Profiles Backend

**Files:**
- Create: `convex/buyers.ts`

**Step 1: Write buyer profile functions**

```typescript
// convex/buyers.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    return await ctx.db
      .query("buyerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();
  },
});

export const createProfile = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company_name: v.string(),
    job_title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Check if profile already exists
    const existing = await ctx.db
      .query("buyerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();
    if (existing) return existing;

    const id = await ctx.db.insert("buyerProfiles", {
      ...args,
      user_id: userId,
      created_at: Date.now(),
    });
    return await ctx.db.get(id);
  },
});
```

**Step 2: Push and verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/buyers.ts
git commit -m "feat: add buyer profile creation and lookup"
```

---

### Task 2.6: Create Company Members Backend

**Files:**
- Create: `convex/companyMembers.ts`

**Step 1: Write company member functions**

```typescript
// convex/companyMembers.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;

    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership) return null;

    const company = await ctx.db.get(membership.company_id);
    return { membership, company };
  },
});

export const getMembers = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    const userId = await requireAuth(ctx);
    // Verify caller is a member
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.company_id !== company_id) {
      throw new Error("Not a member of this company");
    }
    return await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});

export const inviteMember = mutation({
  args: {
    company_id: v.id("companies"),
    email: v.string(),
  },
  handler: async (ctx, { company_id, email }) => {
    const userId = await requireAuth(ctx);

    // Verify caller is owner
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.company_id !== company_id || membership.role !== "owner") {
      throw new Error("Only the company owner can invite members");
    }

    // Check if already a member
    const existingMembers = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
    if (existingMembers.some((m) => m.email === email)) {
      throw new Error("This email is already a member");
    }

    const id = await ctx.db.insert("companyMembers", {
      company_id,
      user_id: "", // Will be set when they accept the invite and sign in
      email,
      role: "member",
      invited_by: userId,
      created_at: Date.now(),
    });

    // TODO: Send invitation email via Clerk or Resend
    return id;
  },
});

export const removeMember = mutation({
  args: {
    member_id: v.id("companyMembers"),
  },
  handler: async (ctx, { member_id }) => {
    const userId = await requireAuth(ctx);
    const member = await ctx.db.get(member_id);
    if (!member) throw new Error("Member not found");

    // Verify caller is owner
    const callerMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!callerMembership || callerMembership.role !== "owner") {
      throw new Error("Only the company owner can remove members");
    }

    // Can't remove the owner
    if (member.role === "owner") {
      throw new Error("Cannot remove the company owner");
    }

    await ctx.db.delete(member_id);
  },
});
```

**Step 2: Push and verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/companyMembers.ts
git commit -m "feat: add company members CRUD with owner authorization"
```

---

### Task 2.7: Create Company Edits Backend

**Files:**
- Create: `convex/companyEdits.ts`

**Step 1: Write company edit functions**

```typescript
// convex/companyEdits.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const create = mutation({
  args: {
    company_id: v.id("companies"),
    payload: v.any(),
  },
  handler: async (ctx, { company_id, payload }) => {
    const userId = await requireAuth(ctx);

    // Verify user is a member of this company
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.company_id !== company_id) {
      throw new Error("Not authorized to edit this company");
    }

    const id = await ctx.db.insert("companyEdits", {
      company_id,
      user_id: userId,
      payload,
      status: "pending",
      created_at: Date.now(),
    });
    return id;
  },
});

export const getByCompany = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("companyEdits")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});
```

**Step 2: Push and verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/companyEdits.ts
git commit -m "feat: add company edit request creation with membership authorization"
```

---

### Task 2.8: Update Admin Backend for Claims

**Files:**
- Modify: `convex/admin.ts`

**Step 1: Add claim management functions**

Add to `convex/admin.ts`:

```typescript
// --- Claim Management ---

export const getPendingClaims = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const claims = await ctx.db
      .query("claimRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const enriched = await Promise.all(
      claims.map(async (c) => {
        const company = await ctx.db.get(c.company_id);
        return {
          ...c,
          company_name: company?.name ?? "Unknown",
          company_slug: company?.slug ?? "",
        };
      })
    );
    return enriched;
  },
});

export const approveClaim = mutation({
  args: { token: v.string(), claim_id: v.id("claimRequests") },
  handler: async (ctx, { token, claim_id }) => {
    await requireAdmin(ctx, token);
    const claim = await ctx.db.get(claim_id);
    if (!claim) throw new Error("Claim not found");

    const now = Date.now();

    // Update claim status
    await ctx.db.patch(claim_id, {
      status: "approved",
      reviewed_at: now,
    });

    // Update company claim status
    await ctx.db.patch(claim.company_id, {
      claim_status: "claimed",
      claimed_at: now,
      updated_at: now,
    });

    // Send magic link invitation email to claimant
    // The claimant will sign up via Clerk magic link
    await ctx.scheduler.runAfter(0, internal.notifications.sendClaimApprovalEmail, {
      claimant_email: claim.claimant_email,
      claimant_name: claim.claimant_name,
      company_id: claim.company_id,
    });
  },
});

export const rejectClaim = mutation({
  args: {
    token: v.string(),
    claim_id: v.id("claimRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, claim_id, notes }) => {
    await requireAdmin(ctx, token);
    const claim = await ctx.db.get(claim_id);
    if (!claim) throw new Error("Claim not found");

    await ctx.db.patch(claim_id, {
      status: "rejected",
      admin_notes: notes,
      reviewed_at: Date.now(),
    });

    // Reset company claim_status to unclaimed
    await ctx.db.patch(claim.company_id, {
      claim_status: "unclaimed",
      updated_at: Date.now(),
    });
  },
});

// --- Company Edit Management ---

export const getPendingCompanyEdits = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const edits = await ctx.db
      .query("companyEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const enriched = await Promise.all(
      edits.map(async (e) => {
        const company = await ctx.db.get(e.company_id);
        return {
          ...e,
          company_name: company?.name ?? "Unknown",
        };
      })
    );
    return enriched;
  },
});

export const approveCompanyEdit = mutation({
  args: { token: v.string(), edit_id: v.id("companyEdits") },
  handler: async (ctx, { token, edit_id }) => {
    await requireAdmin(ctx, token);
    const edit = await ctx.db.get(edit_id);
    if (!edit) throw new Error("Edit not found");

    // Apply payload to company
    const payload = edit.payload as Record<string, unknown>;
    await ctx.db.patch(edit.company_id, {
      ...payload,
      updated_at: Date.now(),
    });

    await ctx.db.patch(edit_id, { status: "approved" });
  },
});

export const rejectCompanyEdit = mutation({
  args: {
    token: v.string(),
    edit_id: v.id("companyEdits"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(edit_id, {
      status: "rejected",
      admin_notes: notes,
    });
  },
});

// --- Directory Overview ---

export const getDirectoryStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);

    const allAgents = await ctx.db.query("agents").collect();
    const allCompanies = await ctx.db.query("companies").collect();
    const allBuyers = await ctx.db.query("buyerProfiles").collect();
    const pendingClaims = await ctx.db
      .query("claimRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return {
      total_agents: allAgents.length,
      active_agents: allAgents.filter((a) => a.status === "active").length,
      total_companies: allCompanies.length,
      claimed_companies: allCompanies.filter((c) => c.claim_status === "claimed").length,
      pending_claims: pendingClaims.length,
      total_buyers: allBuyers.length,
    };
  },
});
```

**Step 2: Add the `sendClaimApprovalEmail` internal action to `convex/notifications.ts`**

```typescript
export const sendClaimApprovalEmail = internalAction({
  args: {
    claimant_email: v.string(),
    claimant_name: v.string(),
    company_id: v.id("companies"),
  },
  handler: async (ctx, { claimant_email, claimant_name, company_id }) => {
    // Send email with Clerk magic link invitation
    // Use Resend to send the email with a link to /sign-in
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orbys360 <noreply@orbys360.com>",
        to: claimant_email,
        subject: "Your company claim has been approved — Orbys360",
        html: `<p>Hi ${claimant_name},</p>
          <p>Your claim request has been approved! You can now sign in to manage your company profile and agents.</p>
          <p><a href="https://orbys360.com/sign-in">Sign in to your dashboard</a></p>
          <p>Best,<br>The Orbys360 Team</p>`,
      }),
    });
  },
});
```

**Step 3: Remove old provider/TSP/problem functions from admin.ts**

Remove: `getPendingProviders`, `getApprovedProviders`, `approveProvider`, `rejectProvider`, `getPendingProblems`, `approveProblem`, `rejectProblem`, `getPendingContactRequests`, `approveContactRequest`, `rejectContactRequest`, `getPendingTspEdits`, `approveTspEdit`, `rejectTspEdit`.

Keep: `login`, `logout`, `checkSession`, `getPendingAgents`, `approveAgent`, `rejectAgent`, `getPendingAgentEdits`, `approveAgentEdit`, `rejectAgentEdit` (updated for new schema).

**Step 4: Push and verify**

```bash
npx convex dev --once
```

**Step 5: Commit**

```bash
git add convex/admin.ts convex/notifications.ts
git commit -m "feat: add admin claim management, company edits, and directory overview"
```

---

### Task 2.9: Create Data Seed Script

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/seed-data/` (placeholder for JSON files)

**Step 1: Write the seed script**

```typescript
// scripts/seed.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import fs from "fs";

const CONVEX_URL = process.env.CONVEX_URL || "your-convex-url";
const client = new ConvexHttpClient(CONVEX_URL);

interface ScrapedCompany {
  name: string;
  website: string;
  headquarters: string;
  founded?: number;
  company_size: string;
  description: string;
  primary_verticals: string[];
  contact_email?: string;
  verification: string;
  agents: ScrapedAgent[];
}

interface ScrapedAgent {
  name: string;
  tagline: string;
  description: string;
  use_cases: string[];
  industries_supported: string[];
  business_functions: string[];
  expected_outcomes: string[];
  integrations: string[];
  source_url: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seed() {
  const dataFile = process.argv[2];
  if (!dataFile) {
    console.error("Usage: npx tsx scripts/seed.ts <path-to-json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(dataFile, "utf-8");
  const companies: ScrapedCompany[] = JSON.parse(raw);

  console.log(`Seeding ${companies.length} companies...`);

  for (const company of companies) {
    const companySlug = slugify(company.name);

    // Insert company via mutation
    const companyId = await client.mutation(api.companies.seed, {
      slug: companySlug,
      name: company.name,
      description: company.description,
      website: company.website,
      headquarters: company.headquarters,
      founded: company.founded,
      company_size: company.company_size,
      primary_verticals: company.primary_verticals,
      contact_email: company.contact_email,
      verification_status: company.verification === "PASS" ? "pass" : "fail",
    });

    console.log(`  Created company: ${company.name} (${companySlug})`);

    // Insert agents
    for (const agent of company.agents) {
      const agentSlug = `${slugify(agent.name)}-${companySlug}`;

      await client.mutation(api.agents.seed, {
        slug: agentSlug,
        agent_name: agent.name,
        tagline: agent.tagline,
        description: agent.description,
        company_id: companyId,
        functional_categories: agent.business_functions,
        industry_categories: agent.industries_supported,
        infrastructure_categories: [], // Map separately if applicable
        use_cases: agent.use_cases,
        business_functions: agent.business_functions,
        expected_outcomes: agent.expected_outcomes,
        integrations: agent.integrations,
        source_url: agent.source_url,
      });

      console.log(`    Created agent: ${agent.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
```

**Step 2: Add seed mutations to Convex**

Add to `convex/companies.ts`:
```typescript
export const seed = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    website: v.string(),
    headquarters: v.string(),
    founded: v.optional(v.number()),
    company_size: v.string(),
    primary_verticals: v.array(v.string()),
    contact_email: v.optional(v.string()),
    verification_status: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotent: check by slug
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("companies", {
      ...args,
      claim_status: "unclaimed",
      created_at: now,
      updated_at: now,
    });
  },
});
```

Add to `convex/agents.ts`:
```typescript
export const seed = mutation({
  args: {
    slug: v.string(),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    company_id: v.id("companies"),
    functional_categories: v.array(v.string()),
    industry_categories: v.array(v.string()),
    infrastructure_categories: v.array(v.string()),
    use_cases: v.array(v.string()),
    business_functions: v.array(v.string()),
    expected_outcomes: v.array(v.string()),
    integrations: v.array(v.string()),
    source_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent: check by slug
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    const searchText = [
      args.agent_name,
      args.description,
      args.tagline ?? "",
      ...args.functional_categories,
      ...args.industry_categories,
      ...args.integrations,
    ].join(" ");

    return await ctx.db.insert("agents", {
      ...args,
      logo_url: undefined,
      tags: [],
      demo_url: undefined,
      compliance_certifications: [],
      security_features: [],
      rating: 0,
      review_count: 0,
      status: "active",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });
  },
});
```

**Step 3: Commit**

```bash
git add scripts/ convex/companies.ts convex/agents.ts
git commit -m "feat: add data seed script and idempotent seed mutations"
```

---

## Phase 3: Public Directory Pages

> **Dependencies:** Phase 2 complete (schema deployed, backend functions ready)
> **Outcome:** Public-facing directory at `/`, agent detail at `/agents/[slug]`, company page at `/companies/[slug]`, category pages at `/categories/[slug]`

### Task 3.1: Homepage — Agent Directory

**Files:**
- Create: `app/page.tsx` (server component)
- Create: `components/directory/AgentGrid.tsx` (client component)
- Create: `components/directory/AgentCard.tsx`
- Create: `components/directory/SearchBar.tsx` (client component)
- Create: `components/directory/CategoryChips.tsx`
- Create: `components/directory/FilterSidebar.tsx` (client component)
- Create: `lib/categories.ts` (taxonomy constants)

**Step 1: Create taxonomy constants**

```typescript
// lib/categories.ts
export const FUNCTIONAL_CATEGORIES = [
  "Customer Experience",
  "Sales & Marketing",
  "Finance & Accounting",
  "HR & Workforce",
  "Engineering & DevOps",
  "IT Operations",
  "Data & Analytics",
  "Legal & Compliance",
  "Operations & Supply Chain",
] as const;

export const INDUSTRY_CATEGORIES = [
  "Healthcare & Life Sciences",
  "Financial Services (BFSI)",
  "Manufacturing",
  "Automotive & Mobility",
  "Retail & E-commerce",
  "Telecom & Media",
  "Energy & Utilities",
  "Real Estate & Construction",
  "Logistics & Transportation",
  "Government & Public Sector",
  "Education",
  "Agriculture & AgriTech",
  "Aerospace & Defense",
] as const;

export const INFRASTRUCTURE_CATEGORIES = [
  "Agent Platforms & Builders",
  "AI Infrastructure & Models",
  "Agent Tooling & Monitoring",
] as const;

export const ALL_CATEGORIES = [
  ...FUNCTIONAL_CATEGORIES,
  ...INDUSTRY_CATEGORIES,
  ...INFRASTRUCTURE_CATEGORIES,
] as const;

export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categoryFromSlug(slug: string): string | undefined {
  return ALL_CATEGORIES.find((c) => slugifyCategory(c) === slug);
}
```

**Step 2: Create the AgentCard component**

A card displaying: agent name, tagline, company name, category tags. Links to `/agents/[slug]`.

**Step 3: Create SearchBar, CategoryChips, FilterSidebar**

- SearchBar: text input with debounce, updates URL search params
- CategoryChips: horizontal scrollable list of top categories
- FilterSidebar: collapsible filter panels for functional, industry, infrastructure categories

**Step 4: Create the homepage**

`app/page.tsx` — server component that pre-renders the initial agent list. Client components handle search/filter interactions.

**Step 5: Write tests**

```typescript
// tests/components/directory/AgentCard.test.tsx
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/directory/AgentCard";

const mockAgent = {
  slug: "agentbridge-sonata",
  agent_name: "AgentBridge",
  tagline: "Enterprise-grade AI framework",
  description: "A cloud-agnostic platform...",
  company_name: "Sonata Software",
  company_slug: "sonata-software",
  functional_categories: ["Customer Experience"],
  industry_categories: ["Financial Services (BFSI)"],
  infrastructure_categories: ["Agent Platforms & Builders"],
};

describe("AgentCard", () => {
  it("renders agent name and tagline", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("AgentBridge")).toBeInTheDocument();
    expect(screen.getByText("Enterprise-grade AI framework")).toBeInTheDocument();
  });

  it("links to agent detail page", () => {
    render(<AgentCard agent={mockAgent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agents/agentbridge-sonata");
  });
});
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add homepage agent directory with search, filters, and category chips"
```

> **Note:** For all frontend tasks in Phase 3+, use the `frontend-design` skill for component design and styling decisions.

---

### Task 3.2: Agent Detail Page

**Files:**
- Create: `app/agents/[slug]/page.tsx` (server component with ISR)
- Create: `components/agent-detail/AgentHero.tsx`
- Create: `components/agent-detail/AgentDescription.tsx`
- Create: `components/agent-detail/GatedSection.tsx` (client component — handles blur/teaser)
- Create: `components/agent-detail/UseCasesSection.tsx`
- Create: `components/agent-detail/IntegrationsSection.tsx`
- Create: `components/agent-detail/OutcomesSection.tsx`
- Create: `components/agent-detail/CompanySidebar.tsx`
- Create: `components/agent-detail/ClaimProfileCTA.tsx`

**Step 1: Create the page with SSG + ISR**

```typescript
// app/agents/[slug]/page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });
  if (!agent) return { title: "Agent Not Found" };

  return {
    title: `${agent.agent_name} — AI Agent | Orbys360`,
    description: agent.tagline || agent.description.slice(0, 160),
    openGraph: {
      title: agent.agent_name,
      description: agent.tagline || agent.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });
  if (!agent) return <div>Agent not found</div>;

  const company = await fetchQuery(api.companies.getById, { id: agent.company_id });

  return (
    <main>
      {/* Public section */}
      <AgentHero agent={agent} company={company} />
      <AgentDescription description={agent.description} />

      {/* Gated sections with blur teaser */}
      <GatedSection title="Use Cases" count={agent.use_cases.length}>
        <UseCasesSection useCases={agent.use_cases} />
      </GatedSection>

      <GatedSection title="Integrations" count={agent.integrations.length}>
        <IntegrationsSection integrations={agent.integrations} />
      </GatedSection>

      <GatedSection title="Expected Business Outcomes" count={agent.expected_outcomes.length}>
        <OutcomesSection outcomes={agent.expected_outcomes} />
      </GatedSection>

      {/* Sidebar */}
      <CompanySidebar company={company} />
    </main>
  );
}

export const revalidate = 3600; // ISR: revalidate every hour
```

**Step 2: Create the GatedSection component**

This is the key UX component — shows blurred content with a signup CTA for anonymous users:

```tsx
// components/agent-detail/GatedSection.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Props {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function GatedSection({ title, count, children }: Props) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
  }

  return (
    <section className="relative">
      <h2>{title} <span className="text-muted-foreground">({count})</span></h2>
      <div className="relative overflow-hidden max-h-40">
        <div className="blur-sm pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background flex items-end justify-center pb-8">
          <Link href="/sign-up" className="btn-primary">
            Create a free account to see full details
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Add JSON-LD schema markup**

```typescript
// In the page component, add structured data:
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: agent.agent_name,
  description: agent.description,
  applicationCategory: "AI Agent",
  author: {
    "@type": "Organization",
    name: company?.name,
    url: company?.website,
  },
};

// In the <head> or via metadata:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Step 4: Write tests for GatedSection**

```typescript
// tests/components/agent-detail/GatedSection.test.tsx
describe("GatedSection", () => {
  it("shows blurred content when not signed in", () => {
    // Mock useAuth to return { isSignedIn: false }
    render(
      <GatedSection title="Use Cases" count={4}>
        <p>Hidden content</p>
      </GatedSection>
    );
    expect(screen.getByText("Create a free account")).toBeInTheDocument();
  });

  it("shows full content when signed in", () => {
    // Mock useAuth to return { isSignedIn: true }
    render(
      <GatedSection title="Use Cases" count={4}>
        <p>Visible content</p>
      </GatedSection>
    );
    expect(screen.getByText("Visible content")).toBeInTheDocument();
    expect(screen.queryByText("Create a free account")).not.toBeInTheDocument();
  });
});
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add agent detail page with SSG/ISR, content gating, and JSON-LD"
```

---

### Task 3.3: Company Profile Page

**Files:**
- Create: `app/companies/[slug]/page.tsx` (server component with ISR)
- Create: `components/company/CompanyHeader.tsx`
- Create: `components/company/CompanyAgentList.tsx`
- Create: `components/company/ClaimProfileButton.tsx` (client component)

**Step 1: Create the page**

Server-rendered page showing company info + all its agents. Includes "Claim this Profile" button if unclaimed.

```typescript
// app/companies/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await fetchQuery(api.companies.getBySlug, { slug });
  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.name} — AI Agents | Orbys360`,
    description: company.description.slice(0, 160),
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = await fetchQuery(api.companies.getBySlug, { slug });
  if (!company) return <div>Company not found</div>;

  const agents = await fetchQuery(api.agents.getByCompany, { company_id: company._id });

  return (
    <main>
      <CompanyHeader company={company} />
      {company.claim_status === "unclaimed" && (
        <ClaimProfileButton companyId={company._id} companySlug={company.slug} />
      )}
      <CompanyAgentList agents={agents} />
    </main>
  );
}

export const revalidate = 3600;
```

**Step 2: Add Organization JSON-LD**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sonata Software",
  "url": "https://www.sonata-software.com",
  "foundingDate": "1986",
  "address": { "@type": "PostalAddress", "addressLocality": "Bangalore, India" }
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add company profile page with agent list and claim button"
```

---

### Task 3.4: Category Listing Pages

**Files:**
- Create: `app/categories/[slug]/page.tsx`

**Step 1: Create category page**

Server-rendered page listing all agents in a given category. Uses the taxonomy constants to resolve slug → category name.

Dynamic metadata: `"Customer Experience AI Agents — Orbys360 Directory"`

**Step 2: Generate static params for all 25 categories**

```typescript
export async function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({
    slug: slugifyCategory(cat),
  }));
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add category listing pages with SSG for all 25 categories"
```

---

### Task 3.5: SEO Infrastructure

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Step 1: Dynamic sitemap**

```typescript
// app/sitemap.ts
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ALL_CATEGORIES, slugifyCategory } from "@/lib/categories";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agents = await fetchQuery(api.agents.listAllSlugs, {});
  const companies = await fetchQuery(api.companies.listAllSlugs, {});

  const agentUrls = agents.map((a) => ({
    url: `https://orbys360.com/agents/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const companyUrls = companies.map((c) => ({
    url: `https://orbys360.com/companies/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryUrls = ALL_CATEGORIES.map((cat) => ({
    url: `https://orbys360.com/categories/${slugifyCategory(cat)}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: "https://orbys360.com", changeFrequency: "daily", priority: 1.0 },
    ...agentUrls,
    ...companyUrls,
    ...categoryUrls,
  ];
}
```

**Step 2: robots.txt**

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://orbys360.com/sitemap.xml",
  };
}
```

**Step 3: Add `listAllSlugs` queries to agents and companies backends**

These are lightweight queries that return only slug + updated_at for sitemap generation.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dynamic sitemap and robots.txt for SEO"
```

---

## Phase 4: Auth & Claim Flow

> **Dependencies:** Phase 3 complete (public pages rendering)
> **Outcome:** Buyer signup, claim profile form, admin claim management — all working end-to-end

### Task 4.1: Clerk Magic Link Configuration

**Files:**
- Create: `app/sign-in/[[...sign-in]]/page.tsx`
- Create: `app/sign-up/[[...sign-up]]/page.tsx`

**Step 1: Configure Clerk for magic link**

In Clerk Dashboard:
- Enable "Email link" (magic link) as a sign-in method
- Optionally disable password sign-in
- Configure redirect URLs

**Step 2: Create sign-in and sign-up pages**

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn afterSignInUrl="/" />
    </div>
  );
}
```

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp afterSignUpUrl="/onboarding" />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Clerk magic link sign-in and sign-up pages"
```

---

### Task 4.2: Buyer Onboarding

**Files:**
- Create: `app/onboarding/page.tsx` (client component)
- Create: `components/onboarding/BuyerOnboardingForm.tsx`

**Step 1: Create buyer onboarding form**

After Clerk signup, redirect to `/onboarding` where we collect: name, work email (pre-filled from Clerk), company name, job title. On submit, creates `buyerProfile` in Convex.

**Step 2: Add route guard**

If user already has a buyerProfile, redirect to `/`.

**Step 3: Write tests**

Test that form submits and creates profile, test validation, test redirect if profile exists.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add buyer onboarding form with lean data collection"
```

---

### Task 4.3: Claim Profile Form

**Files:**
- Create: `app/claim/[slug]/page.tsx`
- Create: `components/claim/ClaimForm.tsx` (client component)
- Create: `lib/email-validation.ts`

**Step 1: Create email validation utility**

```typescript
// lib/email-validation.ts
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com", "yahoo.co.uk",
  "yahoo.co.in", "rediffmail.com", "msn.com",
]);

export function isFreeEmailProvider(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !domain || FREE_EMAIL_DOMAINS.has(domain);
}
```

**Step 2: Create claim form page**

Page at `/claim/[company-slug]` shows company name + claim form (name, company email, LinkedIn URL). Client-side email validation + server-side in mutation.

**Step 3: Create ClaimForm component**

Uses react-hook-form + zod validation. On submit, calls `api.claims.submitClaim`. Shows success message after submission.

**Step 4: Write tests**

```typescript
describe("ClaimForm", () => {
  it("rejects free email providers", async () => {
    // Fill form with gmail.com email, submit
    // Expect validation error
  });

  it("accepts corporate email", async () => {
    // Fill form with company email, submit
    // Expect success
  });
});

describe("isFreeEmailProvider", () => {
  it("returns true for gmail", () => {
    expect(isFreeEmailProvider("user@gmail.com")).toBe(true);
  });
  it("returns false for corporate email", () => {
    expect(isFreeEmailProvider("user@sonata-software.com")).toBe(false);
  });
});
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add claim profile form with email domain validation"
```

---

## Phase 5: Provider Dashboard

> **Dependencies:** Phase 4 complete (claim flow working)
> **Outcome:** Claimed providers can view and edit their company profile and agents via dashboard

### Task 5.1: Provider Dashboard Layout

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `components/dashboard/DashboardNav.tsx`

**Step 1: Create dashboard layout with tab navigation**

Three tabs: Profile, Agents, Team. Layout checks for company membership and redirects if user isn't a member of any company.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add provider dashboard layout with Profile/Agents/Team tabs"
```

---

### Task 5.2: Profile Tab

**Files:**
- Create: `components/dashboard/ProfileTab.tsx`
- Create: `components/dashboard/InlineEditField.tsx`

**Step 1: Create ProfileTab**

Displays company profile fields (pre-populated from scraped data). Each field has an "Edit" button. Clicking triggers inline edit mode. On save, creates a `companyEdit` request (pending admin approval).

**Step 2: Create InlineEditField reusable component**

A field that toggles between read-only display and edit mode. Shows "Pending approval" badge if there's a pending edit for that field.

**Step 3: Write tests**

Test read-only rendering, edit mode toggle, form submission creates edit request.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add provider dashboard Profile tab with inline editing"
```

---

### Task 5.3: Agents Tab

**Files:**
- Create: `components/dashboard/AgentsTab.tsx`
- Create: `components/dashboard/AgentEditorView.tsx`
- Create: `app/dashboard/agents/[slug]/page.tsx`

**Step 1: Create AgentsTab**

Lists all agents under the provider's company. Each agent is a clickable card that links to `/dashboard/agents/[slug]`.

**Step 2: Create AgentEditorView**

Mirrors the marketplace detail page layout but with an "Edit" button at the bottom. Clicking opens inline editing for all fields. On save, creates an `agentEdit` request.

**Step 3: Add "Add New Agent" button**

Opens a form to submit a new agent (`agentSubmission` — pending admin approval).

**Step 4: Write tests**

Test agent list rendering, editor view, edit submission.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add provider dashboard Agents tab with editor view and edit requests"
```

---

### Task 5.4: Team Tab

**Files:**
- Create: `components/dashboard/TeamTab.tsx`

**Step 1: Create TeamTab**

Shows current company members (name, email, role). Owner sees "Invite Member" button. Opens a simple email input. On submit, calls `companyMembers.inviteMember`.

**Step 2: Owner can remove members** (except themselves)

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add provider dashboard Team tab with invite/remove member"
```

---

## Phase 6: Admin Dashboard

> **Dependencies:** Phase 4 + 5 complete
> **Outcome:** Admin can manage claim requests, company edits, agent edits, and see directory stats

### Task 6.1: Restructure Admin Dashboard

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/ClaimsTab.tsx`
- Create: `components/admin/CompanyEditsTab.tsx`
- Create: `components/admin/AgentEditsTab.tsx` (migrate from existing)
- Create: `components/admin/DirectoryOverviewTab.tsx`

**Step 1: Create admin layout with 4 tabs**

Tab navigation: Claims | Company Edits | Agent Edits | Directory Overview

**Step 2: Create ClaimsTab**

Lists pending claim requests with: claimant name, email, LinkedIn, company name. Approve/Reject buttons. On approve, triggers `admin.approveClaim`.

**Step 3: Create CompanyEditsTab**

Lists pending company edits with diff view (old value vs. new value). Approve/Reject.

**Step 4: Migrate AgentEditsTab**

Update existing agent edits tab for new schema. Same approve/reject flow.

**Step 5: Create DirectoryOverviewTab**

Dashboard cards: total agents, total companies, claimed %, pending claims, total buyers.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: restructure admin dashboard with claims, edits, and directory overview"
```

---

## Phase 7: Comparison Tool

> **Dependencies:** Phase 3 + 4 complete (directory + buyer auth)
> **Outcome:** Logged-in buyers can compare 2-4 agents side-by-side

### Task 7.1: Compare Tray

**Files:**
- Create: `components/compare/CompareTray.tsx` (client component)
- Create: `components/compare/AddToCompareButton.tsx`
- Create: `hooks/useCompare.ts` (client-side state management)

**Step 1: Create useCompare hook**

Manages compare state in localStorage (persists across page navigations). Stores agent slugs (max 4). Provides add/remove/clear functions.

```typescript
// hooks/useCompare.ts
"use client";
import { useState, useCallback, useEffect } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "orbys360-compare";

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSlugs(JSON.parse(stored));
  }, []);

  const add = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.length >= MAX_COMPARE || prev.includes(slug)) return prev;
      const next = [...prev, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.filter((s) => s !== slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSlugs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { slugs, add, remove, clear, isFull: slugs.length >= MAX_COMPARE };
}
```

**Step 2: Create CompareTray**

Floating bottom bar. Shows selected agents. "Compare Now" button links to `/compare?agents=slug1,slug2`.

**Step 3: Create AddToCompareButton**

Used on AgentCard and AgentDetail. If anonymous, redirects to `/sign-up`. If logged in, adds to compare tray.

**Step 4: Write tests for useCompare hook**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add compare tray with localStorage state management"
```

---

### Task 7.2: Comparison Page

**Files:**
- Create: `app/compare/page.tsx` (client component, requires auth)
- Create: `components/compare/ComparisonTable.tsx`

**Step 1: Create comparison page**

Reads `agents` from URL search params. Fetches agent data. Renders side-by-side table.

**Step 2: Create ComparisonTable**

Rows: description, functional categories, industry categories, use cases, integrations, expected outcomes. Columns: one per agent (2-4). Highlight differences.

**Step 3: Write tests**

Test table rendering, difference highlighting, shareable URL generation.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add agent comparison page with side-by-side table"
```

---

## Phase 8: Shortlisting

> **Dependencies:** Phase 4 complete (buyer auth)
> **Outcome:** Buyers can shortlist agents and view their shortlist

### Task 8.1: Shortlist Feature

**Files:**
- Create: `components/shared/ShortlistButton.tsx`
- Create: `app/shortlist/page.tsx`
- Create: `hooks/useShortlist.ts`
- Modify: `convex/agents.ts` (add shortlist mutations)

**Step 1: Add shortlist backend**

```typescript
// In convex/agents.ts or new convex/shortlists.ts

export const addToShortlist = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const userId = await requireAuth(ctx);
    // Check if already shortlisted
    const existing = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userAndAgent", (q) =>
        q.eq("user_id", userId).eq("agent_id", agent_id)
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("agentShortlists", {
      user_id: userId,
      agent_id,
      created_at: Date.now(),
    });
  },
});

export const removeFromShortlist = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userAndAgent", (q) =>
        q.eq("user_id", userId).eq("agent_id", agent_id)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getMyShortlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const shortlists = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
    const agents = await Promise.all(
      shortlists.map((s) => ctx.db.get(s.agent_id))
    );
    return agents.filter(Boolean);
  },
});
```

**Step 2: Create ShortlistButton component**

Heart/bookmark icon. Toggles shortlist state. Requires login.

**Step 3: Create shortlist page**

Grid of shortlisted agents with remove buttons.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add shortlisting with backend mutations and shortlist page"
```

---

## Phase 9: Content Page Migration

> **Dependencies:** Phase 1 complete (Next.js running)
> **Outcome:** All existing content pages (AI Pulse, Benchmarks, Thoughtbook, Use Cases) migrated to Next.js

### Task 9.1: Migrate AI Pulse Pages

**Files:**
- Create: `app/ai-pulse/page.tsx`
- Create: `app/ai-pulse/[slug]/page.tsx`
- Move: `src/data/aiPulseBriefs.ts` → `data/aiPulseBriefs.ts`
- Move: `src/data/aiPulseTypes.ts` → `data/aiPulseTypes.ts`
- Move: related components

**Step 1: Convert to Next.js pages**

These are static pages. Use `generateStaticParams` for all brief slugs.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: migrate AI Pulse pages to Next.js with SSG"
```

---

### Task 9.2: Migrate Remaining Content Pages

**Files:**
- Create: `app/benchmarks/page.tsx`
- Create: `app/agentic-ai/page.tsx`
- Create: `app/use-cases/page.tsx`
- Create: `app/use-cases/[slug]/page.tsx`

**Step 1: Convert each content page**

Migrate component-by-component. Replace React Router with Next.js routing. Add SEO metadata.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: migrate Benchmarks, Thoughtbook, and Use Cases pages to Next.js"
```

---

## Phase 10: Cleanup & Polish

> **Dependencies:** All previous phases
> **Outcome:** Remove old code, verify everything works, deploy

### Task 10.1: Remove Old Vite Code

**Files:**
- Delete: `src/` directory (all migrated)
- Delete: `index.html`
- Delete: `vite.config.ts`
- Clean up: `package.json` (remove unused deps)
- Delete: deprecated Convex functions (old provider/TSP/problem code)

**Step 1: Remove old files**

Only after verifying all functionality has been migrated.

**Step 2: Remove deprecated Convex tables from schema**

Remove `providerProfiles`, `tspSubmissions`, `startupSubmissions`, `tspEdits`, `problemStatements`, `problemStatementInterests`, `gccQuota`, `providerRequests`.

**Step 3: Run full build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove Vite code and deprecated Convex tables after Next.js migration"
```

---

### Task 10.2: End-to-End Verification

**Step 1: Test all public pages**

- Homepage loads with agent directory
- Agent detail page renders with gated content
- Company page shows agent list + claim button
- Category pages list correct agents
- Sitemap returns valid XML
- Content pages render correctly

**Step 2: Test auth flows**

- Buyer signup → onboarding → full access
- Claim profile → admin approval → provider login → dashboard

**Step 3: Test provider dashboard**

- Profile tab: view and edit
- Agents tab: view and edit
- Team tab: invite and remove

**Step 4: Test admin dashboard**

- Claims tab: approve/reject
- Company edits: approve/reject
- Agent edits: approve/reject
- Overview: stats display

**Step 5: Test comparison tool**

- Add agents to compare tray
- Compare page renders
- Shareable URL works

**Step 6: Verify SEO**

- View page source for SSR content
- Check meta tags, OG tags
- Validate JSON-LD
- Check sitemap

**Step 7: Commit final state**

```bash
git add -A
git commit -m "chore: verify all features working end-to-end after migration"
```

---

## Dependency Graph

```
Phase 1 (Next.js Setup)
  ↓
Phase 2 (Schema & Backend) ← can start some tasks in parallel with Phase 1.2/1.3
  ↓
Phase 3 (Public Directory) ← requires Phase 2 schema
  ↓
Phase 4 (Auth & Claim) ← requires Phase 3 pages + Phase 2 backend
  ↓
Phase 5 (Provider Dashboard) ← requires Phase 4 auth
  ↓
Phase 6 (Admin Dashboard) ← requires Phase 4 + 5
  ↓
Phase 7 (Compare Tool) ← requires Phase 3 + Phase 4
  ↓
Phase 8 (Shortlisting) ← requires Phase 4
  ↓
Phase 9 (Content Migration) ← requires Phase 1 (can run in parallel with Phases 3-8)
  ↓
Phase 10 (Cleanup) ← requires all phases
```

## Notes for the Implementing Engineer

1. **Run `npx convex dev` in a separate terminal** throughout development — it watches for schema/function changes and syncs them.
2. **Test with `npm test`** using Vitest. Write tests before implementation (TDD).
3. **Use the `frontend-design` skill** for all UI component design decisions.
4. **Commit after each task** — small, focused commits.
5. **The seed script (Task 2.9) can only be run** once the user provides the scraped JSON data. Build it, test with sample data, then run with real data later.
6. **Clerk magic link** must be configured in the Clerk dashboard (not code). The code just uses `<SignIn />` and `<SignUp />` components.
7. **ISR revalidation** — use `revalidate = 3600` (1 hour) for agent/company pages. Can adjust based on how often data changes.
