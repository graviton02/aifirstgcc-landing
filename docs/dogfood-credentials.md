# Dogfood / QA Test Credentials

> Reusable credentials and test data for dogfooding sessions.

## Local Environment

| Setting | Value |
|---------|-------|
| **App URL** | `http://localhost:3000` |
| **Next.js dev** | `npm run dev` |
| **Convex dev** | `npx convex dev` (separate terminal) |

## Admin Dashboard

| Setting | Value |
|---------|-------|
| **URL** | `http://localhost:3000/admin` |
| **Password** | `360orbys@ai.com` |

## Test Companies for Claim Flow

Use any unclaimed company from the directory. Good candidates (large companies with logos):

| Company | Slug | Claim URL |
|---------|------|-----------|
| Mphasis | `mphasis` | `/claim/mphasis` |
| Wipro | `wipro` | `/claim/wipro` |
| Infosys | `infosys` | `/claim/infosys` |

> Check claim status on the company page — only "unclaimed" companies can be claimed.

## Test Email for Claims

Use a corporate-looking email (free providers like gmail.com are blocked):
- `test@mphasis.com`
- `test@wipro.com`
- Any `name@companydomain.com` format

## Key Test Flows

### 1. Claim Profile Flow
1. Browse to `/companies/{slug}` and click "Claim This Profile"
2. Fill in name + corporate email on `/claim/{slug}`
3. Go to `/admin`, log in, switch to Claims tab
4. Approve the claim (sends magic link email)
5. Check Convex dashboard for the magic link token, or check Resend logs for the email
6. Visit `/claim/activate?token={token}` to activate

### 2. Admin Review Flow
1. Go to `/admin`, enter password `360orbys@ai.com`
2. Claims tab: approve/reject pending claims
3. Company Edits tab: review company profile edits
4. Agents tab: review agent submissions

### 3. GCC Buyer Flow
1. Sign up at `/sign-up`
2. On onboarding, select "I'm looking for AI agents"
3. Fill in GCC profile form
4. Redirected to `/gcc-dashboard`

### 4. Provider Flow (Manual)
1. Sign up at `/sign-up`
2. On onboarding, select "I'm listing AI agents & services"
3. Redirected to `/dashboard`

### 5. Job Board Demo Accounts

Pre-seeded recruiter + candidate so you can preview both job board dashboards with realistic data.

| Role | Email | Password |
|------|-------|----------|
| Recruiter | `demo-recruiter@orbys360.dev` | `Orbys360!Demo2026` |
| Candidate | `demo-candidate@orbys360.dev` | `Orbys360!Demo2026` |

**Seed / cleanup commands:**
```bash
npx tsx scripts/seed-job-board-demo.ts            # idempotent — safe to re-run
npx tsx scripts/seed-job-board-demo.ts --cleanup  # delete demo data + Clerk users
npx tsx scripts/seed-job-board-demo.ts --cleanup-candidate-orgs  # remove accidental Clerk org memberships from candidate only
```

**What gets created:**
- Recruiter `jobProfiles` row (Sarah Al-Rashid, Orbys360, Riyadh)
- 1 approved job: `Senior AI/ML Engineer — GCC Advisory Platform` (slug: `senior-ai-ml-engineer-orbys360-demo`)
- Candidate `jobProfiles` row (Ahmed Hassan, ML Engineer)
- 1 application from the candidate to the job, with a generated placeholder PDF resume in Convex storage

**Preview URLs (after signing in as the matching account):**
- Public job page: `/jobs/senior-ai-ml-engineer-orbys360-demo`
- Recruiter dashboard: `/jobs/dashboard` — shows the job + 1 applicant + resume download
- Candidate dashboard: `/jobs/dashboard` — shows the application

**Requirements:** `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`, and `CONVEX_DEPLOYMENT` in `.env.local` (the seed script reads them from there).

**Clerk organization requirement:** Job Board demo users should be able to sign in with a personal account. The candidate account must not be required to create or choose a Clerk organization. If Clerk sends the candidate to `/sign-in/tasks/choose-organization`, open Clerk Dashboard → Organizations Settings and switch Organizations from membership required to membership optional / allow personal accounts. Clerk documents this as the setting that lets users choose a Personal Account instead of an Organization. After changing it, run `npx tsx scripts/seed-job-board-demo.ts --cleanup-candidate-orgs`.

## Notes

- Magic link tokens expire after 7 days
- Admin sessions expire after 8 hours
- Clerk manages auth — test accounts persist in the Clerk dashboard
- Convex data can be inspected at the Convex dashboard
