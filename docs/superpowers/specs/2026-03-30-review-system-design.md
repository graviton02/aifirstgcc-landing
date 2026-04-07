# Review System Design Spec

> **Date:** 2026-03-30
> **Status:** Revised Draft
> **Scope:** Agent-level reviews with provider responses, company rollups, and full platform integration

## Context

Orbys360 is an AI agent marketplace for the GCC market. Buyers can already browse agents, shortlist them, compare them, and submit provider contact requests. The platform also has a managed interaction lifecycle:

- GCC buyer submits a `providerRequest`
- Admin approves the request
- Provider marks the request `contacted`

That lifecycle still matters for notifications and provider follow-up, but it no longer gates review eligibility. Reviews are open to signed-in GCC users with completed GCC profiles on active, claimed agent listings.

The schema already has placeholder `rating` and `review_count` fields on the `agents` table, but there is no review schema, moderation flow, or review UI yet.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Coverage | Claimed, provider-owned agents only | Reviews should only exist where a provider team can respond and moderation can be enforced |
| Eligibility | GCC profile required | Buyer must be a signed-in GCC user with a completed GCC profile; provider-role accounts are blocked |
| Review model | One review per buyer per agent | Keeps public reputation stable while still allowing buyers to edit their existing review |
| Moderation | Pre-publish with audit history | Public trust requires review and response moderation before publication |
| Provider responses | One response per review, editable with re-moderation | Gives providers a public reply path without bypassing moderation |
| Company aggregate | Weighted, server-side rollup | Prevents mathematically incorrect averages and supports SSR + JSON-LD |
| Admin alerts | Email alert + admin queue counts | Matches the current admin architecture; admin is not a recipient in the user notifications table |
| UI scope | Full integration | Agent detail, directory cards, compare, provider dashboard, GCC dashboard, admin dashboard, SEO |

## Eligibility and Verification

Public reviews are **not** open to any authenticated user.

A buyer is eligible to create a review for an agent only when all of the following are true:

1. The user is signed in.
2. The user is a GCC buyer with a completed GCC profile.
3. The agent belongs to a claimed company.
4. The user is not operating as a provider account.

Implementation choice:

- Reviews are GCC-profile-verified, not interaction-verified.
- `provider_request_id` is optional provenance only when a review originated from a reachout flow.
- The agent page can still expose the review surface organically, but the CTA state depends on eligibility:
  - Anonymous: sign-up CTA
  - Signed-in user without a GCC profile: profile-completion CTA
  - Eligible GCC with no review: "Write a Review"
  - Eligible GCC with an existing review: "Edit Your Review"
  - Provider account: no review CTA

This means unclaimed or unmanaged agents do not support reviews until they are claimed, but no prior provider interaction is required.

## Data Model

### `reviews` table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviewer_id` | string | yes | Clerk user ID of the GCC buyer |
| `reviewer_name` | string | yes | Snapshot of buyer display name at submission time |
| `reviewer_organization` | string | no | Snapshot of buyer organization for public credibility |
| `provider_request_id` | ref (`providerRequests`) | no | Optional provenance when the review came from a managed reachout flow |
| `agent_id` | ref (`agents`) | yes | Agent being reviewed |
| `company_id` | ref (`companies`) | yes | Denormalized from the agent for query efficiency |
| `rating_overall` | number (1-5) | yes | Primary star rating |
| `rating_effectiveness` | number (1-5) | yes | "Does it solve the problem?" |
| `rating_value` | number (1-5) | yes | "Value for money" |
| `title` | string | yes | Review headline |
| `pros` | string | yes | What went well (min 50 chars) |
| `cons` | string | yes | What could improve (min 50 chars) |
| `use_case` | string | no | What the buyer used the agent for |
| `status` | string | yes | `pending` / `approved` / `rejected` / `flagged` / `removed` |
| `moderation_reason` | string | no | User-visible rejection or removal reason |
| `admin_notes` | string | no | Internal moderation notes, never shown publicly |
| `created_at` | number | yes | Creation timestamp |
| `updated_at` | number | yes | Last buyer edit timestamp |
| `reviewed_at` | number | no | Timestamp of latest moderation decision |

**Indexes:**

- `by_agent_status_created` - `agent_id`, `status`, `created_at`
- `by_reviewer` - `reviewer_id`, `created_at`
- `by_reviewer_agent` - `reviewer_id`, `agent_id`
- `by_company_status_created` - `company_id`, `status`, `created_at`
- `by_status_created` - `status`, `created_at`
- `by_provider_request` - `provider_request_id`

**Constraints:**

- One review per buyer per agent.
- Review creation requires a signed-in GCC user with a completed GCC profile.
- Provider-role accounts cannot create or edit reviews.
- Buyers may edit only their own review.
- Admin removal is soft removal by setting `status = "removed"`; rows are retained for history and auditing.

### `reviewResponses` table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `review_id` | ref (`reviews`) | yes | The review being responded to |
| `company_id` | ref (`companies`) | yes | Provider company that owns the reviewed agent |
| `responder_id` | string | yes | Clerk user ID of the provider member |
| `responder_name` | string | no | Snapshot of provider member display name |
| `body` | string | yes | Public response text |
| `status` | string | yes | `pending` / `approved` / `rejected` / `removed` |
| `moderation_reason` | string | no | User-visible rejection or removal reason |
| `admin_notes` | string | no | Internal moderation notes |
| `created_at` | number | yes | Creation timestamp |
| `updated_at` | number | yes | Last provider edit timestamp |
| `reviewed_at` | number | no | Timestamp of latest moderation decision |

**Indexes:**

- `by_review` - `review_id`
- `by_company_status_created` - `company_id`, `status`, `created_at`
- `by_status_created` - `status`, `created_at`

**Constraints:**

- One response per review.
- Only active provider members of the same `company_id` as the review may create or edit the response.
- Response removal is soft removal by setting `status = "removed"`.

### Denormalized fields on `agents` table

The existing agent fields remain the public summary source:

- `rating` - weighted average of `rating_overall` across approved reviews
- `review_count` - count of approved reviews

Add two new denormalized fields:

- `rating_effectiveness` - average of `rating_effectiveness` across approved reviews
- `rating_value` - average of `rating_value` across approved reviews

These fields are recalculated whenever a review:

- becomes `approved`
- stops being `approved`
- changes ratings while approved
- becomes `removed`

If an agent has no approved reviews:

- `review_count = 0`
- `rating`, `rating_effectiveness`, and `rating_value` are cleared

### Company aggregate

Company rating is **not** stored on the company document.

It is computed server-side from active company agents using a weighted formula:

- `total_review_count = sum(agent.review_count)`
- `average_overall = sum(agent.rating * agent.review_count) / total_review_count`

Only active agents with `review_count > 0` contribute to the rollup.

This summary must be available to both the page UI and JSON-LD on the server. It should not be client-only.

## Read Model and Query Contracts

The feature touches SSR pages, client dashboards, admin queues, and JSON-LD. To avoid duplicated client stitching, add explicit review read models instead of having each screen fan out over raw tables.

### Public queries

`reviews.getAgentPublicData({ agent_id or slug, cursor?, limit? })`

Returns:

- review summary: overall rating, review count, effectiveness average, value average
- paginated approved reviews newest-first
- approved provider response nested on each review when present
- next cursor for "Load more"

`reviews.getCompanyPublicSummary({ company_id or slug })`

Returns:

- weighted overall rating
- total review count
- rated active agent count

### Viewer-specific GCC queries

`reviews.getReviewEligibility({ agent_id })`

Returns:

- `eligible: boolean`
- reason code when ineligible
- existing review id and status when present

`reviews.getMyReviews({ cursor?, limit? })`

Returns:

- buyer reviews across all agents newest-first
- agent + company summary
- status, moderation reason, updated_at, reviewed_at

### Provider queries

`reviews.getCompanyReviews({ agent_id?, status?, cursor?, limit? })`

Returns:

- reviews across the provider's company agents
- public review content and ratings
- nested response and response status when present
- aggregate summary for the tab header: average rating, total reviews, response rate

### Admin queries

`admin.getPendingReviews()`

`admin.getPendingReviewResponses()`

`admin.getReviewsHistory({ cursor?, limit? })`

`admin.getReviewResponsesHistory({ cursor?, limit? })`

History queries should return approved, rejected, flagged, and removed items with `reviewed_at`, `moderation_reason`, and `admin_notes`.

## Review Lifecycle

### Buyer review submission

1. GCC buyer opens an eligible agent page or a request entry that links back to the agent page.
2. Client calls `reviews.getReviewEligibility(agent_id)` to determine the CTA state.
3. If eligible and no existing review, show "Write a Review".
4. Buyer submits title, three ratings, pros, cons, and optional use case.
5. Mutation validates:
   - caller is a GCC buyer with a completed profile
   - caller is not a provider account
   - no existing review for the same `reviewer_id + agent_id`
6. Mutation creates the review with `status = "pending"`.
7. System sends an admin email alert and increments the admin queue count.

### Buyer review edit

1. If the buyer already has a review for the agent, the CTA becomes "Edit Your Review".
2. Form is pre-filled from the buyer's existing review.
3. On submit:
   - content is updated
   - `updated_at` is refreshed
   - `status` resets to `pending`
   - `moderation_reason`, `admin_notes`, and `reviewed_at` are cleared
4. If the prior version was approved, it is removed from the public page until the edited version is re-approved.

### Review moderation

Admin actions:

- **Approve**
  - `status = "approved"`
  - `reviewed_at = now`
  - recalculate agent denormalized rating fields
  - notify provider users that a new review is live

- **Reject**
  - `status = "rejected"`
  - `reviewed_at = now`
  - store `moderation_reason` for the buyer
  - store optional `admin_notes` for internal context
  - notify the buyer

- **Remove**
  - `status = "removed"`
  - `reviewed_at = now`
  - recalculate agent denormalized rating fields if the review had been approved
  - optionally notify the buyer if the review had previously been live

### Provider response submission

1. Active provider member opens the Reviews tab in the provider dashboard.
2. They can respond only to reviews for agents owned by their company.
3. If no response exists, CTA is "Respond".
4. If a response already exists, CTA is "Edit Response".
5. Mutation validates:
   - caller is an active provider member
   - caller's company matches `review.company_id`
   - only one response exists for the review
6. Response is created or updated with `status = "pending"` and `updated_at = now`.
7. System sends an admin email alert and increments the admin queue count.

### Provider response edit

Response editing is allowed for pending, rejected, and approved responses.

On every edit:

- response content is updated
- `status` resets to `pending`
- `moderation_reason`, `admin_notes`, and `reviewed_at` are cleared

If the prior version was approved, it is hidden from the public page until the new version is re-approved.

### Response moderation

Admin actions:

- **Approve**
  - `status = "approved"`
  - `reviewed_at = now`
  - notify the GCC buyer that the provider responded

- **Reject**
  - `status = "rejected"`
  - `reviewed_at = now`
  - store `moderation_reason` for the provider
  - store optional `admin_notes` internally

- **Remove**
  - `status = "removed"`
  - `reviewed_at = now`

## UI Integration

### Agent detail page (`/agents/[slug]`)

**AgentHero**

- Show star rating + review count next to the agent name when `review_count > 0`
- Example: `4.3 (12 reviews)`

**AgentStatsPanel**

- Show overall, effectiveness, and value averages from the agent denormalized fields
- Keep the panel hidden or simplified when `review_count === 0`

**ReviewsSection**

- Positioned below the existing detail sections
- CTA states:
  - anonymous: "Sign Up to Review"
  - signed-in without GCC profile: "Complete Your Profile"
  - eligible and no review: "Write a Review"
  - eligible with existing review: "Edit Your Review"
  - provider account: no CTA
- Public list:
  - approved reviews only
  - newest first
  - generic GCC review badge
  - anonymous GCC reviewer label only
  - review title, ratings, pros, cons, use case, created_at
  - approved provider response nested below the review
  - cursor pagination / "Load more"

### Directory cards (`AgentCard`)

- Render rating and review count only when `review_count > 0`
- No layout shift when the summary is absent

### Company detail page (`/companies/[slug]`)

**CompanyHeader**

- Show weighted overall rating and total review count when `total_review_count > 0`
- Compute from a server-side company summary query, not client-only math

### Compare page (`/compare`)

- Add a new "Rating" row
- Each cell shows overall rating + review count
- Use "No reviews yet" when `review_count === 0`

### GCC dashboard (`/gcc-dashboard`)

**New "My Reviews" tab**

- List all reviews by this buyer
- Status badges: pending, approved, rejected, removed
- Edit button for editable statuses
- Link back to the agent detail page
- Show `moderation_reason` on rejected or removed reviews

**Current Requests tab enhancement**

- For any request tied to an agent page, show "Leave a Review"
- If a review already exists, show "Edit Review"

### Provider dashboard (`/dashboard`)

**New "Reviews" tab**

- Summary bar:
  - weighted average rating across the company
  - total approved reviews
  - response rate
- Filters:
  - by agent
  - by review state / response state
- Review card:
  - agent name
  - review title + ratings
  - anonymous GCC reviewer label
  - review status
  - response status
  - respond / edit response CTA

### Admin dashboard (`/admin`)

**New "Reviews" tab**

Two subviews:

1. **Pending**
   - pending reviews queue
   - pending responses queue

2. **History**
   - approved / rejected / removed reviews
   - approved / rejected / removed responses

Admin cards should follow the existing moderation pattern already used in other admin tabs:

- approve / reject / remove actions
- optional internal admin notes
- user-visible moderation reason when rejecting or removing
- reviewed_at shown in history

**Overview tab**

- Add pending review count
- Add pending response count

## SEO / Structured Data

### Agent page `SoftwareApplication` JSON-LD

Add `aggregateRating` only when `review_count > 0`.

Also emit up to 10 most recent approved `Review` objects on the agent page.

Each review object should include:

- author name
- `datePublished`
- overall rating
- concise review body derived from title + pros + cons

### Company page `Organization` JSON-LD

Add `aggregateRating` only when `total_review_count > 0`.

The value must come from the same weighted server-side company summary used by the page UI.

## Notifications

### Admin alerts

Do **not** use the user notifications table for admin alerts.

Admin review alerts should use:

- the existing admin email alert mechanism
- admin queue counts on the dashboard overview and reviews tab

Reason:

- current user notifications are only for GCC and provider recipients
- admin is a password/session dashboard, not a user-recipient model

### GCC + provider user notifications

Use the existing user `notifications` table only for GCC and provider recipients.

New notification `type` values:

- `reviewApproved`
- `reviewRejected`
- `reviewResponseApproved`
- `reviewSolicitation`

Recommended `entity_type` usage:

- review lifecycle notifications -> `review`
- response lifecycle notifications -> `reviewResponse`
- solicitation notifications -> `providerRequest`

### Dedupe rules

Do not dedupe review lifecycle notifications solely by `review_id`.

Use lifecycle-aware dedupe keys:

- `reviewSolicitation` -> one per `provider_request_id`
- `reviewApproved` -> `review_id + reviewed_at`
- `reviewRejected` -> `review_id + reviewed_at`
- `reviewResponseApproved` -> `review_response_id + reviewed_at`

This allows a review or response to be edited, re-moderated, and re-notified correctly.

## Verification

### Manual testing

1. Anonymous visitor sees sign-up CTA instead of review form.
2. Signed-in provider user sees disabled review CTA.
3. GCC user without a contacted request sees ineligible review CTA.
4. Eligible GCC user submits a review and it appears in admin pending reviews.
5. Admin approves the review and the review appears publicly.
6. Verify `agents.rating`, `agents.review_count`, `agents.rating_effectiveness`, and `agents.rating_value` update correctly.
7. Verify directory cards and compare page show ratings after approval.
8. Verify company page shows the weighted company rollup.
9. GCC buyer edits an approved review and it disappears from public view until re-approved.
10. Provider submits a response and it appears in admin pending responses.
11. Admin approves the response and it appears nested under the review.
12. Provider edits an approved response and it disappears from public view until re-approved.
13. Admin rejects a review and the buyer sees the public moderation reason in "My Reviews".
14. Admin rejects a response and the provider sees the public moderation reason in the provider dashboard.
15. Verify a second review for the same buyer + agent is blocked.

### Automated tests

- Convex mutation tests:
  - create review with verified interaction
  - reject review creation without contacted request
  - one-review-per-buyer-per-agent enforcement
  - edit review resets status to pending
  - approve / reject / remove review flows
  - create / edit / approve / reject / remove response flows
- Aggregate tests:
  - agent denormalized fields after approval changes
  - weighted company rollup math
  - exclusion of inactive agents from company rollups
- Notification tests:
  - admin alert path uses admin alert mechanism, not user notifications
  - solicitation dedupe by `provider_request_id`
  - lifecycle notifications do not get suppressed after re-moderation
- Query tests:
  - public approved-review pagination
  - eligibility query behavior
  - provider review list filtering
  - admin pending + history queries
- Component tests:
  - agent ReviewsSection CTA states
  - review card and response card rendering
  - GCC My Reviews tab
  - provider Reviews tab
  - admin Reviews tab pending/history states
- JSON-LD tests:
  - agent `aggregateRating`
  - agent `Review` entries
  - company weighted `aggregateRating`

## Summary

This revised design intentionally trades breadth for trust:

- reviews are verified-only
- reviews exist only for claimed/provider-owned agents
- company aggregates are weighted and server-side
- admin alerts match the current architecture
- moderation has full history and re-moderation support
- the feature is backed by explicit read models instead of ad hoc client stitching
