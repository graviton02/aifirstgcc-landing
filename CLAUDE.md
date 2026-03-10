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
├── tests/                      # Vitest tests
├── middleware.ts               # Clerk auth middleware
├── public/                     # Static assets
└── docs/plans/                 # Implementation plans
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

## Environment Variables

See `.env.example` for required variables. Key ones:
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `CONVEX_DEPLOYMENT` — Convex deployment name

Never commit `.env` or `.env.local` files.

---

*This file is a living document. Update it when architecture, conventions, or workflows change.*
