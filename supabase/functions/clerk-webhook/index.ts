import { Webhook } from "https://esm.sh/svix@1.15.0";

Deno.serve(async (req) => {
  const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
  const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");

  if (!webhookSecret || !clerkSecretKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  // Verify Svix signature
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 401 });
  }

  const body = await req.text();

  let event: {
    type: string;
    data: {
      id: string;
      unsafe_metadata?: { role?: string };
    };
  };

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  // Only act on user.created events
  if (event.type !== "user.created") {
    return new Response("Event ignored", { status: 200 });
  }

  const role = event.data.unsafe_metadata?.role;

  // Only sync valid roles
  if (role !== "gcc" && role !== "provider") {
    return new Response("No valid role to sync", { status: 200 });
  }

  // Copy role to publicMetadata via Clerk Backend API
  const clerkRes = await fetch(
    `https://api.clerk.com/v1/users/${event.data.id}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: { role },
      }),
    }
  );

  if (!clerkRes.ok) {
    const errorText = await clerkRes.text();
    console.error("Clerk API error:", clerkRes.status, errorText);
    return new Response("Clerk API error", { status: 500 });
  }

  return new Response("Role synced to publicMetadata", { status: 200 });
});
