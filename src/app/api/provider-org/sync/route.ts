import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { reportError } from "@/lib/report-error";

export async function POST() {
  const authState = await auth();
  if (!authState.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({
      userId: authState.userId,
      limit: 100,
    });

    const linkedMemberships = await Promise.all(
      memberships.data.map(async (membership) => {
        const company = await fetchQuery(api.companies.getByClerkOrgId, {
          clerk_org_id: membership.organization.id,
        });

        return {
          clerk_org_id: membership.organization.id,
          clerk_role: membership.role,
          company_id: company?._id ?? null,
          company_slug: company?.slug ?? null,
        };
      })
    );

    return NextResponse.json({
      synced_count: 0,
      memberships: linkedMemberships,
    });
  } catch (error: any) {
    reportError(error, {
      tags: {
        area: "api",
        feature: "provider-org-sync",
        route: "/api/provider-org/sync",
      },
      userId: authState.userId,
    });

    return NextResponse.json(
      { error: "Failed to inspect provider organization memberships." },
      { status: 500 }
    );
  }
}
