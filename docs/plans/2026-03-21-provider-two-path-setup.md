# Provider Two-Path Setup

> Implemented: 2026-03-21

## Goal

Support two provider journeys from navbar signup:

1. Claim an existing company profile already present in the directory.
2. Create a brand-new company profile and then list agents under it.

The provider dashboard is no longer the initial destination for every provider. It only unlocks after ownership is active.

## Repo-Level Changes

### Backend

- Added `providerProfiles` table to store provider setup intent and chosen path.
- Added `companySubmissions` table for net-new company approval workflow.
- Extended `claimRequests` with `claimant_user_id` indexing so setup state can track the signed-in provider's latest claim.
- Added `convex/providerProfiles.ts`:
  - `getMine`
  - `getSetupState`
  - `ensureProvider`
  - `setOnboardingPath`
- Added `convex/companySubmissions.ts`:
  - `getMine`
  - `create`
- Extended `convex/admin.ts` with:
  - `getPendingCompanySubmissions`
  - `approveCompanySubmission`
  - `rejectCompanySubmission`
  - `getCompanySubmissionsHistory`

### Frontend Routing

- Provider selection in `/onboarding` now creates provider setup intent and routes to `/provider/setup`.
- `/provider/setup` is the new provider hub:
  - claim existing company
  - create new company profile
  - view claim/submission status
- `/dashboard` now requires active company ownership and redirects setup-stage providers back to `/provider/setup`.
- `/auth-redirect` uses provider membership state to choose `/dashboard` vs `/provider/setup`.
- Claim activation no longer hard-fails if Clerk role metadata is temporarily unavailable.

### Admin UI

- Added `New Companies` tab in `/admin`.
- Added pending/history review UI for net-new company submissions.
- Overview counts now include pending new-company submissions.

## Supported Journeys

### Journey A: Claim Existing

1. Sign up.
2. Choose provider.
3. Land on `/provider/setup`.
4. Select `Claim an existing company`.
5. Browse directory and submit a claim.
6. Admin approves claim.
7. Activate claim.
8. Land in `/dashboard`.

### Journey B: Create New Company

1. Sign up.
2. Choose provider.
3. Land on `/provider/setup`.
4. Select `Create a new company profile`.
5. Submit company details.
6. Admin approves submission.
7. Company + owner membership are created.
8. Land in `/dashboard`.

## Files Added

- `convex/providerProfiles.ts`
- `convex/companySubmissions.ts`
- `src/app/provider/setup/page.tsx`
- `src/components/admin/AdminCompanySubmissionsTab.tsx`

## Files Updated

- `convex/schema.ts`
- `convex/claims.ts`
- `convex/admin.ts`
- `src/auth/useUserRole.ts`
- `src/app/onboarding/page.tsx`
- `src/app/auth-redirect/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/claim/activate/page.tsx`
- `src/app/admin/page.tsx`
- `src/components/admin/AdminOverviewTab.tsx`
- `src/components/onboarding/RoleSelector.tsx`
- `docs/source-of-truth.md`
- `docs/persona-flows.md`

## Verification

- `npx convex codegen`
- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`
