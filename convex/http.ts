import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

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

export default http;
