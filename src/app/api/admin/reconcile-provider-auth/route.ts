import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { reportError } from "@/lib/report-error";

type ReconciliationSnapshot = {
  companies: Array<{
    company_id: Id<"companies">;
    name: string;
    slug: string;
    clerk_org_id: string | null;
    members: Array<{
      user_id?: string;
      email: string;
      role: "owner" | "member";
    }>;
  }>;
  users: Array<{
    user_id: string;
    role: "provider" | "gcc" | null;
  }>;
};

function getDesiredClerkRole(role: "owner" | "member") {
  return role === "owner" ? "org:admin" : "org:member";
}

async function getUserOrganizationIds(
  client: Awaited<ReturnType<typeof clerkClient>>,
  cache: Map<string, Set<string>>,
  userId: string
) {
  if (cache.has(userId)) {
    return cache.get(userId)!;
  }

  const memberships = await client.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });
  const organizationIds = new Set(
    memberships.data.map((membership) => membership.organization.id)
  );
  cache.set(userId, organizationIds);
  return organizationIds;
}

async function ensureOrganizationForCompany({
  client,
  token,
  createdBy,
  company,
}: {
  client: Awaited<ReturnType<typeof clerkClient>>;
  token: string;
  createdBy: string;
  company: ReconciliationSnapshot["companies"][number];
}) {
  if (company.clerk_org_id) {
    return { clerkOrgId: company.clerk_org_id, created: false };
  }

  let organizationId: string;

  try {
    const created = await client.organizations.createOrganization({
      name: company.name,
      slug: company.slug,
      createdBy,
      publicMetadata: {
        companyId: company.company_id,
        companySlug: company.slug,
      },
    });
    organizationId = created.id;
  } catch {
    const existing = await client.organizations.getOrganization({ slug: company.slug });
    organizationId = existing.id;
  }

  await fetchMutation(
    api.admin.setCompanyClerkOrganization,
    {
      company_id: company.company_id,
      clerk_org_id: organizationId,
    },
    { token }
  );

  return { clerkOrgId: organizationId, created: true };
}

export async function POST() {
  const authState = await auth();
  if (!authState.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await authState.getToken({ template: "convex" });
    if (!token) {
      return NextResponse.json(
        { error: "Unable to authenticate with Convex." },
        { status: 401 }
      );
    }

    const viewerAccess = await fetchQuery(api.admin.getViewerAccess, {}, { token });
    if (!viewerAccess.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const snapshot = await fetchQuery(api.admin.getAuthReconciliationSnapshot, {}, { token });
    const client = await clerkClient();
    const membershipCache = new Map<string, Set<string>>();

    let organizationsLinked = 0;
    let membershipsEnsured = 0;
    let usersUpdated = 0;

    for (const company of snapshot.companies) {
      const { clerkOrgId, created } = await ensureOrganizationForCompany({
        client,
        token,
        createdBy: authState.userId,
        company,
      });
      if (created) {
        organizationsLinked += 1;
      }

      for (const member of company.members) {
        if (!member.user_id) {
          continue;
        }

        const organizationIds = await getUserOrganizationIds(
          client,
          membershipCache,
          member.user_id,
        );

        if (!organizationIds.has(clerkOrgId)) {
          await client.organizations.createOrganizationMembership({
            organizationId: clerkOrgId,
            userId: member.user_id,
            role: getDesiredClerkRole(member.role),
          });
          organizationIds.add(clerkOrgId);
          membershipsEnsured += 1;
        }
      }
    }

    for (const user of snapshot.users) {
      await client.users.updateUserMetadata(user.user_id, {
        publicMetadata: { role: user.role },
      });
      usersUpdated += 1;
    }

    return NextResponse.json({
      success: true,
      organizationsLinked,
      membershipsEnsured,
      usersUpdated,
      companyCount: snapshot.companies.length,
      userCount: snapshot.users.length,
    });
  } catch (error) {
    reportError(error, {
      tags: {
        area: "api",
        feature: "admin-reconcile-provider-auth",
        route: "/api/admin/reconcile-provider-auth",
      },
      userId: authState.userId,
    });

    return NextResponse.json(
      { error: "Failed to reconcile provider auth state." },
      { status: 500 }
    );
  }
}
