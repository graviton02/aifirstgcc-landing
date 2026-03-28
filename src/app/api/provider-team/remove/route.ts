import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { getMyProviderCompany } from "@/lib/provider-organizations";
import { getErrorMessage, getErrorStatus, reportError } from "@/lib/report-error";

const REMOVE_MEMBER_ERROR_STATUS: Record<string, number> = {
  "Unable to authenticate with Convex": 401,
  "No active provider company found": 404,
  "Member not found": 404,
  "Cannot remove the company owner": 400,
  "Only the company owner can manage team members": 403,
  "Not authorized for this company": 403,
};

export async function POST(req: Request) {
  const authState = await auth();
  if (!authState.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { memberId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.memberId) {
    return NextResponse.json({ error: "Member id is required." }, { status: 400 });
  }

  try {
    const { token, company } = await getMyProviderCompany(authState);
    if (!company) {
      return NextResponse.json({ error: "No active provider company found." }, { status: 404 });
    }

    const member = await fetchQuery(
      api.companyMembers.getMember,
      { member_id: body.memberId as any },
      { token }
    );

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (company.clerk_org_id) {
      const client = await clerkClient();

      if (member.user_id) {
        try {
          await client.organizations.deleteOrganizationMembership({
            organizationId: company.clerk_org_id,
            userId: member.user_id,
          });
        } catch {
          // Continue with local cleanup even if Clerk already removed the membership.
        }
      } else if (member.clerk_invitation_id) {
        try {
          await client.organizations.revokeOrganizationInvitation({
            organizationId: company.clerk_org_id,
            invitationId: member.clerk_invitation_id,
            requestingUserId: authState.userId,
          });
        } catch {
          // Continue with local cleanup even if the invitation is already gone.
        }
      }
    }

    await fetchMutation(
      api.companyMembers.removeMember,
      { member_id: body.memberId as any },
      { token }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = getErrorMessage(error, "Failed to remove team member.");
    const status = getErrorStatus(error) ?? REMOVE_MEMBER_ERROR_STATUS[message] ?? 500;

    if (status >= 500) {
      reportError(error, {
        tags: {
          area: "api",
          feature: "provider-team-remove",
          route: "/api/provider-team/remove",
        },
        extra: {
          memberId: body.memberId,
        },
      });
    }

    return NextResponse.json(
      { error: status >= 500 ? "Failed to remove team member." : message },
      { status }
    );
  }
}
