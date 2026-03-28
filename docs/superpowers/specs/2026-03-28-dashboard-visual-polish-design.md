# Dashboard Visual Polish — Design Spec

**Date:** 2026-03-28
**Scope:** Provider Dashboard + GCC Dashboard (not Admin)
**Priority:** Visual polish — make the dashboards feel like a polished SaaS product

## Design Decisions

| Decision | Choice |
|----------|--------|
| Sidebar style | Dark sidebar (slate-900 → slate-950 gradient) |
| Card style | Elevated cards (soft shadow, hover lift, rounded-2xl) |
| Sidebar branding | Company logo + name at top (Provider); user avatar + name (GCC) |
| Content background | `bg-enterprise-50` (light gray) so white cards pop |
| Animations | Framer Motion entrance animations, hover lift, staggered cards |
| Loading states | Skeleton loaders (pulsing card shapes) instead of spinner |

---

## 1. DashboardShell + Sidebar Overhaul

### DashboardSidebar

**Background:** Dark slate gradient `bg-gradient-to-b from-slate-900 to-slate-950`

**Company logo header (Provider dashboard):**
- Top of sidebar, above nav items
- Company logo from `public/logos/companies/{slug}.{ext}` (32x32 or 40x40, rounded-lg)
- Fallback: gradient circle (`from-primary to-accent-purple`) with company initial letter
- Company name: white, text-sm, font-semibold, truncated
- Separated from nav by a subtle divider line (`border-b border-white/10`)

**User header (GCC dashboard):**
- Clerk user avatar (if available) or initial circle
- User name/email, white, text-sm
- Same divider pattern

**Nav items:**
- Active: `bg-white/10 text-white font-semibold` + `border-l-3 border-primary`
- Inactive: `text-slate-400 hover:bg-white/5 hover:text-slate-200`
- Badge counts: `bg-amber-500 text-white text-xs` (visible on dark)
- Transition: `duration-200`

### DashboardShell

- Content area background: `bg-enterprise-50`
- Sidebar: remove `border-r`, add `shadow-xl` for depth
- No other structural changes (max-w-[1000px], padding scale unchanged)
- New optional props for sidebar branding:
  - `brandLogo?: string` — URL to company logo image
  - `brandName?: string` — company or user display name
  - `brandFallbackInitial?: string` — first letter for fallback avatar
- Provider page passes: company slug → logo path, company name
- GCC page passes: Clerk user's first name/email, no logo (uses initial circle)

### DashboardMobileNav

- Keep light theme on mobile (dark mobile dropdown is too heavy)
- Add company name in the mobile sticky bar

---

## 2. Provider Dashboard — Profile Tab

**Company Header Card:**
- Elevated card: `bg-white rounded-2xl shadow-card p-6`
- Layout: flex row with company logo (64x64, rounded-xl) on left
- Logo source: `public/logos/companies/{slug}.{ext}`, fallback: gradient initial circle
- Right of logo: company name (text-xl font-bold), headquarters (MapPin icon, text-sm enterprise-500), website (Globe icon, clickable link, text-sm primary)
- Top-right corner: Edit button (pencil icon, ghost style)
- Below header row: description (text-sm enterprise-600, mt-4)

**Edit mode:**
- Card expands inline to show form fields
- Textarea for description, input for website URL
- Amber callout: "Changes will be sent for admin review" (amber-50 bg, AlertCircle icon)
- Save / Cancel buttons at card bottom

**Success state:** Green banner slides in at top with CheckCircle, auto-dismisses after 3s

---

## 3. Provider Dashboard — Agents Tab

**Header bar:**
- Flex row: "Your Agents" heading + count badge (text-xs enterprise-500 bg-enterprise-100 rounded-full px-2) + "Submit New Agent" primary gradient button
- If zero agents, header still shows but with count "0"

**Pending Submissions section** (conditional):
- Section label: "Pending Review" with amber dot
- Cards: elevated, `border-l-3 border-amber-400` accent
- Each card: agent name, category badge, status badge (Pending/Changes Requested/Rejected), admin notes preview (if any, truncated)
- Clickable → navigates to detail/resubmit view

**Active Agents grid:**
- `grid grid-cols-1 md:grid-cols-2 gap-4`
- Elevated cards: `bg-white rounded-2xl shadow-card p-6`
- Content: agent name (font-semibold), tagline (line-clamp-2, text-sm enterprise-600), category badge (gradient bg)
- Pending edits indicator: small clock icon in top-right corner
- Hover: `hover:-translate-y-[2px] hover:shadow-lg`, `active:translate-y-0 active:scale-[0.99]`
- Framer Motion: `whileInView` entrance, stagger 50ms

**Empty state:**
- Bot icon (w-16 h-16) in gradient circle (w-24 h-24, `from-primary/10 to-accent-purple/10`)
- "No agents listed yet" (text-lg font-semibold)
- "Submit your first AI agent to the directory" (text-sm enterprise-500)
- "Submit an Agent" primary CTA button

---

## 4. Provider Dashboard — Team Tab

**Header bar:**
- "Team Members" heading + count badge + "Invite Member" button (owners only)
- Non-owner info: styled callout (enterprise-100 bg, shield icon, rounded-xl)

**Team member cards:**
- Elevated cards, vertical stack (space-y-3)
- Each: avatar circle (40x40, gradient bg with initial letter), email (font-medium), role pill ("Owner" = primary bg/text, "Member" = enterprise-100/600), status pill ("Active" = green, "Pending" = amber with clock icon)
- Owner indicator: subtle star/crown badge on avatar
- Remove: icon button, hover → red, only for owners

**Invite section (toggled):**
- Slides in with framer-motion (`AnimatePresence`)
- Input with Mail icon prefix, "Send Invite" button
- Success/error inline feedback

**Empty state:**
- Users icon (w-16 h-16) in gradient circle
- "Your team" heading
- "Invite colleagues to help manage your company profile and agents" subtitle
- "Invite a Team Member" CTA

---

## 5. GCC Dashboard — Shortlisted Agents Tab

**Header bar:**
- "Shortlisted Agents" heading + count badge

**Agent cards:**
- Match directory AgentCard quality: `rounded-2xl`, shadow-card, hover lift
- Company logo (32x32, rounded) top-left if available
- Agent name (font-semibold), company name (text-xs enterprise-500)
- Tagline (line-clamp-2, text-sm)
- Category badge (gradient bg)
- Bottom: "View Details" link (text-primary, ArrowRight icon) + remove trash button
- Framer Motion entrance with stagger

**Empty state:**
- Star icon in gradient circle
- "No shortlisted agents yet" heading
- "Browse the directory to find and shortlist AI agents" subtitle
- "Browse Directory" CTA → `/directory`

---

## 6. GCC Dashboard — Current Requests Tab

**Request cards:**
- Elevated cards, vertical stack
- Left border color matching status: green (approved), red (rejected), amber (pending)
- Content: agent name (font-semibold), message preview (line-clamp-2, text-sm)
- Right side: status badge with icon — CheckCircle (approved/green), XCircle (rejected/red), Clock (pending/amber)
- Timestamp "Sent X days ago" (text-xs enterprise-400) if available

**Empty state:**
- MessageCircle icon in gradient circle
- "No contact requests yet" heading
- "When you reach out to providers, your requests will appear here" subtitle

---

## 7. Shared Patterns

### Loading States
- Replace Loader2 spinners with skeleton card shapes
- Use Tailwind `animate-pulse` on gray placeholder rectangles matching card layout
- Profile: single skeleton card
- Agents/Shortlist: 2-4 skeleton cards in grid
- Team/Requests: 2-3 skeleton cards in stack
- Keep full-page Loader2 spinner only for auth/redirect guards

### Entrance Animations
- Cards: `motion.div` with `whileInView={{ opacity: 1, y: 0 }}` from `{{ opacity: 0, y: 12 }}`
- Duration: 300ms, ease `[0.4, 0, 0.2, 1]`
- Stagger: each card 50ms after previous
- Section headings: fade in with slight y offset

### Empty State Pattern
```
<div className="text-center py-16">
  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center">
    <Icon className="w-16 h-16 text-primary/40" />
  </div>
  <h3 className="text-lg font-semibold text-enterprise-900 mt-4">Heading</h3>
  <p className="text-sm text-enterprise-500 mt-2 max-w-sm mx-auto">Subtitle</p>
  <Button className="mt-6">CTA</Button>  {/* when applicable */}
</div>
```

### Card Hover Pattern
```
transition-all duration-300
hover:-translate-y-[2px] hover:shadow-lg
active:translate-y-0 active:scale-[0.99]
```

### Card Base Pattern
```
bg-white rounded-2xl shadow-card p-6
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardSidebar.tsx` | Dark theme, company logo header, left-border active accent |
| `src/components/dashboard/DashboardShell.tsx` | Content bg-enterprise-50, sidebar shadow, pass company data |
| `src/components/dashboard/DashboardMobileNav.tsx` | Company name in mobile bar |
| `src/components/dashboard/ProfileTab.tsx` | Company header card with logo, better edit mode |
| `src/components/dashboard/AgentsTab.tsx` | Elevated cards, header bar, better empty state, entrance animations |
| `src/components/dashboard/TeamTab.tsx` | Avatar circles, styled badges, invite animation, empty state |
| `src/components/gcc-dashboard/ShortlistedAgentsTab.tsx` | Elevated cards matching AgentCard, better empty state |
| `src/components/gcc-dashboard/CurrentRequestsTab.tsx` | Status left-border, icon badges, better empty state |
| `src/app/dashboard/page.tsx` | Pass company data to DashboardShell for sidebar branding |
| `src/app/gcc-dashboard/page.tsx` | Pass user info to DashboardShell for sidebar branding |

## Dependencies

- No new npm packages
- Uses existing: `framer-motion`, `lucide-react`, `@clerk/nextjs` (for user info)
- Uses existing Tailwind tokens: `enterprise-*`, `primary`, `accent-purple`, `shadow-card`
- Company logos already exist in `public/logos/companies/`

## Future Work (Out of Scope)

- Logo upload flow for new providers (separate thread)
- Admin dashboard polish
- AgentDetailView and AgentForm redesign (inside Agents tab sub-views)
- Data visualization / stats cards
- Provider Leads tab (newly added, will be polished in its own pass)
- Timestamp on CurrentRequests cards — depends on whether `_creationTime` is exposed in the Convex query
