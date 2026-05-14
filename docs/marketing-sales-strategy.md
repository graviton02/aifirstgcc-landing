# Orbys360 — Marketing & Sales Strategy

> **Last updated:** 2026-04-17
> **Situation:** ~20 visitors/week, 78 listed companies (0 claimed), 231 agents, ~₹50K/month budget, LinkedIn active

---

## The Core Problem

78 companies and 231 agents are listed but no one knows they're there. Companies haven't claimed their profiles, and GCC buyers aren't browsing yet. Classic cold-start marketplace — need to create a reason for both sides to show up.

---

## Phase 1: Get the 78 Companies to Claim (Weeks 1-4)

### Direct Outreach (₹0, your time)

Personally email/LinkedIn message the 78 listed companies. Not a cold pitch — a notification that their profile already exists.

**Template:**

> Hi [Name], I wanted to let you know that [Company] is listed on Orbys360's AI agent directory with [X] agents profiled. GCC decision-makers are using the platform to evaluate AI solutions.
>
> You can claim your company profile here to manage your listing, respond to reviews, and get visibility with enterprise buyers: [claim link]
>
> It takes 2 minutes and is free.

**Why this works:** You're not asking them to sign up. You're telling them they're already there. FOMO + control. No one wants an unclaimed profile floating around.

**Execution:**
- Week 1: Top 20 companies (biggest, most recognizable)
- Week 2-3: Next 30
- Week 4: Remaining 28
- Follow up once with non-responders

**Target: 15-25 claims in the first month.**

### Automated Claim Nudge Emails (₹0, one-time build)

Build an automated email sequence using Resend (already integrated):

1. **Day 0:** "Your company is listed on Orbys360" (claim CTA)
2. **Day 7:** "X buyers viewed your profile this week" (social proof)
3. **Day 14:** "Companies like [Competitor] have claimed — here's what they can do" (FOMO)

This can be a Convex scheduled action — the pattern already exists in the codebase.

---

## Phase 2: Drive GCC Buyer Traffic (Weeks 1-8)

### LinkedIn Content Engine (₹0, your time)

Post 3-4x per week, rotating these formats:

1. **AI Pulse highlights** — Take the auto-generated daily brief, pull the best insight, write a LinkedIn post. "Read the full brief → [link]". Drives traffic to `/ai-pulse` which drives discovery of the directory.

2. **"Did you know" agent spotlights** — Pick one agent from the directory, write 3-4 lines about what it does and which GCC function it serves. Link to the agent page. One post = one page visit = SEO signal.

3. **GCC positioning takes** — Short, opinionated posts about GCCs as AI control towers, governance hubs, orchestration centers. Builds personal brand as the authority in this niche. No links needed — just visibility.

4. **Comparison/listicle posts** — "5 AI agents for supply chain optimization in GCCs" with links to the compare tool or category pages.

### SEO (₹0, already built — needs activation)

231 agent pages + 78 company pages + category pages with proper JSON-LD, meta tags, canonical URLs, and sitemaps. Infrastructure is solid. Activation needed:

- Submit sitemap to Google Search Console
- Verify indexing of agent/company pages
- Internal linking from AI Pulse briefs to relevant agent/company pages
- 2-4 long-form articles/month targeting: "best AI agents for GCC," "AI agent directory for enterprises," "agentic AI for shared services" (low-competition keywords)

See **SEO Deep Dive** section below for details.

### Paid: LinkedIn Ads (₹30-40K/month)

**Campaign 1: Directory awareness (GCC buyers)**
- Target: "GCC," "Shared Services," "AI Strategy," "Digital Transformation" job titles in India, UAE, Saudi Arabia
- Ad: "Evaluate 231 AI agents for your enterprise. The only directory built for GCC decision-makers."
- CTA: Browse Directory
- Format: Single image or document carousel

**Campaign 2: Claim your profile (vendors)**
- Target: Marketing/BD roles at the 78 listed companies (upload company list as matched audience)
- Ad: "Your AI agent is listed on Orbys360. Claim your profile to manage your listing and connect with GCC buyers."
- CTA: Claim Profile
- Format: Single image

**Budget split:** 70% buyer traffic (Campaign 1), 30% claim conversion (Campaign 2).

---

## Phase 3: Create Network Effects (Weeks 4-12)

### Reviews as a Flywheel

Once companies claim, prompt them to solicit reviews from their existing customers. Reviews:
- Make pages stickier
- Improve SEO (unique content on each page)
- Give buyers a reason to return

Build a "Request a review" feature in the provider dashboard — email to the provider's customer with a direct link to the review form.

### AI Pulse as a Distribution Channel

Turn the auto-generated daily briefs into:
- **LinkedIn newsletter** — Weekly digest of the best AI Pulse insights. LinkedIn newsletters get subscriber notifications.
- **Email newsletter** — Use the early access signups already collected. Weekly digest of AI Pulse + featured agents.

Creates a recurring reason to visit the platform.

### Referral Loop from Claims

When a company claims their profile, suggest in the provider dashboard: "Share your Orbys360 profile with your prospects." Give them a branded link. Every claimed company becomes a distribution channel.

---

## Budget Allocation (₹50K/month)

| Item | Monthly | Purpose |
|------|---------|---------|
| LinkedIn Ads — buyer traffic | ₹30,000 | Drive GCC decision-makers to directory |
| LinkedIn Ads — vendor claims | ₹12,000 | Get listed companies to claim profiles |
| Resend email (transactional) | ₹0 (free tier) | Claim nudges, review requests |
| Tools (Canva, etc.) | ₹3,000 | Ad creatives, LinkedIn post graphics |
| Buffer | ₹5,000 | Testing, scaling what works |

---

## Metrics to Track Weekly

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Weekly visitors | 20 → 100 | 500+ |
| Companies claimed | 0 → 15 | 30+ |
| Directory page views | Track baseline | 3x baseline |
| AI Pulse readers | Track baseline | 200+/week |
| LinkedIn post impressions | Track baseline | 5,000+/week |

---

## Immediate Next Steps (This Week)

1. Send the first 20 claim outreach emails/LinkedIn messages
2. Submit sitemap to Google Search Console
3. Post first AI Pulse LinkedIn post
4. Set up LinkedIn ad account + install pixel on site for retargeting

---

## SEO Deep Dive

### Current SEO Infrastructure (Already Built)

| Asset | Status | Details |
|-------|--------|---------|
| Dynamic sitemap | Live | `src/app/sitemap.ts` — generates XML with all agent, company, and category URLs |
| JSON-LD structured data | Live | Agent pages: `SoftwareApplication`, Company pages: `Organization`, Category pages: `CollectionPage`, All pages: `BreadcrumbList` |
| Meta tags | Live | Title, description, Open Graph, Twitter Cards on all dynamic pages |
| Canonical URLs | Live | `alternates.canonical` set on all pages |
| SSG + ISR | Live | `generateStaticParams` pre-builds all pages, `revalidate = 3600` for freshness |
| Breadcrumbs | Live | Visible `<Breadcrumbs>` component + BreadcrumbList JSON-LD |

### Google Search Console — Setup Checklist

1. **Go to** [search.google.com/search-console](https://search.google.com/search-console)
2. **Add property** → choose "URL prefix" → enter `https://www.orbys360.com`
3. **Verify ownership** via one of:
   - DNS TXT record (recommended — add to your domain DNS)
   - HTML file upload to `public/` directory
   - Meta tag in `<head>` (add to `src/app/layout.tsx`)
4. **Submit sitemap** → go to Sitemaps → enter `https://www.orbys360.com/sitemap.xml` → Submit
5. **Request indexing** for key pages:
   - `/directory`
   - `/ai-pulse`
   - Top 10 agent pages (highest-value listings)
   - Top 10 company pages

### What to Monitor in Search Console (Weekly)

| Report | What to Look For |
|--------|------------------|
| **Performance** | Total clicks, impressions, avg position. Track week-over-week growth |
| **Pages** | Which agent/company pages are indexed and getting impressions |
| **Queries** | What search terms are bringing people. Look for "AI agent" + industry terms |
| **Coverage/Indexing** | How many pages are indexed vs excluded. Target: all 231 agent + 78 company pages indexed |
| **Core Web Vitals** | Page speed issues. Vercel + Next.js should handle this well |

### SEO Actions to Take

#### Immediate (Week 1)

- [ ] Set up Google Search Console and verify ownership
- [ ] Submit sitemap
- [ ] Request indexing for `/directory`, `/ai-pulse`, and top 20 agent pages
- [ ] Set up Google Analytics 4 (if not already) to track page views by source

#### Short-term (Weeks 2-4)

- [ ] **Check indexing coverage** — if pages aren't getting indexed, investigate. Common issues: pages blocked by robots.txt, noindex tags, canonical issues
- [ ] **Internal linking from AI Pulse** — when a daily brief mentions a topic related to a listed agent (e.g., "supply chain AI"), link to the relevant agent page from the brief. This passes authority to directory pages.
- [ ] **Optimize title tags** — check which pages get impressions but low CTR. Rewrite titles to be more compelling (e.g., "Supply Chain Optimizer by Aramco Digital | AI Agent Review" instead of generic titles)
- [ ] **Add FAQ schema** — on category pages, add `FAQPage` JSON-LD with questions like "What are the best AI agents for [category]?" This can win featured snippets.

#### Medium-term (Weeks 4-12)

- [ ] **Long-form content** — write 2-4 articles per month targeting:
  - "best AI agents for supply chain management"
  - "AI agent directory for enterprises"
  - "agentic AI for shared services centers"
  - "how GCCs are using AI agents"
  - "[Company Name] AI agents review" (for each of the 78 companies)
- [ ] **Backlink building** — reach out to GCC industry publications, AI newsletters, and enterprise tech blogs. The AI Pulse daily brief is itself linkable content.
- [ ] **Review content for SEO** — when companies start getting reviews, each review adds unique, keyword-rich content to the page. This is a natural SEO multiplier.

### Target Keywords (Low Competition, High Relevance)

| Keyword | Search Intent | Target Page |
|---------|--------------|-------------|
| AI agent directory | Discovery | `/directory` |
| best AI agents for enterprise | Evaluation | `/directory` + category pages |
| AI agents for supply chain | Category | `/categories/operations` |
| AI agents for finance | Category | `/categories/finance` |
| agentic AI for GCC | Niche authority | Blog content |
| [Company] AI agents | Brand | `/companies/[slug]` |
| [Agent name] review | Evaluation | `/agents/[slug]` |
| AI agent comparison tool | Tool | `/compare` |
| enterprise AI daily brief | Content | `/ai-pulse` |

### Technical SEO — Already Handled

These are already implemented in the codebase:

- `robots.txt` — standard Next.js default (allows all)
- `sitemap.xml` — dynamic, auto-generated from Convex data
- Page speed — Vercel edge network + Next.js SSG/ISR
- Mobile responsive — Tailwind CSS responsive design
- HTTPS — Vercel handles SSL
- Structured data — JSON-LD on all dynamic pages
- `metadataBase` — set in layout.tsx for OG image resolution

### SEO Metrics to Track

| Metric | Week 1 Baseline | Month 3 Target |
|--------|-----------------|----------------|
| Pages indexed (Search Console) | Measure | 300+ (all agents + companies + categories) |
| Organic impressions/week | Measure | 1,000+ |
| Organic clicks/week | Measure | 50+ |
| Avg position for "AI agent directory" | Not ranking | Top 30 |
| Pages with 0 impressions | Identify | Reduce by 50% |
