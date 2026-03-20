import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VALID_ROLES = ["gcc", "provider"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const role = body.role as Role;
  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("[set-role] Clerk error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to set role. Please try again." },
      { status: 500 }
    );
  }
}
