import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    await request.text();
    // Webhook verification and user sync logic
    // Will be implemented when Clerk webhook is configured
    return new Response("OK", { status: 200 });
  }),
});

http.route({
  path: "/ai-pulse/generate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.AI_PULSE_TRIGGER_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let dateOverride: string | undefined;
    try {
      const body = await request.json();
      dateOverride = body.date;
    } catch {
      // No body or invalid JSON — will use today's date
    }

    await ctx.scheduler.runAfter(0, internal.aiPulse.generateDailyBrief, {
      date_override: dateOverride,
    });

    return new Response(
      JSON.stringify({
        status: "scheduled",
        date: dateOverride ?? new Date().toISOString().slice(0, 10),
      }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
