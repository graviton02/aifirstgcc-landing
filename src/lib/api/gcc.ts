import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentShortlist, ContactLog, ProviderRequest } from '@/types/agent'
import type {
  ProblemStatement,
  ProblemStatementInterest,
} from '@/types/problem'

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface ContactLogInput {
  gcc_user_id: string
  gcc_org_id: string
  agent_id: string
  provider_profile_id: string
}

export interface ProblemInput {
  gcc_org_id: string
  gcc_user_id: string
  title: string
  description: string
  category: string
  industry: string
  desired_outcome: string
  timeline: ProblemStatement['timeline']
  budget_range: string
}

export interface ProblemFilters {
  search?: string
  category?: string
  timeline?: string
  page?: number
  pageSize?: number
}

export interface InterestInput {
  problem_statement_id: string
  provider_org_id: string
  provider_user_id: string
  provider_user_email: string
}

// ---------------------------------------------------------------------------
// Shortlists
// ---------------------------------------------------------------------------

export async function getShortlist(
  supabase: SupabaseClient,
  orgId: string,
): Promise<AgentShortlist[]> {
  const { data, error } = await supabase
    .from('agent_shortlists')
    .select('*')
    .eq('gcc_org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function isShortlisted(
  supabase: SupabaseClient,
  orgId: string,
  agentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('agent_shortlists')
    .select('id')
    .eq('gcc_org_id', orgId)
    .eq('agent_id', agentId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return !!data
}

export async function addToShortlist(
  supabase: SupabaseClient,
  orgId: string,
  agentId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('agent_shortlists')
    .insert({ gcc_org_id: orgId, agent_id: agentId, created_by_user_id: userId })

  if (error) {
    if (error.code === '23505') throw new Error('Agent already in shortlist')
    throw new Error(error.message)
  }
}

export async function removeFromShortlist(
  supabase: SupabaseClient,
  orgId: string,
  agentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('agent_shortlists')
    .delete()
    .eq('gcc_org_id', orgId)
    .eq('agent_id', agentId)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Contact Logs
// ---------------------------------------------------------------------------

export async function getContactLogs(
  supabase: SupabaseClient,
  orgId: string,
): Promise<ContactLog[]> {
  const { data, error } = await supabase
    .from('contact_logs')
    .select('*')
    .eq('gcc_org_id', orgId)
    .order('contacted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createContactLog(
  supabase: SupabaseClient,
  data: ContactLogInput,
): Promise<void> {
  const { error } = await supabase
    .from('contact_logs')
    .insert(data)

  if (error) throw new Error(error.message)
}

export interface ContactLogWithRequestInput extends ContactLogInput {
  gcc_user_email: string
  message: string
}

export async function createContactLogWithRequest(
  supabase: SupabaseClient,
  data: ContactLogWithRequestInput,
): Promise<void> {
  // 1. Create contact log
  const { error: logError } = await supabase
    .from('contact_logs')
    .insert({
      gcc_user_id: data.gcc_user_id,
      gcc_org_id: data.gcc_org_id,
      agent_id: data.agent_id,
      provider_profile_id: data.provider_profile_id,
    })

  if (logError) throw new Error(logError.message)

  // 2. Create provider request (status defaults to 'pending_admin')
  const { error: reqError } = await supabase
    .from('provider_requests')
    .insert({
      provider_profile_id: data.provider_profile_id,
      gcc_user_email: data.gcc_user_email,
      gcc_org_id: data.gcc_org_id,
      gcc_user_id: data.gcc_user_id,
      agent_id: data.agent_id,
      message: data.message,
    })

  if (reqError) throw new Error(reqError.message)
}

// ---------------------------------------------------------------------------
// My Contact Requests (GCC user tracking their own requests)
// ---------------------------------------------------------------------------

export async function getMyContactRequests(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProviderRequest[]> {
  const { data, error } = await supabase
    .from('provider_requests')
    .select('*')
    .eq('gcc_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Problem Statements
// ---------------------------------------------------------------------------

export async function getProblems(
  supabase: SupabaseClient,
  orgId: string,
): Promise<ProblemStatement[]> {
  const { data, error } = await supabase
    .from('problem_statements')
    .select('*')
    .eq('gcc_org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getApprovedProblems(
  supabase: SupabaseClient,
  filters?: ProblemFilters,
): Promise<{ data: ProblemStatement[]; count: number }> {
  const page = filters?.page ?? 1
  const pageSize = filters?.pageSize ?? 12

  let query = supabase
    .from('problem_statements')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.timeline) {
    query = query.eq('timeline', filters.timeline)
  }
  if (filters?.search) {
    const term = `%${filters.search}%`
    query = query.or(`title.ilike.${term},description.ilike.${term}`)
  }

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

export async function submitProblem(
  supabase: SupabaseClient,
  data: ProblemInput,
): Promise<ProblemStatement> {
  const { data: problem, error } = await supabase
    .from('problem_statements')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return problem
}

// ---------------------------------------------------------------------------
// Problem Interest (providers expressing interest)
// ---------------------------------------------------------------------------

export async function expressInterest(
  supabase: SupabaseClient,
  data: InterestInput,
): Promise<ProblemStatementInterest> {
  const { data: interest, error } = await supabase
    .from('problem_statement_interests')
    .insert(data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Already expressed interest in this problem')
    throw new Error(error.message)
  }

  // Fire-and-forget notification — DB insert is the source of truth
  supabase.functions.invoke('send-notification', {
    body: {
      type: 'interest_expressed',
      problem_statement_id: data.problem_statement_id,
      provider_user_email: data.provider_user_email,
    },
  }).catch(() => {
    // Notification failure doesn't affect the interest
  })

  return interest
}

export async function isOrgInterestedInProblem(
  supabase: SupabaseClient,
  problemId: string,
  providerOrgId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('problem_statement_interests')
    .select('id')
    .eq('problem_statement_id', problemId)
    .eq('provider_org_id', providerOrgId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return !!data
}

export async function getProblemInterests(
  supabase: SupabaseClient,
  problemId: string,
): Promise<ProblemStatementInterest[]> {
  const { data, error } = await supabase
    .from('problem_statement_interests')
    .select('*')
    .eq('problem_statement_id', problemId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

