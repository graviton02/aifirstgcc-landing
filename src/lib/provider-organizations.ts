import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

type ServerAuth = Awaited<ReturnType<typeof auth>>;

async function getConvexToken(authState: ServerAuth) {
  const token = await authState.getToken({ template: "convex" });
  if (!token) {
    throw new Error("Unable to authenticate with Convex");
  }
  return token;
}

export async function getMyProviderCompany(authState: ServerAuth) {
  const token = await getConvexToken(authState);
  const company = await fetchQuery(api.companyMembers.getMyCompany, {}, { token });
  return { token, company };
}

export async function ensureProviderOrganization(authState: ServerAuth) {
  if (!authState.userId) {
    throw new Error("Unauthorized");
  }

  const { token, company } = await getMyProviderCompany(authState);
  if (!company) {
    throw new Error("No active provider company found");
  }

  const client = await clerkClient();
  let clerkOrgId = company.clerk_org_id;

  if (!clerkOrgId) {
    let organization;

    try {
      organization = await client.organizations.createOrganization({
        name: company.name,
        slug: company.slug,
        createdBy: authState.userId,
        publicMetadata: {
          companyId: company._id,
          companySlug: company.slug,
        },
      });
    } catch {
      organization = await client.organizations.getOrganization({ slug: company.slug });
    }

    clerkOrgId = organization.id;
    await fetchMutation(
      api.companies.attachClerkOrganization,
      {
        company_id: company._id,
        clerk_org_id: clerkOrgId,
      },
      { token }
    );
  }

  const memberships = await client.users.getOrganizationMembershipList({
    userId: authState.userId,
    limit: 100,
  });

  const alreadyMember = memberships.data.some((membership) => membership.organization.id === clerkOrgId);
  if (!alreadyMember) {
    await client.organizations.createOrganizationMembership({
      organizationId: clerkOrgId,
      userId: authState.userId,
      role: company.membership_role === "owner" ? "org:admin" : "org:member",
    });
  }

  return {
    token,
    company: {
      ...company,
      clerk_org_id: clerkOrgId,
    },
    clerkOrgId,
  };
}
