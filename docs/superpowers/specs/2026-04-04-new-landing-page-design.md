# New Landing Page Design Spec

> **Date:** 2026-04-04
> **Status:** Approved

## Overview

Replace the current content-heavy landing page with a focused, product-led page. The current landing page content moves to a new About Us page (minus the Interest Capture/email signup form, which is removed entirely).

### Goals

1. **Primary:** Get visitors to search/browse the agent directory
2. **Secondary:** Help first-time visitors understand what Orbys360 is
3. **Audience split:** 70% GCC buyers / 30% providers

### Visual Direction

Mixed — dark hero for impact, light sections below for readability.

---

## Page Structure

```
┌─────────────────────────────────────┐
│  Navbar                             │
├─────────────────────────────────────┤
│  Section 1: Hero (Dark)             │
├─────────────────────────────────────┤
│  Section 2: Search + Features (Light)│
├─────────────────────────────────────┤
│  Section 3: How It Works (Light)    │
├─────────────────────────────────────┤
│  Section 4: Social Proof (Dark)     │
├─────────────────────────────────────┤
│  Section 5: For Providers (Light)   │
├─────────────────────────────────────┤
│  Section 6: Footer                  │
└─────────────────────────────────────┘
```

---

## Section Details

### Section 1: Hero (Dark Background)

- **Headline:** "Find the Right AI Agent for Your Enterprise"
- **Subtext:** "The curated directory of 500+ AI agents built for Global Capability Centers"
- **CTA Button:** "Explore the Directory" → links to `/directory`
- **Background:** Dark with subtle gradient/mesh effect (consistent with current brand aesthetic)
- **Layout:** Centered text, vertically stacked — headline, subtext, CTA

### Section 2: Search + Features (Light Background)

**Search Bar:**
- Functional search input
- Animated placeholder cycling through examples (e.g., "Try 'customer experience'...", "Try 'IT operations'...", "Try 'data analytics'...")
- Submitting redirects to `/directory?q={query}`

**Category Pills:**
- Horizontal row of clickable category tags below the search bar
- Categories: Customer Experience, IT Operations, Sales & Marketing, Data & Analytics, Operations, HR & Talent (subset of main categories)
- Each links to `/directory?category={slug}`

**Four Feature Boxes:**
- Displayed in a single row (4 columns on desktop, 2x2 on mobile)
- Informational labels only — not clickable
- Content:
  1. **500+ AI Agents, One Search**
  2. **Compare Before You Commit**
  3. **Your Evaluation Pipeline**
  4. **Skip the Sales Maze**

### Section 3: How It Works (Light Background)

Three steps displayed horizontally with icons:

1. **Search** — Browse 500+ AI agents by function, industry, or use case
2. **Compare** — Stack agents side by side on integrations, outcomes, and fit
3. **Connect** — Reach verified providers directly for demos and pilots

Simple layout: icon + step number + title + one-line description. Visual connector (line or arrow) between steps.

### Section 4: Social Proof (Dark Background)

Four stat cards in a single row:

| Stat | Label |
|------|-------|
| 1,700+ | GCCs in India |
| 2.1M | GCC professionals |
| $64.6B | Annual GCC revenue |
| 11% | CAGR over 5 years |

Dark background for contrast with the light sections above and below.

### Section 5: For Providers (Light Background)

Compact section — the 30% provider pitch.

- **Headline:** "Built for Providers Too"
- **3-4 value props** displayed as short bullet points or small cards:
  - Direct access to GCC buyers actively funding AI programs
  - Enterprise credibility through curated positioning
  - Faster go-to-market with reduced sales cycles
  - From custom projects to repeatable revenue
- **CTA:** "List Your Agent" → links to `/sign-up`

### Section 6: Footer

Existing footer component — no changes needed.

---

## What Moves to About Us

The current landing page (`src/app/page.tsx`) becomes the About Us page at `/about`. All existing sections move there as-is, except:

- **Remove:** `InterestCapture` (email signup form) — deleted entirely
- **Remove from About Us:** `AgentSearchSection` — search functionality lives on the new landing page and directory page; redundant on About Us
- **Keep:** Hero (reworded as an "About" intro), ValueProposition, SevenMandates, EnterprisesSection, ProvidersSection, EarlyMemberBenefits, SocialProof, WhySection, Footer

The About Us page needs a new route at `src/app/about/page.tsx`.

---

## Navigation Updates

- "Agent Directory" tab already updated (done this session)
- About Us dropdown in navbar should include a link to `/about` if not already present

---

## Technical Notes

- All new sections are client components (`"use client"`) where interactivity is needed (search bar, animated placeholders)
- Search bar uses existing directory search logic — redirect to `/directory?q={query}`
- Category pills use existing category slugs from `src/lib/categories.ts`
- Social Proof stats can be reused from the existing `SocialProof` component or extracted
- Feature boxes are static — no data fetching needed
- Use Tailwind CSS for all styling, Framer Motion for animations
- Use the `frontend-design` skill for implementation
