import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase-auth'
import {
  validateAdminSession,
  adminLogin,
  adminLogout,
  getStoredAdminSession,
  storeAdminSession,
  clearAdminSession,
  getPendingContactRequests,
  approveContactRequest,
  rejectContactRequest,
  getAdminPendingAgents,
  adminApproveAgent,
  adminRejectAgent,
  adminRequestChangesAgent,
  getAdminPendingProviders,
  adminApproveProvider,
  adminRejectProvider,
  getAdminProblems,
  adminApproveProblem,
  adminRejectProblem,
  getAdminProblemInterests,
  getAdminPendingAgentEdits,
  adminApproveAgentEdit,
  adminRejectAgentEdit,
  getAdminPendingTspEdits,
  adminApproveTspEdit,
  adminRejectTspEdit,
} from '@/lib/api/admin'

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export function useAdminSession() {
  const supabase = useSupabaseClient()
  const stored = getStoredAdminSession()

  const query = useQuery({
    queryKey: ['admin-session', stored?.token],
    queryFn: () => validateAdminSession(supabase!, stored!.token),
    enabled: !!supabase && !!stored,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    isValid: query.data === true,
    token: stored?.token ?? null,
    isLoading: !!stored && query.isLoading,
  }
}

export function useAdminLogin() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) => adminLogin(supabase!, password),
    onSuccess: (data) => {
      storeAdminSession(data.session_token, data.expires_at)
      queryClient.invalidateQueries({ queryKey: ['admin-session'] })
    },
  })
}

export function useAdminLogout() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionToken: string) => adminLogout(supabase!, sessionToken),
    onSuccess: () => {
      clearAdminSession()
      queryClient.invalidateQueries({ queryKey: ['admin-session'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Contact Requests
// ---------------------------------------------------------------------------

export function usePendingContactRequests(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-contact-requests', token],
    queryFn: () => getPendingContactRequests(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useApproveContactRequest() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, requestId }: { token: string; requestId: string }) =>
      approveContactRequest(supabase!, token, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-contact-requests'] })
    },
  })
}

export function useRejectContactRequest() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, requestId, notes }: { token: string; requestId: string; notes?: string }) =>
      rejectContactRequest(supabase!, token, requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-contact-requests'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Agent Submissions
// ---------------------------------------------------------------------------

export function usePendingAgentSubmissions(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-agents', token],
    queryFn: () => getAdminPendingAgents(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useAdminApproveAgent() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, submissionId }: { token: string; submissionId: string }) =>
      adminApproveAgent(supabase!, token, submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-agents'] })
    },
  })
}

export function useAdminRejectAgent() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, submissionId, notes }: { token: string; submissionId: string; notes?: string }) =>
      adminRejectAgent(supabase!, token, submissionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-agents'] })
    },
  })
}

export function useAdminRequestChangesAgent() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, submissionId, notes }: { token: string; submissionId: string; notes?: string }) =>
      adminRequestChangesAgent(supabase!, token, submissionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-agents'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Provider Submissions
// ---------------------------------------------------------------------------

export function usePendingProviderSubmissions(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-providers', token],
    queryFn: () => getAdminPendingProviders(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useAdminApproveProvider() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, profileId }: { token: string; profileId: string }) =>
      adminApproveProvider(supabase!, token, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-providers'] })
    },
  })
}

export function useAdminRejectProvider() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, profileId, notes }: { token: string; profileId: string; notes?: string }) =>
      adminRejectProvider(supabase!, token, profileId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-providers'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------

export function usePendingProblems(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-problems', token],
    queryFn: () => getAdminProblems(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useAdminApproveProblem() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, problemId }: { token: string; problemId: string }) =>
      adminApproveProblem(supabase!, token, problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-problems'] })
    },
  })
}

export function useAdminRejectProblem() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, problemId, notes }: { token: string; problemId: string; notes?: string }) =>
      adminRejectProblem(supabase!, token, problemId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-problems'] })
    },
  })
}

export function useProblemInterests(token: string | undefined, problemId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-problem-interests', token, problemId],
    queryFn: () => getAdminProblemInterests(supabase!, token!, problemId!),
    enabled: !!supabase && !!token && !!problemId,
  })
}

// ---------------------------------------------------------------------------
// Agent Edits
// ---------------------------------------------------------------------------

export function usePendingAgentEdits(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-agent-edits', token],
    queryFn: () => getAdminPendingAgentEdits(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useAdminApproveAgentEdit() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, editId }: { token: string; editId: string }) =>
      adminApproveAgentEdit(supabase!, token, editId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-agent-edits'] })
    },
  })
}

export function useAdminRejectAgentEdit() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, editId, notes }: { token: string; editId: string; notes?: string }) =>
      adminRejectAgentEdit(supabase!, token, editId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-agent-edits'] })
    },
  })
}

// ---------------------------------------------------------------------------
// TSP Edits
// ---------------------------------------------------------------------------

export function usePendingTspEdits(token: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['admin-pending-tsp-edits', token],
    queryFn: () => getAdminPendingTspEdits(supabase!, token!),
    enabled: !!supabase && !!token,
  })
}

export function useAdminApproveTspEdit() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, editId }: { token: string; editId: string }) =>
      adminApproveTspEdit(supabase!, token, editId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-tsp-edits'] })
    },
  })
}

export function useAdminRejectTspEdit() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, editId, notes }: { token: string; editId: string; notes?: string }) =>
      adminRejectTspEdit(supabase!, token, editId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-tsp-edits'] })
    },
  })
}
