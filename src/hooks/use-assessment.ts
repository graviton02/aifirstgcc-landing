import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase-auth'
import {
  getSelfAssessment,
  createSelfAssessment,
  updateSelfAssessment,
  getSelfAssessmentResult,
  submitForAnalysis,
} from '@/lib/api/assessments'

export function useSelfAssessment(userId: string | undefined, orgId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['self-assessment', userId, orgId],
    queryFn: () => getSelfAssessment(supabase!, userId!, orgId!),
    enabled: !!supabase && !!userId && !!orgId,
  })
}

export function useCreateAssessment() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, orgId }: { userId: string; orgId: string }) =>
      createSelfAssessment(supabase!, userId, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-assessment'] })
    },
  })
}

export function useUpdateAssessment() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Record<string, unknown> }) =>
      updateSelfAssessment(supabase!, id, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-assessment'] })
    },
  })
}

export function useSubmitAssessment() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Record<string, unknown> }) =>
      submitForAnalysis(supabase!, id, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-assessment'] })
    },
  })
}

export function useSelfAssessmentResult(assessmentId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['self-assessment-result', assessmentId],
    queryFn: () => getSelfAssessmentResult(supabase!, assessmentId!),
    enabled: !!supabase && !!assessmentId,
  })
}
