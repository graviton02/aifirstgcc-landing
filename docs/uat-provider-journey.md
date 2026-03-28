# UAT: Provider Journey — End-to-End

> Complete user acceptance test for a provider from first visit through all dashboard operations.

## Prerequisites

- App running on `http://localhost:3000` (`npm run dev`)
- Convex running (`npx convex dev`)
- Admin password: `360orbys@ai.com`
- At least one unclaimed company in the directory (e.g., LTIMindtree, or any company with `claim_status: "unclaimed"`)

---

## Phase 1: Discovery & Claim Submission

### 1.1 Browse Directory
1. Navigate to `http://localhost:3000`
2. Click "Browse Directory" or navigate to `/directory`
3. Verify: Directory loads with agent cards showing correct company names
4. Use search to find a company (e.g., search "LTIMindtree")
5. Click on a company card to visit the company profile page

### 1.2 Company Profile Review
1. On the company page (e.g., `/companies/ltimindtree`), verify:
   - Company name, description, headquarters display correctly
   - Agents listed under the company
   - "Claim This Profile" button is visible for unclaimed companies
2. Click "Claim This Profile" button

### 1.3 Submit Claim
1. On `/claim/{slug}`, verify the form shows:
   - Pre-filled company name (read-only)
   - Full Name input
   - Corporate Email input
2. **Validation tests:**
   - Enter single-character name "a" → expect error on blur
   - Enter email as name "test@email.com" → expect error on blur
   - Enter gmail.com email → expect error on blur (after typing @gmail.com)
   - Clear errors by entering valid data
3. Submit with valid name and corporate email (e.g., "Test Provider" / "test@ltimindtree.com")
4. Verify success page shows:
   - Confirmation message with company name and email
   - "Back to {company}" link (navigates to company page)
   - "Browse Directory" link (navigates to /directory)

---

## Phase 2: Admin Approval

### 2.1 Admin Login
1. Navigate to `/admin`
2. Enter password `360orbys@ai.com`
3. Verify: Admin dashboard loads with Overview tab

### 2.2 Review Claim
1. Switch to "Claims" tab
2. Verify pending claim appears with:
   - Claimant name and email
   - Company badge with logo
   - Submission date
   - Approve button (with text label, not icon-only)
   - Reject button (with text label)
3. Click "Approve"
4. Verify: Inline confirmation appears ("Approve this claim from X for Y? This will send them an activation email.")
5. Click "Confirm Approve"
6. Verify: Claim moves to History tab with "Approved" status
7. Note: A magic link email is sent. Get the magic link token from Convex logs.

---

## Phase 3: Claim Activation & Account Setup

### 3.1 Magic Link Activation
1. Get the magic link token from Convex logs (the `magic_link_token` field on the approved claim)
2. Navigate to `/claim/activate?token={TOKEN}`
3. If not signed in: Verify sign-up prompt appears
4. Click "Create Your Account"
5. Complete Clerk sign-up with a new email

### 3.2 Auto-Activation
1. After sign-up, verify redirect back to `/claim/activate?token={TOKEN}`
2. Verify: Activation runs automatically:
   - "Activating your profile..." loading state
   - "Profile Activated — Welcome to {company}!" success state
   - Auto-redirect to `/dashboard` after 2 seconds
3. Verify: No 422/500 errors in console (role is set correctly)

### 3.3 Onboarding Bypass (fallback)
- If activation role-setting fails and user lands on `/onboarding`:
  - Verify: The system auto-detects the company membership and sets provider role automatically
  - Verify: Redirect to `/dashboard` happens without manual role selection

---

## Phase 4: Provider Dashboard

### 4.1 Dashboard Load
1. Verify `/dashboard` loads with:
   - Company name in header
   - Three tabs: Profile, Agents, Team
   - Profile tab active by default

### 4.2 Profile Tab — View & Edit Company
1. Verify company details display (name, headquarters, description, website)
2. Click "Edit" on the description field
3. Modify the description text
4. Submit the edit
5. Verify: Success message shown ("Changes submitted for review")
6. Verify: Edit appears in Admin dashboard under "Company Edits" tab

### 4.3 Agents Tab — Submit New Agent
1. Switch to "Agents" tab
2. Click "Submit New Agent" (or equivalent button)
3. Fill in agent details:
   - Agent name: "Test AI Agent"
   - Description: "An AI agent for testing purposes"
   - Category: Select from dropdown
   - Tagline: "Testing the provider journey"
   - Add 1-2 use cases (title + description)
   - Add integrations (e.g., "Slack", "Salesforce")
4. Submit the agent
5. Verify: Success message, agent appears in the list with "Pending" status
6. Verify: Submission appears in Admin dashboard under "Agents" tab

### 4.4 Agents Tab — View Agent Detail
1. Click on the submitted agent in the list
2. Verify: Agent detail view shows all submitted information
3. Verify: Pending review status is indicated

### 4.5 Agents Tab — Edit Existing Agent
1. From agent detail, click "Edit"
2. Modify the tagline
3. Submit the edit
4. Verify: Success message, pending edit indicated on agent card

### 4.6 Team Tab — Invite & Manage Members
1. Switch to "Team" tab
2. Verify: Current user shows as "Owner"
3. Enter an email in the invite field
4. Click "Send Invite"
5. Verify: New member appears in the list with "Pending" status
6. Sign in or sign up as the invited email
7. Verify: User is redirected into provider flow and the pending team invite auto-activates
8. Return to the owner account and verify: Member now shows as "Active"
9. Click "Remove" on the invited member
10. Verify: Member is removed from the list

---

## Phase 5: Cross-Feature Verification

### 5.1 Company Page Update
1. Navigate to the claimed company's public page (`/companies/{slug}`)
2. Verify: Shows "Verified Company" badge (claim_status: claimed)
3. Verify: "Claim This Profile" button is gone or shows "Already claimed"

### 5.2 Directory Integration
1. Navigate to `/directory`
2. Search for the company
3. Verify: Company card shows in results
4. Navigate to a category page that includes the company's agents
5. Verify: Agent cards show correct company name (not "Unknown")

### 5.3 Console Health
1. Check browser console on each page visited
2. Verify: No 4xx/5xx errors (except known WebGL warning from Paper Shaders)
3. Verify: No unhandled promise rejections

---

## Expected Results

| Phase | Expected Outcome |
|-------|-----------------|
| Phase 1 | Claim submitted, success page has navigation |
| Phase 2 | Admin approves with inline UI, magic link sent |
| Phase 3 | Provider account activated, role set, dashboard accessible |
| Phase 4 | All dashboard operations work (profile edit, agent CRUD, team management) |
| Phase 5 | Public pages reflect claimed status, no errors |
