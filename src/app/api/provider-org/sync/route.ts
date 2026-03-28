import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { reportError } from "@/lib/report-error";

export async function POST() {
  const authState = await auth();
  if (!authState.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await authState.getToken();
  if (!token) {
    return NextResponse.json({ error: "Unable to authenticate with Convex." }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({
      userId: authState.userId,
      limit: 100,
    });

    const result = await fetchMutation(
      api.companyMembers.syncClerkMemberships,
      {
        memberships: memberships.data.map((membership) => ({
          clerk_org_id: membership.organization.id,
          role: membership.role,
        })),
      },
      { token }
    );

    if (result.synced_count > 0) {
      await client.users.updateUserMetadata(authState.userId, {
        publicMetadata: { role: "provider" },
      });
    }

    return NextResponse.json(result);
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
      { error: "Failed to sync provider organization memberships." },
      { status: 500 }
    );
  }
}
