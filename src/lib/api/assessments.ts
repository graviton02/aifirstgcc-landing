import type { SupabaseClient } from '@supabase/supabase-js'
import type { SelfAssessment, SelfAssessmentResult } from '@/types/assessment'

// ---------------------------------------------------------------------------
// Self Assessments
// ---------------------------------------------------------------------------

export async function getSelfAssessment(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
): Promise<SelfAssessment | null> {
  const { data, error } = await supabase
    .from('self_assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function createSelfAssessment(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
): Promise<SelfAssessment> {
  const { data, error } = await supabase
    .from('self_assessments')
    .insert({ user_id: userId, org_id: orgId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSelfAssessment(
  supabase: SupabaseClient,
  id: string,
  answers: Record<string, unknown>,
): Promise<SelfAssessment> {
  const { data, error } = await supabase
    .from('self_assessments')
    .update({ answers, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function completeSelfAssessment(
  supabase: SupabaseClient,
  id: string,
): Promise<SelfAssessment> {
  const { data, error } = await supabase
    .from('self_assessments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ---------------------------------------------------------------------------
// Self Assessment Results
// ---------------------------------------------------------------------------

export async function getSelfAssessmentResult(
  supabase: SupabaseClient,
  assessmentId: string,
): Promise<SelfAssessmentResult | null> {
  const { data, error } = await supabase
    .from('self_assessment_results')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function submitForAnalysis(
  supabase: SupabaseClient,
  id: string,
  answers: Record<string, unknown>,
): Promise<{ assessmentId: string; resultId: string }> {
  // First update the assessment with final answers
  await updateSelfAssessment(supabase, id, answers)

  // Then mark as completed
  await completeSelfAssessment(supabase, id)

  // Invoke the edge function
  const { data, error } = await supabase.functions.invoke('analyze-self-assessment', {
    body: { assessmentId: id, answers },
  })

  if (error) throw new Error(error.message)
  if (!data?.ok) throw new Error(data?.error || 'Analysis failed')

  return { assessmentId: id, resultId: data.resultId }
}
