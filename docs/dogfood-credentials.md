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

## Notes

- Magic link tokens expire after 7 days
- Admin sessions expire after 8 hours
- Clerk manages auth — test accounts persist in the Clerk dashboard
- Convex data can be inspected at the Convex dashboard
