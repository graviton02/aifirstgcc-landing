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
    submission_id?: string;
    profile_id?: string;
    problem_id?: string;
    edit_id?: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action, session_token } = body;

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
    case "list-agents":
      return handleListAgents(supabase);

    case "approve-agent":
      if (!body.submission_id)
        return json({ error: "submission_id required" }, 400);
      return handleApproveAgent(supabase, body.submission_id);

    case "reject-agent":
      if (!body.submission_id)
        return json({ error: "submission_id required" }, 400);
      return handleRejectAgent(supabase, body.submission_id, body.notes ?? null);

    case "request-changes-agent":
      if (!body.submission_id)
        return json({ error: "submission_id required" }, 400);
      return handleRequestChangesAgent(
        supabase,
        body.submission_id,
        body.notes ?? null
      );

    case "list-providers":
      return handleListProviders(supabase);

    case "approve-provider":
      if (!body.profile_id)
        return json({ error: "profile_id required" }, 400);
      return handleApproveProvider(supabase, body.profile_id);

    case "reject-provider":
      if (!body.profile_id)
        return json({ error: "profile_id required" }, 400);
      return handleRejectProvider(
        supabase,
        body.profile_id,
        body.notes ?? null
      );

    // ------- Problems -------
    case "list-problems":
      return handleListProblems(supabase);

    case "approve-problem":
      if (!body.problem_id)
        return json({ error: "problem_id required" }, 400);
      return handleApproveProblem(supabase, body.problem_id);

    case "reject-problem":
      if (!body.problem_id)
        return json({ error: "problem_id required" }, 400);
      return handleRejectProblem(
        supabase,
        body.problem_id,
        body.notes ?? null
      );

    case "list-problem-interests":
      if (!body.problem_id)
        return json({ error: "problem_id required" }, 400);
      return handleListProblemInterests(supabase, body.problem_id);

    // ------- Agent Edits -------
    case "list-agent-edits":
      return handleListAgentEdits(supabase);

    case "approve-agent-edit":
      if (!body.edit_id)
        return json({ error: "edit_id required" }, 400);
      return handleApproveAgentEdit(supabase, body.edit_id);

    case "reject-agent-edit":
      if (!body.edit_id)
        return json({ error: "edit_id required" }, 400);
      return handleRejectAgentEdit(supabase, body.edit_id, body.notes ?? null);

    // ------- TSP Edits -------
    case "list-tsp-edits":
      return handleListTspEdits(supabase);

    case "approve-tsp-edit":
      if (!body.edit_id)
        return json({ error: "edit_id required" }, 400);
      return handleApproveTspEdit(supabase, body.edit_id);

    case "reject-tsp-edit":
      if (!body.edit_id)
        return json({ error: "edit_id required" }, 400);
      return handleRejectTspEdit(supabase, body.edit_id, body.notes ?? null);

    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
});

// ---------------------------------------------------------------------------
// Agent Handlers
// ---------------------------------------------------------------------------

async function handleListAgents(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("agent_submissions")
    .select(
      `
      *,
      provider_profiles:provider_profile_id ( company_name, category )
    `
    )
    .in("submission_status", ["pending", "approved"])
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const submissions = (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    provider_company_name:
      (s.provider_profiles as Record<string, unknown> | null)?.company_name ??
      null,
    provider_category:
      (s.provider_profiles as Record<string, unknown> | null)?.category ?? null,
    provider_profiles: undefined,
  }));

  return json({ submissions });
}

async function handleApproveAgent(
  supabase: ReturnType<typeof createClient>,
  submissionId: string
) {
  // 1. Get the submission
  const { data: submission, error: fetchError } = await supabase
    .from("agent_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!submission) return json({ error: "Submission not found" }, 404);

  // 2. Extract agent data (remove submission-specific fields)
  const {
    id: _id,
    user_id: _uid,
    submission_status: _ss,
    admin_notes: _an,
    created_at: _ca,
    updated_at: _ua,
    ...agentData
  } = submission;

  // 3. Insert into agents table
  const { error: insertError } = await supabase
    .from("agents")
    .insert(agentData);

  if (insertError) return json({ error: insertError.message }, 500);

  // 4. Mark submission as approved
  const { error: updateError } = await supabase
    .from("agent_submissions")
    .update({ submission_status: "approved" })
    .eq("id", submissionId);

  if (updateError) return json({ error: updateError.message }, 500);

  // 5. Send approval notification to provider (non-blocking)
  if (submission.provider_profile_id) {
    const provider = await getProviderEmail(supabase, submission.provider_profile_id);
    if (provider.email) {
      sendEmail({
        to: provider.email,
        subject: `Your Agent "${submission.agent_name}" Is Now Live on Orbys360`,
        html: `
          <h2>Agent Approved</h2>
          <p>Hi ${provider.companyName},</p>
          <p>Your agent <strong>${submission.agent_name}</strong> has been approved and is now live in the Orbys360 Marketplace.</p>
          <p>Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to manage your agents.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, submission_id: submissionId });
}

async function handleRejectAgent(
  supabase: ReturnType<typeof createClient>,
  submissionId: string,
  notes: string | null
) {
  // 1. Fetch submission to get agent_name + provider_profile_id for the notification
  const { data: submission, error: fetchError } = await supabase
    .from("agent_submissions")
    .select("agent_name, provider_profile_id")
    .eq("id", submissionId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);

  // 2. Update status
  const { error } = await supabase
    .from("agent_submissions")
    .update({ submission_status: "rejected", admin_notes: notes })
    .eq("id", submissionId);

  if (error) return json({ error: error.message }, 500);

  // 3. Send rejection notification to provider (non-blocking)
  if (submission?.provider_profile_id) {
    const provider = await getProviderEmail(supabase, submission.provider_profile_id);
    if (provider.email) {
      sendEmail({
        to: provider.email,
        subject: `Agent "${submission.agent_name}" Was Not Approved`,
        html: `
          <h2>Agent Not Approved</h2>
          <p>Hi ${provider.companyName},</p>
          <p>Your agent <strong>${submission.agent_name}</strong> was not approved for the Orbys360 Marketplace.</p>
          ${notes ? `<p><strong>Admin notes:</strong> ${notes}</p>` : ""}
          <p>Please review the feedback and resubmit. Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to make changes.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, submission_id: submissionId });
}

async function handleRequestChangesAgent(
  supabase: ReturnType<typeof createClient>,
  submissionId: string,
  notes: string | null
) {
  const { error } = await supabase
    .from("agent_submissions")
    .update({ submission_status: "changes_requested", admin_notes: notes })
    .eq("id", submissionId);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true, submission_id: submissionId });
}

// ---------------------------------------------------------------------------
// Provider Handlers
// ---------------------------------------------------------------------------

async function handleListProviders(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, tsp_submissions(*), startup_submissions(*)")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const providers = (data ?? []).map((p: Record<string, unknown>) => {
    const tspArr = p.tsp_submissions as Record<string, unknown>[] | null;
    const startupArr = p.startup_submissions as Record<string, unknown>[] | null;
    return {
      ...p,
      tsp_submission: tspArr?.[0] ?? null,
      startup_submission: startupArr?.[0] ?? null,
      tsp_submissions: undefined,
      startup_submissions: undefined,
    };
  });

  return json({ providers });
}

async function handleApproveProvider(
  supabase: ReturnType<typeof createClient>,
  profileId: string
) {
  // 1. Update provider profile status
  const { error: profileError } = await supabase
    .from("provider_profiles")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (profileError) return json({ error: profileError.message }, 500);

  // 2. Also approve the linked submission (TSP or startup)
  const { data: tsp } = await supabase
    .from("tsp_submissions")
    .select("id")
    .eq("provider_profile_id", profileId)
    .single();

  if (tsp) {
    await supabase
      .from("tsp_submissions")
      .update({
        submission_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tsp.id);
  } else {
    const { data: startup } = await supabase
      .from("startup_submissions")
      .select("id")
      .eq("provider_profile_id", profileId)
      .single();

    if (startup) {
      await supabase
        .from("startup_submissions")
        .update({
          submission_status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", startup.id);
    }
  }

  // 3. Send approval notification email (non-blocking)
  const provider = await getProviderEmail(supabase, profileId);
  if (provider.email) {
    sendEmail({
      to: provider.email,
      subject: "Your Orbys360 Provider Profile Has Been Approved",
      html: `
        <h2>Profile Approved</h2>
        <p>Hi ${provider.companyName},</p>
        <p>Your provider profile on Orbys360 has been approved and is now live in the ecosystem.</p>
        <p>Log in to your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to manage your profile and agents.</p>
        <br/>
        <p>— The Orbys360 Team</p>
      `,
    });
  }

  return json({ success: true, profile_id: profileId });
}

async function handleRejectProvider(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  notes: string | null
) {
  // 1. Update provider profile status
  const { error: profileError } = await supabase
    .from("provider_profiles")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (profileError) return json({ error: profileError.message }, 500);

  // 2. Also reject the linked submission
  const { data: tsp } = await supabase
    .from("tsp_submissions")
    .select("id")
    .eq("provider_profile_id", profileId)
    .single();

  if (tsp) {
    await supabase
      .from("tsp_submissions")
      .update({
        submission_status: "rejected",
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tsp.id);
  } else {
    const { data: startup } = await supabase
      .from("startup_submissions")
      .select("id")
      .eq("provider_profile_id", profileId)
      .single();

    if (startup) {
      await supabase
        .from("startup_submissions")
        .update({
          submission_status: "rejected",
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", startup.id);
    }
  }

  // 3. Send rejection notification email (non-blocking)
  const provider = await getProviderEmail(supabase, profileId);
  if (provider.email) {
    sendEmail({
      to: provider.email,
      subject: "Your Orbys360 Provider Profile Needs Attention",
      html: `
        <h2>Profile Update Required</h2>
        <p>Hi ${provider.companyName},</p>
        <p>Unfortunately, your provider profile on Orbys360 was not approved at this time.</p>
        ${notes ? `<p><strong>Admin notes:</strong> ${notes}</p>` : ""}
        <p>Please review the feedback and update your profile. Log in to your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to make changes.</p>
        <br/>
        <p>— The Orbys360 Team</p>
      `,
    });
  }

  return json({ success: true, profile_id: profileId });
}

// ---------------------------------------------------------------------------
// Problem Handlers
// ---------------------------------------------------------------------------

async function handleListProblems(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("problem_statements")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ problems: data ?? [] });
}

async function handleApproveProblem(
  supabase: ReturnType<typeof createClient>,
  problemId: string
) {
  const { data: problem, error } = await supabase
    .from("problem_statements")
    .update({ status: "approved" })
    .eq("id", problemId)
    .select("gcc_user_id, title")
    .single();

  if (error) return json({ error: error.message }, 500);

  // Send approval notification to GCC user (non-blocking)
  if (problem?.gcc_user_id) {
    const email = await getClerkUserEmail(problem.gcc_user_id);
    if (email) {
      sendEmail({
        to: email,
        subject: "Your Problem Statement Has Been Approved",
        html: `
          <h2>Problem Statement Approved</h2>
          <p>Your problem statement <strong>${problem.title}</strong> has been approved and is now visible to providers in the Orbys360 marketplace.</p>
          <p>Providers can now express interest in your challenge. You'll be notified when there's a match.</p>
          <p>View your submissions on your <a href="https://orbys360.com/gcc/dashboard">GCC Dashboard</a>.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, problem_id: problemId });
}

async function handleRejectProblem(
  supabase: ReturnType<typeof createClient>,
  problemId: string,
  notes: string | null
) {
  const { data: problem, error } = await supabase
    .from("problem_statements")
    .update({ status: "rejected", rejection_reason: notes })
    .eq("id", problemId)
    .select("gcc_user_id, title")
    .single();

  if (error) return json({ error: error.message }, 500);

  // Send rejection notification to GCC user (non-blocking)
  if (problem?.gcc_user_id) {
    const email = await getClerkUserEmail(problem.gcc_user_id);
    if (email) {
      sendEmail({
        to: email,
        subject: "Problem Statement Update",
        html: `
          <h2>Problem Statement Not Approved</h2>
          <p>Your problem statement <strong>${problem.title}</strong> was not approved at this time.</p>
          ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ""}
          <p>You can review the feedback and resubmit from your <a href="https://orbys360.com/gcc/dashboard">GCC Dashboard</a>.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, problem_id: problemId });
}

async function handleListProblemInterests(
  supabase: ReturnType<typeof createClient>,
  problemId: string
) {
  const { data, error } = await supabase
    .from("problem_statement_interests")
    .select("*")
    .eq("problem_statement_id", problemId)
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ interests: data ?? [] });
}

// ---------------------------------------------------------------------------
// Agent Edit Handlers
// ---------------------------------------------------------------------------

async function handleListAgentEdits(
  supabase: ReturnType<typeof createClient>
) {
  const { data, error } = await supabase
    .from("agent_edits")
    .select("*, agents:agent_id ( agent_name )")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const edits = (data ?? []).map((e: Record<string, unknown>) => ({
    ...e,
    agent_name:
      (e.agents as Record<string, unknown> | null)?.agent_name ?? null,
    agents: undefined,
  }));

  return json({ edits });
}

async function handleApproveAgentEdit(
  supabase: ReturnType<typeof createClient>,
  editId: string
) {
  // 1. Get the edit
  const { data: edit, error: fetchError } = await supabase
    .from("agent_edits")
    .select("*")
    .eq("id", editId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!edit) return json({ error: "Edit not found" }, 404);

  // 2. Apply payload to agents table
  const { error: updateError } = await supabase
    .from("agents")
    .update({
      ...edit.payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", edit.agent_id);

  if (updateError) return json({ error: updateError.message }, 500);

  // 3. Mark edit as approved
  const { error: statusError } = await supabase
    .from("agent_edits")
    .update({ status: "approved" })
    .eq("id", editId);

  if (statusError) return json({ error: statusError.message }, 500);

  // 4. Notify provider (non-blocking)
  const { data: agent } = await supabase
    .from("agents")
    .select("agent_name, provider_profile_id")
    .eq("id", edit.agent_id)
    .single();

  if (agent?.provider_profile_id) {
    const provider = await getProviderEmail(supabase, agent.provider_profile_id);
    if (provider.email) {
      sendEmail({
        to: provider.email,
        subject: `Your Agent Edit for "${agent.agent_name}" Has Been Approved`,
        html: `
          <h2>Agent Edit Approved</h2>
          <p>Hi ${provider.companyName},</p>
          <p>Your recent edit to <strong>${agent.agent_name}</strong> has been reviewed and approved. The changes are now live in the Orbys360 Marketplace.</p>
          <p>Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to manage your agents.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, edit_id: editId });
}

async function handleRejectAgentEdit(
  supabase: ReturnType<typeof createClient>,
  editId: string,
  notes: string | null
) {
  // 1. Fetch the edit to get agent_id before updating
  const { data: edit, error: fetchError } = await supabase
    .from("agent_edits")
    .select("agent_id")
    .eq("id", editId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);

  // 2. Reject the edit
  const { error } = await supabase
    .from("agent_edits")
    .update({ status: "rejected", admin_notes: notes })
    .eq("id", editId);

  if (error) return json({ error: error.message }, 500);

  // 3. Notify provider (non-blocking)
  if (edit?.agent_id) {
    const { data: agent } = await supabase
      .from("agents")
      .select("agent_name, provider_profile_id")
      .eq("id", edit.agent_id)
      .single();

    if (agent?.provider_profile_id) {
      const provider = await getProviderEmail(supabase, agent.provider_profile_id);
      if (provider.email) {
        sendEmail({
          to: provider.email,
          subject: `Your Agent Edit for "${agent.agent_name}" Was Not Approved`,
          html: `
            <h2>Agent Edit Not Approved</h2>
            <p>Hi ${provider.companyName},</p>
            <p>Your recent edit to <strong>${agent.agent_name}</strong> was not approved.</p>
            ${notes ? `<p><strong>Admin notes:</strong> ${notes}</p>` : ""}
            <p>Please review the feedback and resubmit. Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to make changes.</p>
            <br/>
            <p>— The Orbys360 Team</p>
          `,
        });
      }
    }
  }

  return json({ success: true, edit_id: editId });
}

// ---------------------------------------------------------------------------
// TSP Edit Handlers
// ---------------------------------------------------------------------------

async function handleListTspEdits(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("tsp_edits")
    .select(
      "*, tsp_submissions:tsp_id ( provider_profiles:provider_profile_id ( company_name ) )"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const edits = (data ?? []).map((e: Record<string, unknown>) => {
    const tsp = e.tsp_submissions as Record<string, unknown> | null;
    const profile = tsp?.provider_profiles as Record<string, unknown> | null;
    return {
      ...e,
      company_name: profile?.company_name ?? null,
      tsp_submissions: undefined,
    };
  });

  return json({ edits });
}

async function handleApproveTspEdit(
  supabase: ReturnType<typeof createClient>,
  editId: string
) {
  // 1. Get the edit
  const { data: edit, error: fetchError } = await supabase
    .from("tsp_edits")
    .select("*")
    .eq("id", editId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!edit) return json({ error: "Edit not found" }, 404);

  // 2. Apply payload to tsp_submissions table
  const { error: updateError } = await supabase
    .from("tsp_submissions")
    .update({
      ...edit.payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", edit.tsp_id);

  if (updateError) return json({ error: updateError.message }, 500);

  // 3. Mark edit as approved
  const { error: statusError } = await supabase
    .from("tsp_edits")
    .update({ status: "approved" })
    .eq("id", editId);

  if (statusError) return json({ error: statusError.message }, 500);

  // 4. Notify provider (non-blocking)
  const { data: tsp } = await supabase
    .from("tsp_submissions")
    .select("provider_profile_id, company_name")
    .eq("id", edit.tsp_id)
    .single();

  if (tsp?.provider_profile_id) {
    const provider = await getProviderEmail(supabase, tsp.provider_profile_id);
    if (provider.email) {
      sendEmail({
        to: provider.email,
        subject: "Your Profile Edit Has Been Approved",
        html: `
          <h2>Profile Edit Approved</h2>
          <p>Hi ${provider.companyName},</p>
          <p>Your recent profile edit for <strong>${tsp.company_name ?? provider.companyName}</strong> has been reviewed and approved. The changes are now live.</p>
          <p>Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to manage your profile.</p>
          <br/>
          <p>— The Orbys360 Team</p>
        `,
      });
    }
  }

  return json({ success: true, edit_id: editId });
}

async function handleRejectTspEdit(
  supabase: ReturnType<typeof createClient>,
  editId: string,
  notes: string | null
) {
  // 1. Fetch the edit to get tsp_id before updating
  const { data: edit, error: fetchError } = await supabase
    .from("tsp_edits")
    .select("tsp_id")
    .eq("id", editId)
    .single();

  if (fetchError) return json({ error: fetchError.message }, 500);

  // 2. Reject the edit
  const { error } = await supabase
    .from("tsp_edits")
    .update({ status: "rejected", admin_notes: notes })
    .eq("id", editId);

  if (error) return json({ error: error.message }, 500);

  // 3. Notify provider (non-blocking)
  if (edit?.tsp_id) {
    const { data: tsp } = await supabase
      .from("tsp_submissions")
      .select("provider_profile_id, company_name")
      .eq("id", edit.tsp_id)
      .single();

    if (tsp?.provider_profile_id) {
      const provider = await getProviderEmail(supabase, tsp.provider_profile_id);
      if (provider.email) {
        sendEmail({
          to: provider.email,
          subject: "Your Profile Edit Was Not Approved",
          html: `
            <h2>Profile Edit Not Approved</h2>
            <p>Hi ${provider.companyName},</p>
            <p>Your recent profile edit for <strong>${tsp.company_name ?? provider.companyName}</strong> was not approved.</p>
            ${notes ? `<p><strong>Admin notes:</strong> ${notes}</p>` : ""}
            <p>Please review the feedback and resubmit. Visit your <a href="https://orbys360.com/provider/dashboard">Provider Dashboard</a> to make changes.</p>
            <br/>
            <p>— The Orbys360 Team</p>
          `,
        });
      }
    }
  }

  return json({ success: true, edit_id: editId });
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

// ---------------------------------------------------------------------------
// Email Helper (non-blocking, best-effort)
// ---------------------------------------------------------------------------
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orbys360 <team@orbys360.com>",
        to: [to],
        subject,
        html,
      }),
    });
  } catch {
    console.error(`Failed to send email to ${to}: ${subject}`);
  }
}

async function getProviderEmail(
  supabase: ReturnType<typeof createClient>,
  profileId: string
): Promise<{ email: string | null; companyName: string }> {
  // Try TSP submission first
  const { data: tsp } = await supabase
    .from("tsp_submissions")
    .select("contact_email, company_name")
    .eq("provider_profile_id", profileId)
    .single();

  if (tsp?.contact_email) {
    return { email: tsp.contact_email, companyName: tsp.company_name ?? "Provider" };
  }

  // Fall back to startup submission
  const { data: startup } = await supabase
    .from("startup_submissions")
    .select("contact_email, company_name")
    .eq("provider_profile_id", profileId)
    .single();

  if (startup?.contact_email) {
    return { email: startup.contact_email, companyName: startup.company_name ?? "Provider" };
  }

  return { email: null, companyName: "Provider" };
}

async function getClerkUserEmail(userId: string): Promise<string | null> {
  const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
  if (!clerkSecretKey) return null;

  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${clerkSecretKey}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    const primary = user.email_addresses?.find(
      (e: { id: string }) => e.id === user.primary_email_address_id
    );
    return primary?.email_address ?? null;
  } catch {
    console.error(`Failed to look up Clerk user ${userId}`);
    return null;
  }
}
