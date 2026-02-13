import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase-auth'
import {
  getShortlist,
  isShortlisted,
  addToShortlist,
  removeFromShortlist,
  getContactLogs,
  createContactLogWithRequest,
  getMyContactRequests,
  getProblems,
  getApprovedProblems,
  type ProblemFilters,
  submitProblem,
  expressInterest,
  isOrgInterestedInProblem,
  getProblemInterests,
  type ContactLogWithRequestInput,
  type ProblemInput,
  type InterestInput,
} from '@/lib/api/gcc'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useShortlist(orgId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['shortlist', orgId],
    queryFn: () => getShortlist(supabase!, orgId!),
    enabled: !!supabase && !!orgId,
  })
}

export function useIsShortlisted(orgId: string | undefined, agentId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['is-shortlisted', orgId, agentId],
    queryFn: () => isShortlisted(supabase!, orgId!, agentId!),
    enabled: !!supabase && !!orgId && !!agentId,
  })
}

export function useContactLogs(orgId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['contact-logs', orgId],
    queryFn: () => getContactLogs(supabase!, orgId!),
    enabled: !!supabase && !!orgId,
  })
}

export function useMyProblems(orgId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['my-problems', orgId],
    queryFn: () => getProblems(supabase!, orgId!),
    enabled: !!supabase && !!orgId,
  })
}

export function useApprovedProblems(filters?: ProblemFilters) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['approved-problems', filters],
    queryFn: () => getApprovedProblems(supabase!, filters),
    enabled: !!supabase,
  })
}

export function useProblemInterests(problemId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['problem-interests', problemId],
    queryFn: () => getProblemInterests(supabase!, problemId!),
    enabled: !!supabase && !!problemId,
  })
}

export function useIsOrgInterested(problemId: string | undefined, orgId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['is-org-interested', problemId, orgId],
    queryFn: () => isOrgInterestedInProblem(supabase!, problemId!, orgId!),
    enabled: !!supabase && !!problemId && !!orgId,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAddToShortlist() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orgId, agentId, userId }: { orgId: string; agentId: string; userId: string }) =>
      addToShortlist(supabase!, orgId, agentId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shortlist'] })
      queryClient.invalidateQueries({ queryKey: ['is-shortlisted', variables.orgId, variables.agentId] })
    },
  })
}

export function useRemoveFromShortlist() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orgId, agentId }: { orgId: string; agentId: string }) =>
      removeFromShortlist(supabase!, orgId, agentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shortlist'] })
      queryClient.invalidateQueries({ queryKey: ['is-shortlisted', variables.orgId, variables.agentId] })
    },
  })
}

export function useMyContactRequests(userId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['my-contact-requests', userId],
    queryFn: () => getMyContactRequests(supabase!, userId!),
    enabled: !!supabase && !!userId,
  })
}

export function useCreateContactLog() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContactLogWithRequestInput) =>
      createContactLogWithRequest(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-logs'] })
      queryClient.invalidateQueries({ queryKey: ['my-contact-requests'] })
    },
  })
}

export function useSubmitProblem() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProblemInput) => submitProblem(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-problems'] })
    },
  })
}

export function useExpressInterest() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InterestInput) => expressInterest(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-interests'] })
      queryClient.invalidateQueries({ queryKey: ['approved-problems'] })
      queryClient.invalidateQueries({ queryKey: ['is-org-interested'] })
    },
  })
}
