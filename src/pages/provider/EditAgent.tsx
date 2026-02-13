import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useProviderProfile } from '@/hooks/use-provider'
import { useAgentDetail, useCreateAgentEdit } from '@/hooks/use-agents'
import { WizardShell } from '@/components/provider/wizard/WizardShell'
import { AgentPage1 } from '@/components/provider/agent-wizard/AgentPage1'
import { AgentPage2 } from '@/components/provider/agent-wizard/AgentPage2'
import { AgentPage3 } from '@/components/provider/agent-wizard/AgentPage3'
import { AgentPage4 } from '@/components/provider/agent-wizard/AgentPage4'
import { AgentPage5 } from '@/components/provider/agent-wizard/AgentPage5'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const PAGE_LABELS = ['Basics', 'Use Cases', 'How It Works', 'Impact', 'Extras']

export default function EditAgent() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useProviderProfile()
  const { data: agent, isLoading: agentLoading } = useAgentDetail(agentId)
  const createEdit = useCreateAgentEdit()

  const [currentPage, setCurrentPage] = useState(1)
  const [completedPages, setCompletedPages] = useState<number[]>([1, 2, 3, 4, 5])
  const [formData, setFormData] = useState<PartialAgent>({})
  const [hasEdited, setHasEdited] = useState(false)

  // Build initial data from agent (memoized so pages don't reset)
  const initialData = useMemo<PartialAgent>(() => {
    if (!agent) return {}
    return {
      agent_name: agent.agent_name,
      tagline: agent.tagline,
      description: agent.description,
      category: agent.category,
      logo_url: agent.logo_url,
      tags: agent.tags,
      use_cases: agent.use_cases,
      industries: agent.industries,
      integration_type: agent.integration_type,
      supported_platforms: agent.supported_platforms,
      data_requirements: agent.data_requirements,
      impact_metrics: agent.impact_metrics,
      demo_url: agent.demo_url,
      compliance_certifications: agent.compliance_certifications,
      security_features: agent.security_features,
    }
  }, [agent])

  // Merge initial + edits
  const mergedData = useMemo(
    () => ({ ...initialData, ...formData }),
    [initialData, formData],
  )

  const markComplete = useCallback((page: number) => {
    setCompletedPages((prev) =>
      prev.includes(page) ? prev : [...prev, page].sort((a, b) => a - b),
    )
  }, [])

  const handleSavePage = useCallback(
    (pageData: PartialAgent) => {
      setFormData((prev) => ({ ...prev, ...pageData }))
      setHasEdited(true)
      markComplete(currentPage)
      if (currentPage < 5) {
        setCurrentPage(currentPage + 1)
      }
    },
    [currentPage, markComplete],
  )

  const handleSubmitEdit = useCallback(
    (pageData: PartialAgent) => {
      if (!agent) return

      const merged = { ...formData, ...pageData }

      // Compute diff against original agent
      const diff: Record<string, unknown> = {}
      const original = initialData as Record<string, unknown>

      for (const [key, value] of Object.entries(merged)) {
        const orig = original[key]
        // Deep compare for arrays/objects
        if (JSON.stringify(value) !== JSON.stringify(orig)) {
          diff[key] = value
        }
      }

      if (Object.keys(diff).length === 0) {
        toast.info('No changes detected')
        return
      }

      createEdit.mutate(
        { agentId: agent.id, payload: diff },
        {
          onSuccess: () => {
            toast.success('Edit request submitted for review!')
            setTimeout(() => navigate('/provider'), 600)
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to submit edit request')
          },
        },
      )
    },
    [agent, formData, initialData, createEdit, navigate],
  )

  // Loading
  if (profileLoading || agentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    )
  }

  // Agent not found
  if (!agent) {
    return (
      <div className="text-center py-20">
        <p className="text-enterprise-500">Agent not found.</p>
        <button
          onClick={() => navigate('/provider')}
          className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Ownership check
  if (profile && agent.provider_profile_id !== profile.id) {
    return <Navigate to="/provider" replace />
  }

  const isSaving = createEdit.isPending

  return (
    <div>
      <Toaster position="top-center" richColors />

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-enterprise-900">Edit Agent</h1>
        <p className="text-sm text-enterprise-500 mt-1">
          Update <span className="font-medium text-enterprise-700">{agent.agent_name}</span>. Changes will be submitted for admin review.
        </p>
      </div>

      <WizardShell
        currentPage={currentPage}
        completedPages={completedPages}
        totalPages={5}
        pageLabels={PAGE_LABELS}
        onPageClick={setCurrentPage}
      >
        {currentPage === 1 && (
          <AgentPage1
            data={mergedData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 2 && (
          <AgentPage2
            data={mergedData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 3 && (
          <AgentPage3
            data={mergedData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 4 && (
          <AgentPage4
            data={mergedData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 5 && (
          <AgentPage5
            data={mergedData}
            onSave={(d) => {
              setFormData((prev) => ({ ...prev, ...d }))
              setHasEdited(true)
              markComplete(5)
            }}
            onSubmit={handleSubmitEdit}
            isSaving={isSaving}
            allPagesComplete={hasEdited}
          />
        )}
      </WizardShell>
    </div>
  )
}
