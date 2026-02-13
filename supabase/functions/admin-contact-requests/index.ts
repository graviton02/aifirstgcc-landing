import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: {
    action: string;
    session_token: string;
    request_id?: string;
    admin_notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action, session_token, request_id, admin_notes } = body;

  if (!action || !session_token) {
    return json({ error: "action and session_token are required" }, 400);
  }

  // --------------------------------------------------------------------------
  // Validate admin session
  // --------------------------------------------------------------------------
  const { data: session, error: sessionError } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("session_token", session_token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (sessionError || !session) {
    return json({ error: "Invalid or expired admin session" }, 401);
  }

  // --------------------------------------------------------------------------
  // Route by action
  // --------------------------------------------------------------------------
  switch (action) {
    case "list":
      return handleList(supabase);

    case "approve":
      if (!request_id) return json({ error: "request_id is required" }, 400);
      return handleApprove(supabase, request_id);

    case "reject":
      if (!request_id) return json({ error: "request_id is required" }, 400);
      return handleReject(supabase, request_id, admin_notes ?? null);

    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
});

// ---------------------------------------------------------------------------
// List all pending_admin requests with joined names
// ---------------------------------------------------------------------------
async function handleList(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("provider_requests")
    .select(
      `
      *,
      agents:agent_id ( agent_name ),
      provider_profiles:provider_profile_id ( company_name, contact_email:gcc_user_email )
    `
    )
    .eq("status", "pending_admin")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  // Flatten joined data for easier frontend consumption
  const requests = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    gcc_user_email: r.gcc_user_email,
    gcc_org_id: r.gcc_org_id,
    gcc_user_id: r.gcc_user_id,
    agent_id: r.agent_id,
    message: r.message,
    created_at: r.created_at,
    agent_name:
      (r.agents as Record<string, unknown> | null)?.agent_name ?? null,
    provider_company_name:
      (r.provider_profiles as Record<string, unknown> | null)?.company_name ??
      null,
  }));

  return json({ requests });
}

// ---------------------------------------------------------------------------
// Approve a request → send email notification to provider
// ---------------------------------------------------------------------------
async function handleApprove(
  supabase: ReturnType<typeof createClient>,
  requestId: string
) {
  // 1. Update status
  const { data: request, error: updateError } = await supabase
    .from("provider_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending_admin")
    .select(
      `
      *,
      agents:agent_id ( agent_name ),
      provider_profiles:provider_profile_id ( company_name, contact_email:gcc_user_email )
    `
    )
    .single();

  if (updateError) return json({ error: updateError.message }, 500);
  if (!request) return json({ error: "Request not found or already reviewed" }, 404);

  // 2. Attempt email notification (best-effort — don't fail the approval)
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (resendApiKey) {
    try {
      const agentName =
        (request.agents as Record<string, unknown> | null)?.agent_name ??
        "your agent";

      // Get the provider's actual email from their profile
      const { data: profile } = await supabase
        .from("provider_profiles")
        .select("user_id")
        .eq("id", request.provider_profile_id)
        .single();

      // We need the provider's email — for now use the company_name from the profile
      // In production, you'd look up the user's email from Clerk or a users table
      const providerCompany =
        (request.provider_profiles as Record<string, unknown> | null)
          ?.company_name ?? "Provider";

      // Only send if we have the API key configured
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orbys360 <team@orbys360.com>",
          to: [request.gcc_user_email], // This is the provider contact email from the join
          subject: `New Contact Request for ${agentName}`,
          html: `
            <h2>New Contact Request</h2>
            <p>Hi ${providerCompany},</p>
            <p>A GCC organization wants to connect about your agent <strong>${agentName}</strong>.</p>
            <p>Log in to your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to view the details.</p>
            <br/>
            <p>— The Orbys360 Team</p>
          `,
        }),
      });
    } catch {
      // Email delivery failure is non-blocking
      console.error("Failed to send approval email notification");
    }
  }

  return json({ success: true, request_id: requestId });
}

// ---------------------------------------------------------------------------
// Reject a request
// ---------------------------------------------------------------------------
async function handleReject(
  supabase: ReturnType<typeof createClient>,
  requestId: string,
  notes: string | null
) {
  const { error } = await supabase
    .from("provider_requests")
    .update({
      status: "rejected",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending_admin");

  if (error) return json({ error: error.message }, 500);

  return json({ success: true, request_id: requestId });
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
