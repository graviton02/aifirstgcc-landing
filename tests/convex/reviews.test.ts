import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@example.com",
};
const providerIdentity = {
  subject: "provider-owner-id",
  email: "owner@acme.example",
};
const gccIdentity = {
  subject: "gcc-user-id",
  email: "priya@gcc.example",
};
const nonGccIdentity = {
  subject: "no-profile-user-id",
  email: "other@gcc.example",
};

describe("review privacy", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("keeps public and provider review queries anonymous even when identity snapshots exist", async () => {
    const { agentId } = await seedReviewFixture(t);

    const publicData = await t.query(api.reviews.getAgentPublicData, {
      agent_id: agentId,
    });
    const providerData = await t
      .withIdentity(providerIdentity)
      .query(api.reviews.getCompanyReviews, {});

    expect(publicData?.reviews).toHaveLength(1);
    expect(publicData?.reviews[0]).toMatchObject({
      reviewer_label: "Anonymous GCC Buyer",
      title: "Reliable ops support",
    });
    expect(publicData?.reviews[0]).not.toHaveProperty("reviewer_name");
    expect(publicData?.reviews[0]).not.toHaveProperty("reviewer_organization");

    expect(providerData?.reviews).toHaveLength(1);
    expect(providerData?.reviews[0]).toMatchObject({
      reviewer_label: "Anonymous GCC Buyer",
      title: "Reliable ops support",
    });
    expect(providerData?.reviews[0]).not.toHaveProperty("reviewer_name");
    expect(providerData?.reviews[0]).not.toHaveProperty("reviewer_organization");
  });

  it("keeps reviewer identity visible in admin review history", async () => {
    await seedReviewFixture(t);

    const history = await t.withIdentity(adminIdentity).query(api.reviews.getReviewsHistory, {});

    expect(history.reviews).toHaveLength(1);
    expect(history.reviews[0]).toMatchObject({
      reviewer_name: "Priya Sharma",
      reviewer_organization: "Global Capability Center",
      title: "Reliable ops support",
    });
  });
});

describe("review eligibility", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("allows GCC profile users to create reviews without a provider request", async () => {
    const { agentId } = await seedReviewableAgent(t);
    await createGccProfile(t, gccIdentity);

    const eligibility = await t
      .withIdentity(gccIdentity)
      .query(api.reviews.getReviewEligibility, { agent_id: agentId });

    expect(eligibility).toMatchObject({
      canReview: true,
      canCreate: true,
      canEdit: false,
      reason: "eligible",
      existingReview: null,
    });

    const reviewId = await t.withIdentity(gccIdentity).mutation(
      api.reviews.createReview,
      {
        agent_id: agentId,
        ...buildReviewInput(),
      }
    );

    const review = await t.run((ctx) => ctx.db.get(reviewId));
    expect(review).toMatchObject({
      reviewer_id: gccIdentity.subject,
      reviewer_name: "Priya Sharma",
      reviewer_organization: "Global Capability Center",
      agent_id: agentId,
      status: "pending",
      title: "Reliable ops support",
    });
    expect(review?.provider_request_id).toBeUndefined();

    const updatedEligibility = await t
      .withIdentity(gccIdentity)
      .query(api.reviews.getReviewEligibility, { agent_id: agentId });

    expect(updatedEligibility).toMatchObject({
      canReview: true,
      canCreate: false,
      canEdit: true,
      reason: "existing_review",
    });
  });

  it("requires a GCC profile when no review exists", async () => {
    const { agentId } = await seedReviewableAgent(t);

    const eligibility = await t
      .withIdentity(nonGccIdentity)
      .query(api.reviews.getReviewEligibility, { agent_id: agentId });

    expect(eligibility).toMatchObject({
      canReview: false,
      canCreate: false,
      canEdit: false,
      reason: "gcc_profile_required",
      existingReview: null,
    });

    await expect(
      t.withIdentity(nonGccIdentity).mutation(api.reviews.createReview, {
        agent_id: agentId,
        ...buildReviewInput(),
      })
    ).rejects.toThrow("Complete your profile setup before leaving a review.");
  });

  it("blocks provider accounts from review eligibility and review creation", async () => {
    const { agentId } = await seedReviewableAgent(t);

    const eligibility = await t
      .withIdentity(providerIdentity)
      .query(api.reviews.getReviewEligibility, { agent_id: agentId });

    expect(eligibility).toMatchObject({
      canReview: false,
      canCreate: false,
      canEdit: false,
      reason: "provider_account_blocked",
      existingReview: null,
    });

    await expect(
      t.withIdentity(providerIdentity).mutation(api.reviews.createReview, {
        agent_id: agentId,
        ...buildReviewInput(),
      })
    ).rejects.toThrow("Provider accounts can't leave reviews.");
  });

  it("lets legacy reviews with provider_request_id be edited without rechecking provider request status", async () => {
    const { companyId, agentId } = await seedReviewableAgent(t);
    await createGccProfile(t, gccIdentity);

    const now = Date.now();
    const providerRequestId = await t.run((ctx) =>
      ctx.db.insert("providerRequests", {
        company_id: companyId,
        gcc_user_id: gccIdentity.subject,
        gcc_name: "Priya Sharma",
        gcc_email: "priya@gcc.example",
        gcc_organization: "Global Capability Center",
        gcc_industry: "Financial Services (BFSI)",
        agent_id: agentId,
        status: "pending_admin",
        created_at: now,
      })
    );

    const reviewId = await t.run((ctx) =>
      ctx.db.insert("reviews", {
        reviewer_id: gccIdentity.subject,
        reviewer_name: "Priya Sharma",
        reviewer_organization: "Global Capability Center",
        provider_request_id: providerRequestId,
        agent_id: agentId,
        company_id: companyId,
        ...buildReviewInput(),
        status: "approved",
        created_at: now,
        updated_at: now,
        reviewed_at: now,
      })
    );

    await t.withIdentity(gccIdentity).mutation(api.reviews.updateMyReview, {
      review_id: reviewId,
      ...buildUpdatedReviewInput(),
    });

    const updatedReview = await t.run((ctx) => ctx.db.get(reviewId));
    expect(updatedReview).toMatchObject({
      provider_request_id: providerRequestId,
      title: "Updated ops review",
      status: "pending",
    });
    expect(updatedReview?.reviewed_at).toBeUndefined();
  });
});

async function seedReviewableAgent(t: ReturnType<typeof createTestConvex>) {
  const now = Date.now();

  return await t.run(async (ctx) => {
    const companyId = await ctx.db.insert("companies", {
      slug: "acme-ai",
      name: "Acme AI",
      description: "Builds AI systems for enterprise operations.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      primary_verticals: ["Technology"],
      verification_status: "verified",
      claim_status: "claimed",
      created_at: now,
      updated_at: now,
    });

    const agentId = await ctx.db.insert("agents", {
      slug: "ops-pilot",
      agent_name: "Ops Pilot",
      description: "Handles operational workflows.",
      category: "IT Operations",
      company_id: companyId,
      use_cases: [],
      status: "active",
      created_at: now,
      updated_at: now,
    });

    await ctx.db.insert("companyMembers", {
      company_id: companyId,
      user_id: providerIdentity.subject,
      email: providerIdentity.email,
      role: "owner",
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return { companyId, agentId };
  });
}

async function seedReviewFixture(t: ReturnType<typeof createTestConvex>) {
  const { companyId, agentId } = await seedReviewableAgent(t);
  const now = Date.now();

  await t.run(async (ctx) => {
    const providerRequestId = await ctx.db.insert("providerRequests", {
      company_id: companyId,
      gcc_user_id: gccIdentity.subject,
      gcc_name: "Priya Sharma",
      gcc_email: "priya@gcc.example",
      gcc_organization: "Global Capability Center",
      gcc_industry: "Financial Services (BFSI)",
      agent_id: agentId,
      status: "contacted",
      created_at: now,
      contacted_at: now,
    });

    await ctx.db.insert("reviews", {
      reviewer_id: gccIdentity.subject,
      reviewer_name: "Priya Sharma",
      reviewer_organization: "Global Capability Center",
      provider_request_id: providerRequestId,
      agent_id: agentId,
      company_id: companyId,
      ...buildReviewInput(),
      status: "approved",
      created_at: now,
      updated_at: now,
      reviewed_at: now,
    });

    await ctx.db.patch(agentId, {
      rating: 4,
      rating_effectiveness: 3,
      rating_value: 2,
      review_count: 1,
      updated_at: now,
    });

  });

  return { companyId, agentId };
}

async function createGccProfile(
  t: ReturnType<typeof createTestConvex>,
  identity: { subject: string; email: string }
) {
  await t.withIdentity(identity).mutation(api.gccProfiles.createProfile, {
    name: "Priya Sharma",
    email: identity.email,
    organization: "Global Capability Center",
    industry: "Financial Services (BFSI)",
  });
}

function buildReviewInput() {
  return {
    title: "Reliable ops support",
    rating_overall: 4,
    rating_effectiveness: 3,
    rating_value: 2,
    pros:
      "The workflow improved our ticket triage quality and gave us better operational consistency.",
    cons:
      "The first implementation pass took longer than expected and needed better handoff detail.",
    use_case: "Incident triage automation",
  };
}

function buildUpdatedReviewInput() {
  return {
    title: "Updated ops review",
    rating_overall: 5,
    rating_effectiveness: 4,
    rating_value: 4,
    pros:
      "The second rollout was smoother and the operating model fit our incident triage process much better.",
    cons:
      "Reporting still needs more flexibility for leadership updates across multiple business units.",
    use_case: "Updated incident triage automation",
  };
}
