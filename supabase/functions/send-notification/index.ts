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

  let body: {
    type: string;
    problem_statement_id?: string;
    provider_user_email?: string;
    submission_id?: string;
    table?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (body.type === "interest_expressed") {
    const { problem_statement_id, provider_user_email } = body;

    if (!problem_statement_id) {
      return json({ error: "problem_statement_id is required" }, 400);
    }

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!adminEmail || !resendApiKey) {
      return json({ sent: false, reason: "notification not configured" });
    }

    // Look up problem title
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: problem } = await supabase
      .from("problem_statements")
      .select("title")
      .eq("id", problem_statement_id)
      .single();

    const problemTitle = problem?.title ?? "Unknown Problem";

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orbys360 <team@orbys360.com>",
          to: [adminEmail],
          subject: `New Interest Expressed: ${problemTitle}`,
          html: `
            <h2>Interest Expressed</h2>
            <p>A provider has expressed interest in a problem statement.</p>
            <p><strong>Problem:</strong> ${problemTitle}</p>
            ${provider_user_email ? `<p><strong>Provider contact:</strong> ${provider_user_email}</p>` : ""}
            <p>Log in to the <a href="https://orbys360.com/admin">Admin Dashboard</a> to review and facilitate the introduction.</p>
            <br/>
            <p>— Orbys360 System</p>
          `,
        }),
      });

      return json({ sent: true });
    } catch {
      console.error("Failed to send interest notification email");
      return json({ sent: false, reason: "email delivery failed" });
    }
  }

  // -------------------------------------------------------------------------
  // Admin alert: new provider submission
  // -------------------------------------------------------------------------
  if (body.type === "provider_submission") {
    const { submission_id, table } = body;

    if (!submission_id || !table) {
      return json({ error: "submission_id and table are required" }, 400);
    }

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!adminEmail || !resendApiKey) {
      return json({ sent: false, reason: "notification not configured" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: submission } = await supabase
      .from(table)
      .select("company_name, contact_email")
      .eq("id", submission_id)
      .single();

    const companyName = submission?.company_name ?? "Unknown Company";
    const contactEmail = submission?.contact_email ?? "";

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orbys360 <team@orbys360.com>",
          to: [adminEmail],
          subject: `New Provider Submission: ${companyName}`,
          html: `
            <h2>New Provider Submission</h2>
            <p>A provider has finalized their onboarding form and is awaiting review.</p>
            <p><strong>Company:</strong> ${companyName}</p>
            ${contactEmail ? `<p><strong>Contact:</strong> ${contactEmail}</p>` : ""}
            <p><strong>Type:</strong> ${table === "tsp_submissions" ? "Technology Service Provider" : "Startup"}</p>
            <p>Log in to the <a href="https://orbys360.com/admin">Admin Dashboard</a> to review and approve.</p>
            <br/>
            <p>— Orbys360 System</p>
          `,
        }),
      });

      return json({ sent: true });
    } catch {
      console.error("Failed to send provider submission notification email");
      return json({ sent: false, reason: "email delivery failed" });
    }
  }

  // -------------------------------------------------------------------------
  // Admin alert: new agent submission
  // -------------------------------------------------------------------------
  if (body.type === "agent_submission") {
    const { submission_id } = body;

    if (!submission_id) {
      return json({ error: "submission_id is required" }, 400);
    }

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!adminEmail || !resendApiKey) {
      return json({ sent: false, reason: "notification not configured" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: agent } = await supabase
      .from("agent_submissions")
      .select("agent_name, provider_profile_id")
      .eq("id", submission_id)
      .single();

    const agentName = agent?.agent_name ?? "Unknown Agent";
    let companyName = "Unknown Provider";

    if (agent?.provider_profile_id) {
      // Try TSP first, then startup
      const { data: tsp } = await supabase
        .from("tsp_submissions")
        .select("company_name")
        .eq("provider_profile_id", agent.provider_profile_id)
        .single();

      if (tsp?.company_name) {
        companyName = tsp.company_name;
      } else {
        const { data: startup } = await supabase
          .from("startup_submissions")
          .select("company_name")
          .eq("provider_profile_id", agent.provider_profile_id)
          .single();

        if (startup?.company_name) {
          companyName = startup.company_name;
        }
      }
    }

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orbys360 <team@orbys360.com>",
          to: [adminEmail],
          subject: `New Agent Submission: ${agentName} by ${companyName}`,
          html: `
            <h2>New Agent Submission</h2>
            <p>A provider has submitted a new agent for review.</p>
            <p><strong>Agent:</strong> ${agentName}</p>
            <p><strong>Provider:</strong> ${companyName}</p>
            <p>Log in to the <a href="https://orbys360.com/admin">Admin Dashboard</a> to review and approve.</p>
            <br/>
            <p>— Orbys360 System</p>
          `,
        }),
      });

      return json({ sent: true });
    } catch {
      console.error("Failed to send agent submission notification email");
      return json({ sent: false, reason: "email delivery failed" });
    }
  }

  return json({ error: `Unknown notification type: ${body.type}` }, 400);
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
