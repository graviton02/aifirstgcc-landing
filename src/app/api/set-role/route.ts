import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { getAuthoritativeRole } from "@/auth/roles";
import { reportError } from "@/lib/report-error";

async function getDerivedRole(token: string) {
  const [company, gccProfile] = await Promise.all([
    fetchQuery(api.companyMembers.getMyCompany, {}, { token }),
    fetchQuery(api.gccProfiles.getProfile, {}, { token }),
  ]);

  return getAuthoritativeRole({
    hasProviderAccess: Boolean(company),
    hasGccProfile: Boolean(gccProfile),
  });
}

export async function POST() {
  let userId: string | null = null;
  let authState: Awaited<ReturnType<typeof auth>>;
  try {
    authState = await auth();
    userId = authState.userId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
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

    const role = await getDerivedRole(token);

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: role ?? null },
    });
    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    reportError(error, {
      tags: {
        area: "api",
        feature: "set-role",
        route: "/api/set-role",
      },
      extra: {
        userId,
      },
      userId,
    });
    return NextResponse.json(
      { error: "Failed to set role. Please try again." },
      { status: 500 }
    );
  }
}
