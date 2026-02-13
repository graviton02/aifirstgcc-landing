import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useSupabaseClient } from '@/lib/supabase-auth'
import type { ProviderProfile, TspSubmission, StartupSubmission } from '@/types/provider'
import {
  getProviderProfile,
  createProviderProfile,
  updateProviderProfile,
  getProviderSubmission,
  submitTspForm,
  submitStartupForm,
  upsertTspDraft,
  upsertStartupDraft,
  finalizeSubmission,
  createTspEdit,
  getTspEdits,
  getProviderRequests,
  updateProviderRequestStatus,
} from '@/lib/api/providers'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useProviderProfile() {
  const { userId } = useAuth()
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['provider-profile', userId],
    queryFn: () => getProviderProfile(supabase!, userId!),
    enabled: !!supabase && !!userId,
  })
}

export function useProviderSubmission(profileId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['provider-submission', profileId],
    queryFn: () => getProviderSubmission(supabase!, profileId!),
    enabled: !!supabase && !!profileId,
  })
}

export function useProviderRequests(profileId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['provider-requests', profileId],
    queryFn: () => getProviderRequests(supabase!, profileId!),
    enabled: !!supabase && !!profileId,
  })
}

export function useTspEdits() {
  const { userId } = useAuth()
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['tsp-edits', userId],
    queryFn: () => getTspEdits(supabase!, userId!),
    enabled: !!supabase && !!userId,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateProviderProfile() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>) =>
      createProviderProfile(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
  })
}

export function useSubmitTspForm() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<TspSubmission, 'id' | 'created_at' | 'updated_at'>) =>
      submitTspForm(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-submission'] })
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
  })
}

export function useSubmitStartupForm() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<StartupSubmission, 'id' | 'created_at' | 'updated_at'>) =>
      submitStartupForm(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-submission'] })
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
  })
}

export function useUpdateProfile() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProviderProfile> }) =>
      updateProviderProfile(supabase!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
  })
}

export function useSaveTspPage() {
  const supabase = useSupabaseClient()
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      profileId,
      pageData,
      pageNumber,
    }: {
      profileId: string
      pageData: Partial<TspSubmission>
      pageNumber: number
    }) => upsertTspDraft(supabase!, profileId, userId!, pageData, pageNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-submission'] })
    },
  })
}

export function useSaveStartupPage() {
  const supabase = useSupabaseClient()
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      profileId,
      pageData,
      pageNumber,
    }: {
      profileId: string
      pageData: Partial<StartupSubmission>
      pageNumber: number
    }) => upsertStartupDraft(supabase!, profileId, userId!, pageData, pageNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-submission'] })
    },
  })
}

export function useFinalizeSubmission() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      submissionId,
      table,
    }: {
      submissionId: string
      table: 'tsp_submissions' | 'startup_submissions'
    }) => finalizeSubmission(supabase!, submissionId, table),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-submission'] })
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    },
  })
}

export function useUpdateProviderProfile() {
  const supabase = useSupabaseClient()
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tspId, payload }: { tspId: string; payload: Record<string, unknown> }) =>
      createTspEdit(supabase!, tspId, userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
      queryClient.invalidateQueries({ queryKey: ['tsp-edits'] })
    },
  })
}

export function useMarkRequestContacted() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) =>
      updateProviderRequestStatus(supabase!, requestId, 'contacted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-requests'] })
    },
  })
}

export function useArchiveRequest() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) =>
      updateProviderRequestStatus(supabase!, requestId, 'archived'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-requests'] })
    },
  })
}
