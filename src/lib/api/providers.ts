import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProviderProfile, TspSubmission, StartupSubmission, TspEdit } from '@/types/provider'
import type { ProviderRequest } from '@/types/agent'

// ---------------------------------------------------------------------------
// Provider Profiles
// ---------------------------------------------------------------------------

export async function getProviderProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProviderProfile | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getProviderProfileById(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ProviderProfile | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function createProviderProfile(
  supabase: SupabaseClient,
  data: Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>,
): Promise<ProviderProfile> {
  const { data: profile, error } = await supabase
    .from('provider_profiles')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return profile
}

export async function updateProviderProfile(
  supabase: SupabaseClient,
  id: string,
  data: Partial<ProviderProfile>,
): Promise<ProviderProfile> {
  const { data: profile, error } = await supabase
    .from('provider_profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return profile
}

// ---------------------------------------------------------------------------
// TSP / Startup Submissions
// ---------------------------------------------------------------------------

export async function submitTspForm(
  supabase: SupabaseClient,
  data: Omit<TspSubmission, 'id' | 'created_at' | 'updated_at'>,
): Promise<TspSubmission> {
  const { data: submission, error } = await supabase
    .from('tsp_submissions')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return submission
}

export async function submitStartupForm(
  supabase: SupabaseClient,
  data: Omit<StartupSubmission, 'id' | 'created_at' | 'updated_at'>,
): Promise<StartupSubmission> {
  const { data: submission, error } = await supabase
    .from('startup_submissions')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return submission
}

export async function getProviderSubmission(
  supabase: SupabaseClient,
  profileId: string,
): Promise<TspSubmission | StartupSubmission | null> {
  // Try TSP first
  const { data: tsp, error: tspError } = await supabase
    .from('tsp_submissions')
    .select('*')
    .eq('provider_profile_id', profileId)
    .single()

  if (tspError && tspError.code !== 'PGRST116') throw new Error(tspError.message)
  if (tsp) return tsp

  // Then startup
  const { data: startup, error: startupError } = await supabase
    .from('startup_submissions')
    .select('*')
    .eq('provider_profile_id', profileId)
    .single()

  if (startupError && startupError.code !== 'PGRST116') throw new Error(startupError.message)
  return startup
}

// ---------------------------------------------------------------------------
// Draft Upserts (Save-Per-Page)
// ---------------------------------------------------------------------------

export async function upsertTspDraft(
  supabase: SupabaseClient,
  profileId: string,
  userId: string,
  pageData: Partial<TspSubmission>,
  pageNumber: number,
): Promise<TspSubmission> {
  // First check if a draft/pending submission already exists
  const { data: existing } = await supabase
    .from('tsp_submissions')
    .select('id, completed_pages')
    .eq('provider_profile_id', profileId)
    .single()

  const completedPages = existing?.completed_pages ?? []
  const updatedPages = completedPages.includes(pageNumber)
    ? completedPages
    : [...completedPages, pageNumber].sort((a, b) => a - b)

  if (existing) {
    // Update existing draft
    const { data, error } = await supabase
      .from('tsp_submissions')
      .update({
        ...pageData,
        completed_pages: updatedPages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // Insert new draft
  const { data, error } = await supabase
    .from('tsp_submissions')
    .insert({
      provider_profile_id: profileId,
      user_id: userId,
      submission_status: 'draft',
      completed_pages: updatedPages,
      ...pageData,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function upsertStartupDraft(
  supabase: SupabaseClient,
  profileId: string,
  userId: string,
  pageData: Partial<StartupSubmission>,
  pageNumber: number,
): Promise<StartupSubmission> {
  const { data: existing } = await supabase
    .from('startup_submissions')
    .select('id, completed_pages')
    .eq('provider_profile_id', profileId)
    .single()

  const completedPages = existing?.completed_pages ?? []
  const updatedPages = completedPages.includes(pageNumber)
    ? completedPages
    : [...completedPages, pageNumber].sort((a, b) => a - b)

  if (existing) {
    const { data, error } = await supabase
      .from('startup_submissions')
      .update({
        ...pageData,
        completed_pages: updatedPages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  const { data, error } = await supabase
    .from('startup_submissions')
    .insert({
      provider_profile_id: profileId,
      user_id: userId,
      submission_status: 'draft',
      completed_pages: updatedPages,
      ...pageData,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function finalizeSubmission(
  supabase: SupabaseClient,
  submissionId: string,
  table: 'tsp_submissions' | 'startup_submissions',
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({
      submission_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)

  // Fire-and-forget admin notification — DB update is the source of truth
  supabase.functions.invoke('send-notification', {
    body: {
      type: 'provider_submission',
      submission_id: submissionId,
      table,
    },
  }).catch(() => {
    // Notification failure doesn't affect the submission
  })
}

// ---------------------------------------------------------------------------
// TSP Edits
// ---------------------------------------------------------------------------

export async function createTspEdit(
  supabase: SupabaseClient,
  tspId: string,
  userId: string,
  payload: Record<string, unknown>,
): Promise<TspEdit> {
  const { data, error } = await supabase
    .from('tsp_edits')
    .insert({ tsp_id: tspId, user_id: userId, payload })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getTspEdits(
  supabase: SupabaseClient,
  userId: string,
): Promise<TspEdit[]> {
  const { data, error } = await supabase
    .from('tsp_edits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// ---------------------------------------------------------------------------
// Provider Requests (inbound contact requests from GCCs)
// ---------------------------------------------------------------------------

export async function getProviderRequests(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ProviderRequest[]> {
  const { data, error } = await supabase
    .from('provider_requests')
    .select('*')
    .eq('provider_profile_id', profileId)
    .in('status', ['approved', 'contacted', 'archived'])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function updateProviderRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: ProviderRequest['status'],
): Promise<void> {
  const { error } = await supabase
    .from('provider_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) throw new Error(error.message)
}
