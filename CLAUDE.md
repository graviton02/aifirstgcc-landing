# Orbys360 Landing Page — Project Instructions

> **Last updated:** 2026-02-11

## Project Overview

**Orbys360** (repo: `aifirstgcc-landing`) is a React + TypeScript landing page for an AI-first GCC advisory platform. It is deployed on **Vercel** from the `main` branch with automatic deployments on push.

- **Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Supabase
- **Package manager:** npm
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Dev server:** `npm run dev`
- **Lint:** `npm run lint`
- **Deployment:** Vercel (auto-deploy from `main`), SPA rewrite via `vercel.json`

## Project Structure

```
├── src/
│   ├── App.tsx              # Root app component
│   ├── main.tsx             # Entry point
│   ├── components/
│   │   ├── sections/        # Landing page sections
│   │   ├── pages/           # Full page components
│   │   ├── shared/          # Reusable components
│   │   ├── ui/              # Shadcn-style UI primitives
│   │   └── ai-pulse/        # AI Pulse daily brief components
│   ├── data/
│   │   ├── aiPulseBriefs.ts # Daily brief content entries
│   │   └── aiPulseTypes.ts  # TypeScript types for briefs
│   └── lib/                 # Utilities
├── public/                  # Static assets (logos, images, favicons)
├── supabase/migrations/     # Supabase database migrations
├── Icons/                   # Brand icon assets
└── Orbis360 Transparent Icons/
```

## Git Branching Strategy

Established 2026-02-11. Two long-lived branches:

| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Production-ready content. Daily briefs, copy, styling. | Vercel (auto) |
| `develop` | Integration branch for new features and backend work. | — |

### Workflow Rules

1. **Landing page content** (daily briefs, copy changes, styling tweaks) → commit directly to `main` and push.
2. **New features / backend work** → branch off `develop`:
   ```
   git checkout -b feature/<name> develop
   # ... work ...
   git checkout develop && git merge feature/<name>
   ```
3. **Releasing features to production** → merge `develop` into `main` when stable.
4. **Never force-push to `main`** — it is the production branch.

### Branch Protection Notes

- `main` auto-deploys to Vercel. Every push is live.
- Test and verify changes before merging to `main`.

## Content Patterns

### Adding a Daily Brief

Daily briefs live in `src/data/aiPulseBriefs.ts`. Each entry follows the types in `src/data/aiPulseTypes.ts`. Add new entries at the top of the array (newest first). Commit to `main` with message format:
```
Add <Mon Day> daily brief: <topic1>, <topic2>, <topic3>
```

## Key Conventions

- Use TypeScript strictly — the build runs `tsc -b` before bundling.
- Tailwind for all styling; avoid inline styles or CSS modules.
- Framer Motion for animations.
- Shadcn-style UI components in `src/components/ui/`.
- Supabase for backend (email signups, future features).
- Vercel Analytics enabled via `@vercel/analytics`.

## Environment Variables

See `.env.example` for required variables. Never commit `.env` files.

---

*This file is a living document. Update it whenever branching strategy, project structure, conventions, or workflows change.*
