import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useSupabaseClient } from '@/lib/supabase-auth'
import type { AgentSubmission } from '@/types/agent'
import {
  getAgents,
  getAgentById,
  getAgentsByIds,
  getAgentsByProvider,
  submitAgent,
  getAgentSubmissions,
  createAgentEdit,
  getAgentEdits,
  softDeleteAgent,
  type AgentFilters,
} from '@/lib/api/agents'
import { getProviderProfileById } from '@/lib/api/providers'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useAgents(filters?: AgentFilters) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['agents', filters],
    queryFn: () => getAgents(supabase!, filters),
    enabled: !!supabase,
  })
}

export function useAgentDetail(agentId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => getAgentById(supabase!, agentId!),
    enabled: !!supabase && !!agentId,
  })
}

export function useAgentsByIds(ids: string[] | undefined) {
  const supabase = useSupabaseClient()
  const sortedIds = ids?.slice().sort()

  return useQuery({
    queryKey: ['agents-by-ids', sortedIds],
    queryFn: () => getAgentsByIds(supabase!, sortedIds!),
    enabled: !!supabase && !!sortedIds && sortedIds.length > 0,
  })
}

export function useAgentProvider(profileId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['provider-profile', profileId],
    queryFn: () => getProviderProfileById(supabase!, profileId!),
    enabled: !!supabase && !!profileId,
  })
}

export function useMyAgents(profileId: string | undefined) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['my-agents', profileId],
    queryFn: () => getAgentsByProvider(supabase!, profileId!),
    enabled: !!supabase && !!profileId,
  })
}

export function useMyAgentSubmissions() {
  const { userId } = useAuth()
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['my-agent-submissions', userId],
    queryFn: () => getAgentSubmissions(supabase!, userId!),
    enabled: !!supabase && !!userId,
  })
}

export function useMyAgentEdits() {
  const { userId } = useAuth()
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['my-agent-edits', userId],
    queryFn: () => getAgentEdits(supabase!, userId!),
    enabled: !!supabase && !!userId,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useSubmitAgent() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>) =>
      submitAgent(supabase!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agent-submissions'] })
    },
  })
}

export function useCreateAgentEdit() {
  const { userId } = useAuth()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ agentId, payload }: { agentId: string; payload: Record<string, unknown> }) =>
      createAgentEdit(supabase!, agentId, userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agent-edits'] })
    },
  })
}

export function useSoftDeleteAgent() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agentId: string) => softDeleteAgent(supabase!, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agents'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
