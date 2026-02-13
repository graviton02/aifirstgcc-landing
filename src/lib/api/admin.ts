import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProviderProfile, TspSubmission, StartupSubmission, TspEdit } from '@/types/provider'
import type { Agent, AgentSubmission, AgentEdit } from '@/types/agent'
import type { ProblemStatement } from '@/types/problem'

// ---------------------------------------------------------------------------
// Types for admin contact request responses
// ---------------------------------------------------------------------------

export interface PendingContactRequest {
  id: string
  gcc_user_email: string
  gcc_org_id: string
  gcc_user_id: string
  agent_id: string
  message: string | null
  created_at: string
  agent_name: string | null
  provider_company_name: string | null
}

// ---------------------------------------------------------------------------
// Admin Sessions
// ---------------------------------------------------------------------------

export async function validateAdminSession(
  supabase: SupabaseClient,
  token: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) return false
  return !!data
}

export async function createAdminSession(
  supabase: SupabaseClient,
  sessionToken: string,
  expiresInHours = 24,
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('admin_sessions')
    .insert({ session_token: sessionToken, expires_at: expiresAt })

  if (error) throw new Error(error.message)
}

export async function deleteAdminSession(
  supabase: SupabaseClient,
  token: string,
): Promise<void> {
  const { error } = await supabase
    .from('admin_sessions')
    .delete()
    .eq('session_token', token)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Admin Login / Logout (via Edge Function)
// ---------------------------------------------------------------------------

export async function adminLogin(
  supabase: SupabaseClient,
  password: string,
): Promise<{ session_token: string; expires_at: string }> {
  const { data, error } = await supabase.functions.invoke('admin-login', {
    body: { action: 'login', password },
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data as { session_token: string; expires_at: string }
}

export async function adminLogout(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-login', {
    body: { action: 'logout', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
}

// ---------------------------------------------------------------------------
// Admin Session localStorage Helpers
// ---------------------------------------------------------------------------

const ADMIN_SESSION_KEY = 'orbys360_admin_session'

interface StoredAdminSession {
  token: string
  expires_at: string
}

export function getStoredAdminSession(): StoredAdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredAdminSession
    if (!parsed.token || !parsed.expires_at) return null

    // Check if expired
    if (new Date(parsed.expires_at) <= new Date()) {
      localStorage.removeItem(ADMIN_SESSION_KEY)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    return null
  }
}

export function storeAdminSession(token: string, expiresAt: string): void {
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ token, expires_at: expiresAt }),
  )
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

// ---------------------------------------------------------------------------
// Pending Submissions Queues
// ---------------------------------------------------------------------------

export async function getPendingAgentSubmissions(
  supabase: SupabaseClient,
): Promise<AgentSubmission[]> {
  const { data, error } = await supabase
    .from('agent_submissions')
    .select('*')
    .eq('submission_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPendingProviderSubmissions(
  supabase: SupabaseClient,
): Promise<ProviderProfile[]> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPendingProblems(
  supabase: SupabaseClient,
): Promise<ProblemStatement[]> {
  const { data, error } = await supabase
    .from('problem_statements')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPendingTspEdits(
  supabase: SupabaseClient,
): Promise<TspEdit[]> {
  const { data, error } = await supabase
    .from('tsp_edits')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPendingAgentEdits(
  supabase: SupabaseClient,
): Promise<AgentEdit[]> {
  const { data, error } = await supabase
    .from('agent_edits')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Agent Approval / Rejection
// ---------------------------------------------------------------------------

export async function approveAgent(
  supabase: SupabaseClient,
  submissionId: string,
): Promise<Agent> {
  // 1. Get the submission
  const { data: submission, error: fetchError } = await supabase
    .from('agent_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // 2. Insert into agents table
  const {
    id: _id, user_id: _uid, submission_status: _ss, admin_notes: _an,
    created_at: _ca, updated_at: _ua,
    ...agentData
  } = submission as AgentSubmission

  const { data: agent, error: insertError } = await supabase
    .from('agents')
    .insert(agentData)
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  // 3. Mark submission as approved
  const { error: updateError } = await supabase
    .from('agent_submissions')
    .update({ submission_status: 'approved' })
    .eq('id', submissionId)

  if (updateError) throw new Error(updateError.message)

  return agent
}

export async function rejectAgent(
  supabase: SupabaseClient,
  submissionId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('agent_submissions')
    .update({ submission_status: 'rejected', admin_notes: notes })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Provider Approval / Rejection
// ---------------------------------------------------------------------------

export async function approveProvider(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  const { error } = await supabase
    .from('provider_profiles')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
}

export async function rejectProvider(
  supabase: SupabaseClient,
  profileId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from('provider_profiles')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) throw new Error(error.message)

  // Also update the linked submission with the rejection reason
  const { data: tsp } = await supabase
    .from('tsp_submissions')
    .select('id')
    .eq('provider_profile_id', profileId)
    .single()

  if (tsp) {
    await supabase
      .from('tsp_submissions')
      .update({ submission_status: 'rejected', admin_notes: reason })
      .eq('id', tsp.id)
    return
  }

  const { data: startup } = await supabase
    .from('startup_submissions')
    .select('id')
    .eq('provider_profile_id', profileId)
    .single()

  if (startup) {
    await supabase
      .from('startup_submissions')
      .update({ submission_status: 'rejected', admin_notes: reason })
      .eq('id', startup.id)
  }
}

// ---------------------------------------------------------------------------
// Problem Approval / Rejection
// ---------------------------------------------------------------------------

export async function approveProblem(
  supabase: SupabaseClient,
  problemId: string,
): Promise<void> {
  const { error } = await supabase
    .from('problem_statements')
    .update({ status: 'approved' })
    .eq('id', problemId)

  if (error) throw new Error(error.message)
}

export async function rejectProblem(
  supabase: SupabaseClient,
  problemId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from('problem_statements')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', problemId)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// TSP Edit Approval / Rejection
// ---------------------------------------------------------------------------

export async function approveTspEdit(
  supabase: SupabaseClient,
  editId: string,
): Promise<void> {
  // 1. Get the edit
  const { data: edit, error: fetchError } = await supabase
    .from('tsp_edits')
    .select('*')
    .eq('id', editId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // 2. Apply payload to the TSP submission
  const { error: updateError } = await supabase
    .from('tsp_submissions')
    .update({
      ...(edit as TspEdit).payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', (edit as TspEdit).tsp_id)

  if (updateError) throw new Error(updateError.message)

  // 3. Mark edit as approved
  const { error: statusError } = await supabase
    .from('tsp_edits')
    .update({ status: 'approved' })
    .eq('id', editId)

  if (statusError) throw new Error(statusError.message)
}

export async function rejectTspEdit(
  supabase: SupabaseClient,
  editId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('tsp_edits')
    .update({ status: 'rejected', admin_notes: notes })
    .eq('id', editId)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Agent Edit Approval / Rejection
// ---------------------------------------------------------------------------

export async function approveAgentEdit(
  supabase: SupabaseClient,
  editId: string,
): Promise<void> {
  // 1. Get the edit
  const { data: edit, error: fetchError } = await supabase
    .from('agent_edits')
    .select('*')
    .eq('id', editId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // 2. Apply payload to the agent
  const { error: updateError } = await supabase
    .from('agents')
    .update({
      ...(edit as AgentEdit).payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', (edit as AgentEdit).agent_id)

  if (updateError) throw new Error(updateError.message)

  // 3. Mark edit as approved
  const { error: statusError } = await supabase
    .from('agent_edits')
    .update({ status: 'approved' })
    .eq('id', editId)

  if (statusError) throw new Error(statusError.message)
}

export async function rejectAgentEdit(
  supabase: SupabaseClient,
  editId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('agent_edits')
    .update({ status: 'rejected', admin_notes: notes })
    .eq('id', editId)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Agent Submission Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export interface PendingAgentSubmission {
  id: string
  agent_name: string
  tagline: string | null
  description: string
  category: string
  provider_profile_id: string
  logo_url: string | null
  tags: string[]
  use_cases: { title: string; description: string }[]
  industries: string[]
  integration_type: string | null
  supported_platforms: string[]
  data_requirements: string | null
  impact_metrics: { type: string; value: string; description: string }[]
  demo_url: string | null
  compliance_certifications: string[]
  security_features: string[]
  user_id: string
  submission_status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
  provider_company_name: string | null
  provider_category: string | null
}

export async function getAdminPendingAgents(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingAgentSubmission[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-agents', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.submissions ?? []
}

export async function adminApproveAgent(
  supabase: SupabaseClient,
  sessionToken: string,
  submissionId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'approve-agent', session_token: sessionToken, submission_id: submissionId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve agent')
}

export async function adminRejectAgent(
  supabase: SupabaseClient,
  sessionToken: string,
  submissionId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'reject-agent', session_token: sessionToken, submission_id: submissionId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject agent')
}

export async function adminRequestChangesAgent(
  supabase: SupabaseClient,
  sessionToken: string,
  submissionId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'request-changes-agent', session_token: sessionToken, submission_id: submissionId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to request changes')
}

// ---------------------------------------------------------------------------
// Provider Profile Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export interface PendingProvider {
  id: string
  user_id: string
  organization_id: string
  company_name: string
  location: string
  company_size: string
  logo_url: string | null
  website: string | null
  category: 'tsp' | 'startup'
  status: string
  created_at: string
  updated_at: string
  tsp_submission: TspSubmission | null
  startup_submission: StartupSubmission | null
}

export async function getAdminPendingProviders(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingProvider[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-providers', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.providers ?? []
}

export async function adminApproveProvider(
  supabase: SupabaseClient,
  sessionToken: string,
  profileId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'approve-provider', session_token: sessionToken, profile_id: profileId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve provider')
}

export async function adminRejectProvider(
  supabase: SupabaseClient,
  sessionToken: string,
  profileId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'reject-provider', session_token: sessionToken, profile_id: profileId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject provider')
}

// ---------------------------------------------------------------------------
// Problem Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export interface PendingProblem {
  id: string
  gcc_org_id: string
  gcc_user_id: string
  title: string
  description: string
  category: string
  industry: string
  desired_outcome: string
  timeline: string
  budget_range: string
  status: string
  interest_count: number
  rejection_reason: string | null
  created_at: string
}

export interface ProblemInterest {
  id: string
  problem_statement_id: string
  provider_org_id: string
  provider_user_id: string
  provider_user_email: string
  created_at: string
}

export async function getAdminProblems(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingProblem[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-problems', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.problems ?? []
}

export async function adminApproveProblem(
  supabase: SupabaseClient,
  sessionToken: string,
  problemId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'approve-problem', session_token: sessionToken, problem_id: problemId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve problem')
}

export async function adminRejectProblem(
  supabase: SupabaseClient,
  sessionToken: string,
  problemId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'reject-problem', session_token: sessionToken, problem_id: problemId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject problem')
}

export async function getAdminProblemInterests(
  supabase: SupabaseClient,
  sessionToken: string,
  problemId: string,
): Promise<ProblemInterest[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-problem-interests', session_token: sessionToken, problem_id: problemId },
  })

  if (error) throw new Error(error.message)
  return data?.interests ?? []
}

// ---------------------------------------------------------------------------
// Agent Edit Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export interface PendingAgentEdit {
  id: string
  agent_id: string
  user_id: string
  payload: Record<string, unknown>
  status: string
  admin_notes: string | null
  created_at: string
  agent_name: string | null
}

export async function getAdminPendingAgentEdits(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingAgentEdit[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-agent-edits', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.edits ?? []
}

export async function adminApproveAgentEdit(
  supabase: SupabaseClient,
  sessionToken: string,
  editId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'approve-agent-edit', session_token: sessionToken, edit_id: editId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve agent edit')
}

export async function adminRejectAgentEdit(
  supabase: SupabaseClient,
  sessionToken: string,
  editId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'reject-agent-edit', session_token: sessionToken, edit_id: editId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject agent edit')
}

// ---------------------------------------------------------------------------
// TSP Edit Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export interface PendingTspEdit {
  id: string
  tsp_id: string
  user_id: string
  payload: Record<string, unknown>
  status: string
  admin_notes: string | null
  created_at: string
  company_name: string | null
}

export async function getAdminPendingTspEdits(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingTspEdit[]> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'list-tsp-edits', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.edits ?? []
}

export async function adminApproveTspEdit(
  supabase: SupabaseClient,
  sessionToken: string,
  editId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'approve-tsp-edit', session_token: sessionToken, edit_id: editId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve TSP edit')
}

export async function adminRejectTspEdit(
  supabase: SupabaseClient,
  sessionToken: string,
  editId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-manage-submissions', {
    body: { action: 'reject-tsp-edit', session_token: sessionToken, edit_id: editId, notes },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject TSP edit')
}

// ---------------------------------------------------------------------------
// Contact Request Admin Operations (via Edge Function)
// ---------------------------------------------------------------------------

export async function getPendingContactRequests(
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<PendingContactRequest[]> {
  const { data, error } = await supabase.functions.invoke('admin-contact-requests', {
    body: { action: 'list', session_token: sessionToken },
  })

  if (error) throw new Error(error.message)
  return data?.requests ?? []
}

export async function approveContactRequest(
  supabase: SupabaseClient,
  sessionToken: string,
  requestId: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-contact-requests', {
    body: { action: 'approve', session_token: sessionToken, request_id: requestId },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to approve contact request')
}

export async function rejectContactRequest(
  supabase: SupabaseClient,
  sessionToken: string,
  requestId: string,
  notes?: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-contact-requests', {
    body: {
      action: 'reject',
      session_token: sessionToken,
      request_id: requestId,
      admin_notes: notes,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error('Failed to reject contact request')
}
