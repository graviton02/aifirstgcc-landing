"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendAdminAlert = internalAction({
  args: {
    type: v.string(),
    submission_id: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!resendApiKey || !adminEmail) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orbys360 <noreply@orbys360.com>",
        to: adminEmail,
        subject: `New ${args.type} submission on Orbys360`,
        html: `<p>A new ${args.type} has been submitted. Please review it in the admin dashboard.</p>`,
      }),
    });
  },
});
