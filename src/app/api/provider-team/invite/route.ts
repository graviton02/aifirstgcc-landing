import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { ensureProviderOrganization } from "@/lib/provider-organizations";
import { getErrorMessage, getErrorStatus, reportError } from "@/lib/report-error";

const INVITE_ERROR_STATUS: Record<string, number> = {
  "Unable to authenticate with Convex": 401,
  "No active provider company found": 404,
  "Email is required": 400,
  "You are already the owner of this company": 400,
  "That email already has access to this company": 400,
  "An invite is already pending for that email": 400,
  "Only the company owner can manage team members": 403,
};

export async function POST(req: Request) {
  const authState = await auth();
  if (!authState.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  let memberId: string | null = null;
  let token: string | null = null;
  let invitationCreated = false;

  try {
    const ensured = await ensureProviderOrganization(authState);
    token = ensured.token;

    if (ensured.company.membership_role !== "owner") {
      return NextResponse.json({ error: "Only company owners can invite team members." }, { status: 403 });
    }

    memberId = await fetchMutation(
      api.companyMembers.inviteMember,
      {
        company_id: ensured.company._id,
        email,
      },
      { token }
    );

    const client = await clerkClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: ensured.clerkOrgId,
      emailAddress: email,
      role: "org:member",
      inviterUserId: authState.userId,
      redirectUrl: `${baseUrl}/auth-redirect`,
      expiresInDays: 7,
      publicMetadata: {
        companyId: ensured.company._id,
        companySlug: ensured.company.slug,
      },
      privateMetadata: {
        companyMemberId: memberId,
      },
    });

    invitationCreated = true;

    try {
      await fetchMutation(
        api.companyMembers.recordClerkInvitation,
        {
          member_id: memberId as any,
          clerk_invitation_id: invitation.id,
          invite_url: invitation.url ?? undefined,
          invite_expires_at: invitation.expiresAt,
        },
        { token }
      );
    } catch {
      // Non-fatal: the invitation email has already been sent by Clerk.
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (memberId && token && !invitationCreated) {
      try {
        await fetchMutation(
          api.companyMembers.removeMember,
          { member_id: memberId as any },
          { token }
        );
      } catch {
        // Best effort rollback only.
      }
    }

    const message = getErrorMessage(error, "Failed to send team invite.");
    const status = getErrorStatus(error) ?? INVITE_ERROR_STATUS[message] ?? 500;

    if (status >= 500) {
      reportError(error, {
        tags: {
          area: "api",
          feature: "provider-team-invite",
          route: "/api/provider-team/invite",
        },
        extra: {
          email,
          invitationCreated,
          memberIdPresent: Boolean(memberId),
        },
      });
    }

    return NextResponse.json(
      { error: status >= 500 ? "Failed to send team invite." : message },
      { status }
    );
  }
}
