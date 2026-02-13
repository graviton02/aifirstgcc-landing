import type { SupabaseClient } from '@supabase/supabase-js'
import type { Agent, AgentSubmission, AgentEdit } from '@/types/agent'

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface AgentFilters {
  search?: string
  category?: string
  page?: number
  pageSize?: number
}

// ---------------------------------------------------------------------------
// Public Agent Queries
// ---------------------------------------------------------------------------

export async function getAgents(
  supabase: SupabaseClient,
  filters: AgentFilters = {},
): Promise<{ data: Agent[]; count: number }> {
  const { search, category, page = 1, pageSize = 12 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`agent_name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}

export async function getAgentById(
  supabase: SupabaseClient,
  id: string,
): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getAgentsByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Agent[]> {
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .in('id', ids)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAgentsByProvider(
  supabase: SupabaseClient,
  profileId: string,
): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('provider_profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Agent Submissions
// ---------------------------------------------------------------------------

export async function submitAgent(
  supabase: SupabaseClient,
  data: Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>,
): Promise<AgentSubmission> {
  const { data: submission, error } = await supabase
    .from('agent_submissions')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Fire-and-forget admin notification — DB insert is the source of truth
  supabase.functions.invoke('send-notification', {
    body: {
      type: 'agent_submission',
      submission_id: submission.id,
    },
  }).catch(() => {
    // Notification failure doesn't affect the submission
  })

  return submission
}

export async function getAgentSubmissions(
  supabase: SupabaseClient,
  userId: string,
): Promise<AgentSubmission[]> {
  const { data, error } = await supabase
    .from('agent_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Agent Edits
// ---------------------------------------------------------------------------

export async function createAgentEdit(
  supabase: SupabaseClient,
  agentId: string,
  userId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('agent_edits')
    .insert({ agent_id: agentId, user_id: userId, payload })

  if (error) throw new Error(error.message)
}

export async function getAgentEdits(
  supabase: SupabaseClient,
  userId: string,
): Promise<AgentEdit[]> {
  const { data, error } = await supabase
    .from('agent_edits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Soft Delete
// ---------------------------------------------------------------------------

export async function softDeleteAgent(
  supabase: SupabaseClient,
  agentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', agentId)

  if (error) throw new Error(error.message)
}
