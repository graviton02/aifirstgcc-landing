# New Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current content-heavy landing page with a focused, product-led page that drives visitors to the agent directory, and move the existing content to an About Us page.

**Architecture:** Six new section components for the landing page (hero, search+features, how-it-works, social-proof-dark, providers, footer reused). The current `page.tsx` content moves to `src/app/about/page.tsx`. The navbar's About Us dropdown changes from scroll-to-section to link to `/about`. Use the `frontend-design` skill for all component creation.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React icons, `@paper-design/shaders-react` (MeshGradient)

**Spec:** `docs/superpowers/specs/2026-04-04-new-landing-page-design.md`

---

### Task 1: Create the About Us page

Move the current landing page content to `/about` before we replace the landing page.

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Create the About Us page**

Create `src/app/about/page.tsx` with the existing landing page sections (minus `InterestCapture` and `AgentSearchSection`):

```tsx
import { Hero } from "@/components/sections/Hero";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { SevenMandates } from "@/components/sections/SevenMandates";
import { EnterprisesSection } from "@/components/sections/EnterprisesSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { EarlyMemberBenefits } from "@/components/sections/EarlyMemberBenefits";
import { SocialProof } from "@/components/sections/SocialProof";
import { WhySection } from "@/components/sections/WhySection";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Orbys360",
  description:
    "Orbys360 is the AI-first GCC advisory platform — shaping the next generation of Global Capability Centers with strategy, frameworks, and intelligent workflows.",
  alternates: { canonical: "https://www.orbys360.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ValueProposition />
      <SevenMandates />
      <EnterprisesSection />
      <ProvidersSection />
      <EarlyMemberBenefits />
      <SocialProof />
      <WhySection />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify the About Us page renders**

Run: `npm run dev`

Open `http://localhost:3000/about` in a browser. Confirm all sections render correctly (Hero, ValueProposition, SevenMandates, EnterprisesSection, ProvidersSection, EarlyMemberBenefits, SocialProof, WhySection). Confirm InterestCapture and AgentSearchSection are NOT present.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: create About Us page with existing landing page content"
```

---

### Task 2: Update the Navbar — About Us dropdown links to /about

The About Us dropdown currently scrolls to sections on the landing page. Change it to link to `/about` with anchor fragments.

**Files:**
- Modify: `src/components/shared/Navbar.tsx`

- [ ] **Step 1: Update aboutItems to use href links instead of scroll IDs**

In `src/components/shared/Navbar.tsx`, change the `aboutItems` array (around line 33) from scroll IDs to hrefs:

```tsx
// Replace this:
const aboutItems = [
  { id: 'value', label: 'Why Orbys360' },
  { id: 'enterprises', label: 'For Enterprises' },
  { id: 'providers', label: 'For Partners' },
  { id: 'benefits', label: 'Benefits' },
]

// With this:
const aboutItems = [
  { href: '/about', label: 'About Orbys360' },
  { href: '/about#value', label: 'Why Orbys360' },
  { href: '/about#enterprises', label: 'For Enterprises' },
  { href: '/about#providers', label: 'For Partners' },
  { href: '/about#benefits', label: 'Benefits' },
]
```

- [ ] **Step 2: Update desktop dropdown to use Link instead of button+scrollToSection**

In the desktop About Us dropdown (around line 155-165), replace the button-based items with Link-based items:

```tsx
// Replace the button elements inside the dropdown:
{aboutItems.map((item) => (
  <Link
    key={item.href}
    href={item.href}
    onClick={() => setIsAboutOpen(false)}
    className="flex items-center w-full px-4 py-2.5 text-sm text-enterprise-700 hover:bg-enterprise-50 hover:text-enterprise-900 transition-colors"
  >
    {item.label}
  </Link>
))}
```

- [ ] **Step 3: Update mobile About Us section similarly**

Find the mobile About Us section (search for `isMobileAboutOpen` in the file) and update those buttons to use Link with the same `aboutItems` hrefs pattern. Each item should use `<Link>` and call `setIsMobileMenuOpen(false)` on click.

- [ ] **Step 4: Clean up unused scrollToSection function if no longer needed**

Check if `scrollToSection` is used anywhere else in the Navbar. If only the About Us dropdown used it, remove the function. If the mobile menu also uses it for other items, keep it.

- [ ] **Step 5: Verify navigation works**

Run the dev server. Click each item in the About Us dropdown — they should navigate to `/about` (or `/about#section`). Verify both desktop and mobile menu.

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/Navbar.tsx
git commit -m "feat: update About Us nav to link to /about page"
```

---

### Task 3: Build the new landing page — Hero section

Use the `frontend-design` skill. Create a dark hero with centered headline, subtext, and CTA.

**Files:**
- Create: `src/components/sections/NewHero.tsx`

- [ ] **Step 1: Create the NewHero component**

Create `src/components/sections/NewHero.tsx` using the `frontend-design` skill with this brief:

> Build a full-screen dark hero section for Orbys360, an AI agent directory for Global Capability Centers.
>
> **Content:**
> - Headline: "Find the Right AI Agent for Your Enterprise"
> - Subtext: "The curated directory of 500+ AI agents built for Global Capability Centers"
> - CTA button: "Explore the Directory" → links to /directory
>
> **Design requirements:**
> - Use the existing `MeshGradient` from `@paper-design/shaders-react` as background (colors: `['#B3A4E8', '#241D9A', '#B36FFF', '#9E4FD2']`, speed: 0.66, scale: 1, distortion: 0.68, swirl: 0.29)
> - Dark gradient overlay for text readability: `bg-gradient-to-b from-enterprise-950/30 via-transparent to-enterprise-950/60`
> - Grid pattern overlay at low opacity for texture
> - White text, centered layout
> - Headline: `font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold`
> - Subtext: `text-lg md:text-xl text-white/80 max-w-2xl mx-auto`
> - CTA: gradient button `bg-gradient-to-r from-blue-600 to-purple-600` with ArrowRight icon, using the existing `Button` component from `@/components/ui/button` and `Link` from `next/link`
> - Staggered Framer Motion entrance animations (fadeIn + slideUp)
> - Use `Container` from `@/components/shared/Container`
> - Full viewport height: `min-h-screen flex items-center justify-center`
> - `"use client"` directive
>
> **Reference the existing Hero.tsx pattern** at `src/components/sections/Hero.tsx` for styling conventions, but with the new content. Do NOT include the "Coming Soon" badge or the "Join as Provider" secondary CTA.

- [ ] **Step 2: Verify the hero renders in isolation**

Temporarily import `NewHero` in the current `page.tsx` to verify it renders. Check that the MeshGradient background, text, and CTA button all display correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/NewHero.tsx
git commit -m "feat: add new landing page hero section"
```

---

### Task 4: Build the Search + Features section

Use the `frontend-design` skill. Search bar with animated placeholder, category pills, and four feature boxes.

**Files:**
- Create: `src/components/sections/SearchAndFeatures.tsx`

- [ ] **Step 1: Create the SearchAndFeatures component**

Create `src/components/sections/SearchAndFeatures.tsx` using the `frontend-design` skill with this brief:

> Build a search + features section for Orbys360's landing page. Light background.
>
> **Search Bar:**
> - Functional search form using `useState` + `useRouter` from `next/navigation`
> - On submit, redirect to `/directory?search=${encodeURIComponent(query)}`
> - Search icon (from `lucide-react`) positioned inside the input on the left
> - "Search" button inside the input on the right
> - Animated placeholder that cycles through these phrases every 3 seconds with a fade transition: "Try 'customer experience'...", "Try 'IT operations'...", "Try 'data analytics'...", "Try 'sales & marketing'...", "Try 'HR & workforce'..."
> - Input styling: `w-full pl-12 pr-32 py-4 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-card text-lg`
> - Max width: `max-w-2xl mx-auto`
>
> **Category Pills:**
> - Horizontal row of clickable pills centered below the search bar, with 12px gap
> - Categories (use these exact names and link to `/directory?search=${encodeURIComponent(name)}`):
>   - Customer Experience
>   - IT Operations
>   - Sales & Marketing
>   - Data & Analytics
>   - Operations & Supply Chain
>   - HR & Workforce
> - Pill styling: `px-4 py-2 rounded-full text-sm font-medium border border-enterprise-200 text-enterprise-600 hover:bg-enterprise-50 hover:border-purple-300 hover:text-purple-700 transition-colors`
> - Use `Link` from `next/link`
> - Wrap in flex with `flex-wrap justify-center gap-3 mt-6`
>
> **Four Feature Boxes:**
> - Single row on desktop (grid-cols-4), 2x2 on mobile (grid-cols-2)
> - Informational labels only — NOT clickable
> - Each box: icon + one-line text, centered
> - Content with icons from lucide-react:
>   1. Search icon → "500+ AI Agents, One Search"
>   2. GitCompareArrows icon → "Compare Before You Commit"
>   3. ListChecks icon → "Your Evaluation Pipeline"
>   4. Zap icon → "Skip the Sales Maze"
> - Box styling: `p-6 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center`
> - Icon: `w-8 h-8 text-purple-600 mx-auto mb-3`
> - Text: `text-sm font-semibold text-enterprise-800`
> - Stagger animation on scroll into view using Framer Motion
> - Section margin-top: `mt-12` for feature boxes below search
>
> **Section wrapper:**
> - `py-16 bg-gradient-to-b from-enterprise-50 to-white`
> - Use `Container` from `@/components/shared/Container`
> - `"use client"` directive
>
> **Animated placeholder implementation:**
> Use a `useEffect` with `setInterval` (3000ms) cycling through the placeholder strings. Use a state variable for the current index. Render the placeholder text inside a positioned `<span>` that fades (using Framer Motion `AnimatePresence` + `motion.span` with key={index}). The actual input `placeholder` attribute should be empty — the animated text is visually overlaid and hidden when the user types (check if `searchQuery` is non-empty).

- [ ] **Step 2: Verify the section renders and search works**

Run the dev server. Verify:
- Animated placeholder cycles through phrases
- Typing in search bar hides the animated placeholder
- Submitting redirects to `/directory?search=...`
- Category pills link correctly
- Feature boxes display in 4 columns on desktop, 2x2 on mobile

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SearchAndFeatures.tsx
git commit -m "feat: add search bar + category pills + feature boxes section"
```

---

### Task 5: Build the How It Works section

Use the `frontend-design` skill. Three steps: Search → Compare → Connect.

**Files:**
- Create: `src/components/sections/HowItWorks.tsx`

- [ ] **Step 1: Create the HowItWorks component**

Create `src/components/sections/HowItWorks.tsx` using the `frontend-design` skill with this brief:

> Build a "How It Works" section for Orbys360. Light background.
>
> **Content:**
> - Section heading: "How It Works" (centered)
> - Three steps displayed horizontally on desktop, vertically on mobile
> - Visual connector line/arrow between steps on desktop
>
> Step data:
> 1. Icon: `Search` from lucide-react, Step number: "01", Title: "Search", Description: "Browse 500+ AI agents by function, industry, or use case"
> 2. Icon: `GitCompareArrows` from lucide-react, Step number: "02", Title: "Compare", Description: "Stack agents side by side on integrations, outcomes, and fit"
> 3. Icon: `Handshake` from lucide-react, Step number: "03", Title: "Connect", Description: "Reach verified providers directly for demos and pilots"
>
> **Design:**
> - Each step card: icon in a gradient circle (`bg-gradient-to-br from-purple-500 to-blue-600`, white icon), step number above in small muted text, title in bold, description below
> - Step cards: `p-8 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center`
> - Grid: `grid grid-cols-1 md:grid-cols-3 gap-8`
> - On desktop, add a subtle dashed connector line between cards (use a `border-t-2 border-dashed border-enterprise-200` div positioned between cards, or use pseudo-elements)
> - Section heading: `font-display text-display-sm text-enterprise-900 text-center mb-12`
> - Use `AnimatedSection` from `@/components/shared/AnimatedSection` for scroll-triggered entrance
> - Use `StaggerContainer` + `StaggerItem` for the cards
> - Section: `py-20 bg-white`
> - Use `Container` from `@/components/shared/Container`
> - `"use client"` directive

- [ ] **Step 2: Verify rendering**

Check that the three steps display correctly in both desktop and mobile layouts. Verify the connector lines appear on desktop.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HowItWorks.tsx
git commit -m "feat: add How It Works section"
```

---

### Task 6: Build the Social Proof section (dark variant)

Use the `frontend-design` skill. The existing `SocialProof` component has a white background. We need a dark variant.

**Files:**
- Create: `src/components/sections/SocialProofDark.tsx`

- [ ] **Step 1: Create the SocialProofDark component**

Create `src/components/sections/SocialProofDark.tsx` using the `frontend-design` skill with this brief:

> Build a dark-background Social Proof stats section for Orbys360.
>
> **Content (same stats as existing `src/components/sections/SocialProof.tsx`):**
>
> ```ts
> const stats = [
>   { icon: Building2, value: '1,700+', label: 'GCCs in India alone', color: 'from-blue-500 to-indigo-600' },
>   { icon: Users2, value: '2.1M', label: 'GCC professionals employed', color: 'from-purple-500 to-pink-600' },
>   { icon: Globe2, value: '$64.6B', label: 'Annual GCC revenue', color: 'from-violet-500 to-purple-600' },
>   { icon: TrendingUp, value: '11%', label: 'CAGR over 5 years', color: 'from-emerald-500 to-teal-600' },
> ]
> ```
>
> **Design:**
> - Dark background: `bg-enterprise-950` with a subtle radial gradient overlay
> - Badge: "The GCC Opportunity" — `text-purple-300 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm font-semibold`
> - Heading: "A $64.6 Billion Ecosystem" — white text, `font-display text-display-sm`
> - Subheading: "India hosts 50-55% of the world's GCCs" — `text-white/60`
> - Stat cards: `rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6` — values in white, labels in `text-white/60`
> - Icon: gradient background circle (use the stat's `color` value), white icon
> - Value text: `font-display text-3xl md:text-4xl font-bold text-white`
> - Label text: `text-sm text-white/60`
> - Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`
> - Hover: subtle lift `whileHover={{ y: -4 }}` with `border-white/20` on hover
> - Use `AnimatedSection`, `StaggerContainer`, `StaggerItem` from `@/components/shared/AnimatedSection`
> - Section: `py-20 relative overflow-hidden`
> - Use `Container` from `@/components/shared/Container`
> - `"use client"` directive
> - Icons from `lucide-react`: `Building2, Users2, Globe2, TrendingUp`

- [ ] **Step 2: Verify rendering**

Check the dark section renders with proper contrast. Verify stat values are readable on the dark background.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SocialProofDark.tsx
git commit -m "feat: add dark social proof section for new landing page"
```

---

### Task 7: Build the For Providers section

Use the `frontend-design` skill. Compact section with value props and CTA.

**Files:**
- Create: `src/components/sections/ForProviders.tsx`

- [ ] **Step 1: Create the ForProviders component**

Create `src/components/sections/ForProviders.tsx` using the `frontend-design` skill with this brief:

> Build a compact "For Providers" section for the Orbys360 landing page. Light background.
>
> **Content:**
> - Headline: "Built for Providers Too"
> - Subtext: "Connect with enterprise buyers and scale your AI solutions across the GCC ecosystem."
> - 4 value props displayed as small cards or icon+text rows:
>   1. Icon: `Users` → "Direct access to GCC buyers actively funding AI programs"
>   2. Icon: `ShieldCheck` → "Enterprise credibility through curated positioning"
>   3. Icon: `Rocket` → "Faster go-to-market with reduced sales cycles"
>   4. Icon: `Repeat` → "From custom projects to repeatable revenue"
> - CTA button: "List Your Agent" → links to `/sign-up`
>
> **Design:**
> - Light background: `bg-gradient-to-b from-white to-enterprise-50`
> - Two-column layout on desktop: left side has headline + subtext + CTA, right side has the 4 value prop cards stacked
> - On mobile: single column, headline+subtext first, then value props, then CTA
> - Headline: `font-display text-display-xs text-enterprise-900`
> - Subtext: `text-enterprise-600 mt-4 max-w-md`
> - Value prop cards: `flex items-start gap-4 p-4` with icon in a small `w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center` box
> - Value prop text: `text-sm font-medium text-enterprise-800`
> - CTA: gradient button same style as hero — `bg-gradient-to-r from-blue-600 to-purple-600 text-white` using the `Button` component + `Link`
> - Use `AnimatedSection` for scroll-triggered entrance
> - Section: `py-20`
> - Use `Container` from `@/components/shared/Container`
> - `"use client"` directive
> - Icons from `lucide-react`

- [ ] **Step 2: Verify rendering**

Check that the two-column layout works on desktop and stacks correctly on mobile. Verify the CTA links to `/sign-up`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ForProviders.tsx
git commit -m "feat: add For Providers section for new landing page"
```

---

### Task 8: Assemble the new landing page

Replace `src/app/page.tsx` with the new sections.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the landing page content**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import { NewHero } from "@/components/sections/NewHero";
import { SearchAndFeatures } from "@/components/sections/SearchAndFeatures";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProofDark } from "@/components/sections/SocialProofDark";
import { ForProviders } from "@/components/sections/ForProviders";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <NewHero />
      <SearchAndFeatures />
      <HowItWorks />
      <SocialProofDark />
      <ForProviders />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify the full landing page**

Run: `npm run dev`

Open `http://localhost:3000`. Walk through the entire page top to bottom:
1. Hero: dark background, headline, subtext, CTA button links to `/directory`
2. Search: animated placeholder, category pills link correctly, feature boxes display
3. How It Works: 3 steps with connectors
4. Social Proof: dark background, 4 stats
5. For Providers: headline, 4 value props, CTA links to `/sign-up`
6. Footer: renders normally

Test mobile view (resize browser or use DevTools responsive mode).

- [ ] **Step 3: Verify the About Us page still works**

Open `http://localhost:3000/about`. Confirm all sections still render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace landing page with product-led design"
```

---

### Task 9: Update Navbar landing page detection

The Navbar has `isLandingPage = pathname === '/'` which controls transparent background on the landing page. The new landing page still has a dark hero, so this should continue working. However, the About Us page also has the old dark Hero — we should make the navbar transparent there too.

**Files:**
- Modify: `src/components/shared/Navbar.tsx`

- [ ] **Step 1: Update isLandingPage to include /about**

In `src/components/shared/Navbar.tsx` (around line 28), update:

```tsx
// Replace:
const isLandingPage = pathname === '/'

// With:
const isLandingPage = pathname === '/' || pathname === '/about'
```

- [ ] **Step 2: Verify navbar styling on both pages**

Check that the navbar is transparent (white text) at the top of both `/` and `/about`, and transitions to white background on scroll.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Navbar.tsx
git commit -m "fix: make navbar transparent on About Us page"
```

---

### Task 10: Build check

**Files:** None (verification only)

- [ ] **Step 1: Run the linter**

Run: `npm run lint`

Fix any lint errors that arise from the new files.

- [ ] **Step 2: Run the build**

Run: `npm run build`

Fix any TypeScript or build errors. Common issues to watch for:
- Missing imports
- Unused imports from the old `page.tsx`
- Type errors in new components

- [ ] **Step 3: Run tests**

Run: `npm test`

Ensure no existing tests break from the page restructure.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint and build errors from landing page redesign"
```
