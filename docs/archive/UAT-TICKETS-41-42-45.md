# User Acceptance Testing (UAT) Plan

**Tickets:** 41, 42, 45
**Date:** 2026-02-13
**Environment:** Staging (develop branch) / Production (main branch after merge)
**Base URL:** `https://<your-vercel-url>`

---

## Prerequisites

Before testing, confirm the following are in place:

- [ ] Edge function deployed: `supabase functions deploy analyze-self-assessment`
- [ ] OpenAI API key set: `supabase secrets set OPENAI_API_KEY=sk-...`
- [ ] Supabase tables exist: `self_assessments`, `self_assessment_results`
- [ ] Test user account with **GCC role** (required for assessment pages)
- [ ] Test user is signed in via Clerk and belongs to an organization

---

## Ticket 41: Self-Assessment Questionnaire

**Route:** `/self-assessment`
**Access:** Authenticated GCC users only

### TC-41.1: Page Load & Access Control

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 1 | Navigate to `/self-assessment` without being signed in | Redirected to auth/login page | |
| 2 | Navigate to `/self-assessment` as a Provider-role user | Access denied or redirected (GCC role required) | |
| 3 | Navigate to `/self-assessment` as a GCC-role user | Questionnaire page loads with sidebar and first pillar | |

### TC-41.2: Questionnaire UI & Navigation

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 4 | Verify sidebar shows all 7 pillars | All pillars visible: Strategy & Vision, Talent & Skills, Technology & Infrastructure, Operating Model, Innovation & Ecosystem, Governance & Risk, Impact & Outcomes | |
| 5 | Verify first pillar is active on load | "Strategy & Vision" highlighted in sidebar, 4 questions displayed | |
| 6 | Click a choice for each question | Choice highlights with primary color, radio indicator fills | |
| 7 | Verify progress bar updates | Progress shows "X/28 answered" and bar fills proportionally | |
| 8 | Click "Next Pillar" after answering all 4 questions | Advances to Pillar 2, sidebar updates active state | |
| 9 | Click "Next Pillar" without answering all questions | Button is disabled until all 4 questions in current pillar are answered | |
| 10 | Click "Previous" on Pillar 2 | Returns to Pillar 1, previous answers preserved | |
| 11 | Click pillar names in sidebar to jump between pillars | Navigates to selected pillar, answers preserved | |
| 12 | Verify each pillar has exactly 4 questions | All 7 pillars show 4 questions each (28 total) | |
| 13 | Verify each question has exactly 5 choices | Each question shows 5 maturity-level options | |

### TC-41.3: Auto-Save & Resume

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 14 | Answer questions in Pillars 1-3, then navigate away | Answers saved to Supabase (check DB or network tab) | |
| 15 | Return to `/self-assessment` after navigating away | Assessment resumes with previous answers populated | |
| 16 | Verify the page jumps to the first incomplete pillar on resume | If Pillars 1-3 complete, page opens on Pillar 4 | |
| 17 | Refresh the browser mid-assessment | Assessment resumes from saved state | |

### TC-41.4: Submission

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 18 | Navigate to Pillar 7 (final) and answer all questions | "Submit Assessment" button becomes enabled | |
| 19 | Verify submit button is disabled if any question unanswered | Button remains disabled, warning shows remaining count | |
| 20 | Click "Submit Assessment" with all 28 answered | Processing modal appears with spinner and "Analyzing your responses..." message | |
| 21 | Wait for AI analysis to complete | Redirected to `/self-assessment/result/:assessmentId` | |

### TC-41.5: Mobile Responsiveness

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 22 | View questionnaire on mobile (375px width) | Sidebar collapses, questions stack vertically, choices are full-width | |
| 23 | Navigate between pillars on mobile | Navigation works, progress bar visible | |
| 24 | Submit assessment on mobile | Same flow as desktop, processing modal displays correctly | |

---

## Ticket 42: Self-Assessment Results + AI Analysis + PDF

**Route:** `/self-assessment/result/:assessmentId`
**Access:** Authenticated GCC users only
**Dependency:** Requires a completed assessment from Ticket 41

### TC-42.1: Results Page Load

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 25 | After submitting assessment, verify redirect to results page | URL is `/self-assessment/result/<uuid>`, page loads | |
| 26 | Loading state displays while fetching | Spinner/loading indicator shown | |
| 27 | Navigate to results URL with invalid assessmentId | Error state shown: "Assessment result not found" | |
| 28 | Navigate to results URL without being signed in | Redirected to auth page | |

### TC-42.2: AI Analysis Content

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 29 | Verify "Current State by Pillar" section displays | All 7 pillar headings shown with 3-4 bullet points each | |
| 30 | Verify bullet points are contextual (not generic) | Content reflects the actual answers submitted (e.g., low scores yield gap-focused bullets) | |
| 31 | Verify "Recommendations by Pillar" section displays | All 7 pillars shown with Short-term (3-6 months) and Mid-term (6-18 months) sections | |
| 32 | Verify each pillar has 3 short-term and 3 mid-term actions | Count the bullet points per pillar | |
| 33 | Verify "Next Steps / Roadmap" section displays | 3-4 high-level steps shown | |
| 34 | Verify no score numbers appear in the analysis text | AI output should describe maturity in words, not reference raw scores | |

### TC-42.3: PDF Generation

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 35 | Click "Download PDF" button | PDF file downloads: `AI-First-GCC-Assessment-Report-YYYY-MM-DD.pdf` | |
| 36 | Open downloaded PDF | PDF opens in viewer, is multi-page | |
| 37 | Verify PDF title page | Shows "AI-First GCC Assessment Report", date, "7 Pillars of AI Transformation Analysis" | |
| 38 | Verify PDF "Current State by Pillar" section | Blue header bar, all 7 pillars with bullet points matching web page | |
| 39 | Verify PDF "Recommendations by Pillar" section | Blue labels for short-term, green labels for mid-term, content matches web page | |
| 40 | Verify PDF "Next Steps / Roadmap" section | Blue header bar, numbered steps | |
| 41 | Verify PDF footer | Shows "Generated by Orbys360.com" and Report ID | |
| 42 | Generate PDF on mobile browser | PDF downloads successfully on mobile | |

### TC-42.4: Edge Function (Backend)

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 43 | Verify `self_assessments` row updated to status `completed` | Check Supabase table after submission | |
| 44 | Verify `self_assessment_results` row created | New row with `assessment_id`, `analysis` (JSON), `analysis_text` | |
| 45 | Verify analysis JSON structure | Contains `current_state`, `recommendations`, `next_steps` keys | |
| 46 | Submit assessment when OpenAI API is unavailable | Edge function returns error, frontend shows error message gracefully | |

---

## Ticket 45: Orbyt Landing Page

**Route:** `/orbyt`
**Access:** Public (no authentication required)

### TC-45.1: Page Load & Structure

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 47 | Navigate to `/orbyt` | Full landing page loads with 6 sections in order | |
| 48 | Verify page loads without authentication | No login required, public access | |
| 49 | Verify no horizontal scrollbar appears | Page has `overflow-hidden`, no content leaks | |
| 50 | Verify page loads within 3 seconds on broadband | Lazy-loaded, chunk size ~18 KB | |

### TC-45.2: Hero Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 51 | Verify animated gradient background renders | Purple/violet MeshGradient shader visible, animating | |
| 52 | Verify headline text | "The AI Agent Marketplace Built for Enterprise" | |
| 53 | Verify typewriter/cycling effect | Function names cycle every ~2.5s: Finance, HR Operations, IT Service Management, Supply Chain, Legal & Compliance, Engineering | |
| 54 | Click "Explore the Marketplace" CTA | Navigates to `/marketplace` | |
| 55 | Click "List Your Agent" CTA | Navigates to `/auth?mode=signup&role=provider` | |

### TC-45.3: What Is Orbyt Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 56 | Verify problem/solution two-column layout | Left: "The Problem" (red tint), Right: "The Solution" (purple tint) | |
| 57 | Verify three audience cards below | "For GCC Leaders", "For AI Providers", "For Enterprises" with icons | |
| 58 | Scroll to section and verify animation | Elements animate in on scroll (fade up/slide) | |

### TC-45.4: How It Works Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 59 | Verify 4-step process layout | List (01), Discover (02), Screen (03), Connect (04) | |
| 60 | Verify connecting rail/line between steps | Visual connector between step circles on desktop | |
| 61 | Verify mobile layout | Steps stack vertically on mobile with vertical rail | |
| 62 | Verify staggered animation on scroll | Steps appear sequentially with delay | |

### TC-45.5: Why Choose Orbyt Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 63 | Verify bento grid layout | First card spans full width, other 3 in 2-column grid | |
| 64 | Verify 4 feature cards | Function-First Taxonomy, Enterprise Trust Layer, Two-Way Matching, Quality Over Quantity | |
| 65 | Verify hover effects on cards | Shadow/border transitions on hover | |

### TC-45.6: Categories Marquee Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 66 | Verify 3 rows of scrolling pills | Auto-scrolling category badges in alternating directions | |
| 67 | Verify category names | Finance & Accounting, Human Resources, IT Service Management, Supply Chain, Legal & Compliance, Customer Experience, Engineering, Data & Analytics, Risk & Compliance, Procurement, Marketing, Operations, Sales, R&D, Quality Assurance, Facilities Management | |
| 68 | Verify infinite scroll loop | Pills scroll continuously without gaps | |
| 69 | Verify fade masks on edges | Left and right edges have gradient fade | |

### TC-45.7: Security Section

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 70 | Verify dark background with 6 cards | Dark `enterprise-950` background, 3x2 grid of security features | |
| 71 | Verify 6 security features | Data Residency, Deployment Models, SSO Integration, Audit Logging, GDPR Compliant, SOC2/ISO 27001 | |
| 72 | Verify icons render for each feature | Globe, Server, Lock, FileCheck, Shield, Award icons visible | |

### TC-45.8: Mobile Responsiveness

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 73 | View `/orbyt` on mobile (375px) | All sections stack vertically, text readable, CTAs tappable | |
| 74 | View `/orbyt` on tablet (768px) | Layout adapts, grid layouts adjust to fewer columns | |
| 75 | Verify hero CTAs on mobile | Both buttons visible and tappable | |
| 76 | Verify marquee works on mobile | Pills scroll without performance issues | |

---

## Cross-Cutting Concerns

### TC-X.1: Navigation & Routing

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 77 | Verify `/self-assessment` is accessible from GCC Dashboard | Link or navigation path exists | |
| 78 | Verify `/orbyt` is accessible from main navigation | Link or navigation path exists | |
| 79 | Use browser back/forward through assessment flow | Navigation works correctly, state preserved | |
| 80 | Direct URL access to `/self-assessment/result/<valid-id>` | Results page loads correctly | |

### TC-X.2: Performance

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 81 | Verify lazy loading of assessment pages | Network tab shows chunk loaded on navigation, not upfront | |
| 82 | Verify lazy loading of Orbyt page | `OrbytLanding-*.js` chunk loaded on `/orbyt` navigation | |
| 83 | Verify MeshGradient shader doesn't cause frame drops | Smooth animation at 60fps on modern browsers | |

### TC-X.3: Browser Compatibility

| # | Test Case | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 84 | Test on Chrome (latest) | All features work correctly | |
| 85 | Test on Safari (latest) | All features work correctly | |
| 86 | Test on Firefox (latest) | All features work correctly | |
| 87 | Test on Edge (latest) | All features work correctly | |

---

## Test Summary

| Ticket | Feature | Total Cases | Passed | Failed | Blocked |
|--------|---------|-------------|--------|--------|---------|
| 41 | Self-Assessment Questionnaire | 24 | | | |
| 42 | Results + AI Analysis + PDF | 22 | | | |
| 45 | Orbyt Landing Page | 30 | | | |
| X | Cross-Cutting | 11 | | | |
| **Total** | | **87** | | | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| QA Lead | | | |
| Engineering Lead | | | |
| Stakeholder | | | |

---

## Notes

- **AI Analysis Quality:** The consulting-style report is generated by GPT-4o. Content quality depends on the model's output. Verify recommendations are specific and actionable, not generic.
- **PDF Size:** The PDF generator (jsPDF) adds ~127 KB gzipped to the results page bundle. This is loaded only when a user visits the results page.
- **Edge Function Deployment:** The `analyze-self-assessment` edge function must be deployed separately via `supabase functions deploy analyze-self-assessment`. It is not part of the Vercel deployment.
- **Environment Variables:** The edge function requires `OPENAI_API_KEY` set as a Supabase secret. Without it, assessment submission will fail with an error message.
