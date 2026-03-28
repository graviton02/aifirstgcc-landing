# Orbys360 — Project Instructions

> **Last updated:** 2026-03-11

## Project Overview

**Orbys360** is an AI-first GCC advisory platform with a directory of AI agents, company profiles, and tools for GCC buyers and providers. Deployed on **Vercel** from the `main` branch.

- **Stack:** Next.js 15 (App Router), TypeScript, Convex (backend), Clerk (auth), Tailwind CSS 3.4, Framer Motion
- **Package manager:** npm
- **Build:** `npm run build` (runs `next build`)
- **Dev server:** `npm run dev` (Next.js) + `npx convex dev` (Convex, separate terminal)
- **Lint:** `npm run lint`
- **Test:** `npm test` (Vitest + React Testing Library)
- **Deployment:** Vercel (auto-deploy from `main`)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (Clerk + Convex providers)
│   │   ├── page.tsx            # Landing page
│   │   ├── directory/          # Agent directory
│   │   ├── agents/[slug]/      # Agent detail (SSR + ISR)
│   │   ├── companies/[slug]/   # Company profiles (SSR + ISR)
│   │   ├── categories/[slug]/  # Category pages
│   │   ├── claim/[slug]/       # Claim profile flow
│   │   ├── compare/            # Compare tool
│   │   ├── shortlist/          # Shortlisted agents
│   │   ├── gcc-dashboard/      # GCC buyer dashboard
│   │   ├── dashboard/          # Provider dashboard
│   │   ├── admin/              # Admin dashboard
│   │   ├── onboarding/         # GCC onboarding
│   │   ├── sign-in/            # Clerk sign-in
│   │   ├── sign-up/            # Clerk sign-up
│   │   └── [content pages]/    # AI Pulse, Thought Leadership, etc.
│   ├── components/
│   │   ├── sections/           # Landing page sections
│   │   ├── shared/             # Reusable (Navbar, Footer, Container)
│   │   ├── ui/                 # Shadcn-style UI primitives
│   │   ├── directory/          # Directory components
│   │   ├── agent-detail/       # Agent detail components
│   │   ├── company/            # Company profile components
│   │   ├── claim/              # Claim flow components
│   │   ├── compare/            # Compare tool components
│   │   ├── dashboard/          # Provider dashboard tabs
│   │   ├── gcc-dashboard/      # GCC dashboard tabs
│   │   ├── admin/              # Admin dashboard tabs
│   │   └── onboarding/         # Onboarding form
│   ├── hooks/                  # Custom hooks (useCompare, etc.)
│   ├── lib/                    # Utilities (categories, email-validation, etc.)
│   └── auth/                   # useUserRole hook
├── convex/                     # Convex backend (schema, queries, mutations)
├── data/seed/                  # Seed data (companies.json, agents.json)
├── scripts/                    # Seed scripts, utilities
├── tests/                      # Vitest tests
├── docs/                       # Documentation
│   ├── plans/                  # Implementation plans
│   ├── archive/                # Old planning docs, marketing materials
│   ├── dogfood-credentials.md  # QA test credentials
│   └── uat-provider-journey.md # Provider UAT flow
├── middleware.ts               # Clerk auth middleware
└── public/                     # Static assets (logos, images)
```

## Git Branching Strategy

| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Production-ready code | Vercel (auto) |
| `develop` | Integration branch for features | — |

### Workflow Rules

1. **Features** → branch off `develop`, merge back when ready.
2. **Production releases** → merge `develop` into `main`.
3. **Never force-push to `main`**.

## Key Conventions

- **Next.js App Router** — `src/app/` for routes, `"use client"` for interactive components.
- **Convex** for all backend operations — `useQuery()` / `useMutation()` from `convex/react`.
- **Clerk** for auth — `@clerk/nextjs`, middleware protects dashboard routes.
- **Tailwind CSS** for all styling. No CSS modules or inline styles.
- **Framer Motion** for animations.
- **Vitest + React Testing Library** for tests. TDD required.
- Server-rendered detail pages use `fetchQuery` from `convex/nextjs` with ISR (`revalidate = 3600`).
- Admin dashboard uses password-based token auth (not Clerk roles).
- All company/agent edits go through admin review (pending → approved workflow).

## Data Seeding

All directory data (agents, companies) lives in `data/seed/` as JSON files and is seeded into Convex.

- **Seed files:** `data/seed/companies.json` (78 companies), `data/seed/agents.json` (231 agents)
- **Batch files:** `data/seed/batch-*.json` — same data split into 26 batches (for reference only; main files are the source of truth)
- **Seed script:** `npx tsx scripts/seed.ts` — reads JSON + logo files, calls Convex seed mutations
- **Seed mutations:** `convex/companies.ts:seed`, `convex/agents.ts:seed` — idempotent (skip existing slugs)
- **Company logos:** `public/logos/companies/{slug}.{svg|png|webp|jpg}` — referenced via `logo_url` field
- **Integration logos:** `public/logos/integrations/{slug}.svg` — Simple Icons SVGs

### Adding New Data

1. Add new companies/agents to `data/seed/companies.json` and `data/seed/agents.json`
2. Download company logos to `public/logos/companies/` (slug-named, prefer SVG/PNG with transparent bg)
3. Run `npx tsx scripts/seed.ts` — existing records are skipped, only new ones are inserted
4. New pages are auto-generated via ISR + `generateStaticParams`

### Data Schema

**Company fields:** `slug`, `name`, `website`, `headquarters`, `founded`, `company_size`, `description`, `primary_verticals[]`, `contact_email?`, `verification_status`, `logo_url?`

**Agent fields:** `slug`, `agent_name`, `company_slug` → `company_id`, `tagline`, `description`, `category`, `functional_categories[]`, `industry_categories[]`, `use_cases[{title, description}]`, `expected_outcomes[]`, `integrations[]`, `source_url`

## Programmatic SEO

Every public page must be optimized for search engine discovery. Follow these conventions:

### Required for All Dynamic Pages (agents, companies, categories)

1. **`generateMetadata`** — dynamic title + description, Open Graph tags, Twitter Cards
2. **`generateStaticParams`** — pre-render all pages at build time (SSG via Convex `listAllSlugs`)
3. **JSON-LD structured data** — injected via `<script type="application/ld+json">`
   - Agent pages: `SoftwareApplication` schema
   - Company pages: `Organization` schema
   - Category pages: `CollectionPage` schema
   - All pages: `BreadcrumbList` schema
4. **Canonical URLs** — set in metadata to prevent duplicate content
5. **Breadcrumbs** — visible `<Breadcrumbs>` component + BreadcrumbList JSON-LD
6. **ISR** — `export const revalidate = 3600` on all dynamic pages

### SEO Utilities

- `src/lib/json-ld.ts` — builder functions for structured data schemas
- `src/components/shared/Breadcrumbs.tsx` — reusable breadcrumb navigation

### Metadata Pattern

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchQuery(api.resource.getBySlug, { slug });
  const url = `${BASE_URL}/resource/${slug}`;
  return {
    title: `${data.name} | Orbys360`,
    description: data.description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Orbys360" },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

## Environment Variables

See `.env.example` for required variables. Key ones:
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `CONVEX_DEPLOYMENT` — Convex deployment name

Never commit `.env` or `.env.local` files.

## Dogfooding / QA Testing

When running dogfood or QA tests locally:

- **App URL:** `http://localhost:3000`
- **Dev server:** `npm run dev` (Next.js) — assumed running
- **Convex backend:** `npx convex dev` — assumed running in a separate terminal
- **Admin dashboard password:** `360orybs@ai.com`
- **Test credentials file:** `docs/dogfood-credentials.md` — contains test accounts, companies, and flow data

### Test Flows

| Flow | Entry Point | Key Pages |
|------|-------------|-----------|
| Claim profile | `/companies/{slug}` → "Claim" button | `/claim/{slug}` → `/claim/activate?token=...` → `/onboarding` → `/dashboard` |
| Admin review | `/admin` (password login) | Claims tab → Approve/Reject |
| GCC onboarding | `/sign-up` → `/onboarding` | Role selector → GCC form → `/gcc-dashboard` |
| Directory browse | `/directory` | `/agents/{slug}`, `/companies/{slug}`, `/categories/{slug}` |

## Admin Utilities

One-time and reusable admin mutations in the codebase:

| Mutation | File | Purpose | How to run |
|----------|------|---------|------------|
| `agents:adminCleanup` | `convex/agents.ts` | Unclaim companies (reset claim_status, delete memberships, reject claims) and/or fully delete test companies with all related data | `npx convex run agents:adminCleanup '{"unclaimSlugs": ["slug1"], "deleteSlugs": ["slug2"]}'` |
| `agents:fixAgentTextFields` | `convex/agents.ts` | Capitalize first letter and strip trailing punctuation from all agent use case titles and expected outcomes | `npx convex run agents:fixAgentTextFields` |
| `admin:listClaimedCompanies` | `convex/admin.ts` | List all companies with non-unclaimed status (requires admin session token) | Via admin dashboard or Convex dashboard |
| `admin:unclaimCompany` | `convex/admin.ts` | Unclaim a single company by ID (requires admin session token) | Via admin dashboard or Convex dashboard |

---

*This file is a living document. Update it when architecture, conventions, or workflows change.*
