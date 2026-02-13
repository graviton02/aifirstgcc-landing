import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useAuth } from '@clerk/clerk-react'
import { useProviderProfile } from '@/hooks/use-provider'
import { useSubmitAgent } from '@/hooks/use-agents'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { uploadLogo } from '@/lib/api/storage'
import { WizardShell } from '@/components/provider/wizard/WizardShell'
import { AgentPage1 } from '@/components/provider/agent-wizard/AgentPage1'
import { AgentPage2 } from '@/components/provider/agent-wizard/AgentPage2'
import { AgentPage3 } from '@/components/provider/agent-wizard/AgentPage3'
import { AgentPage4 } from '@/components/provider/agent-wizard/AgentPage4'
import { AgentPage5 } from '@/components/provider/agent-wizard/AgentPage5'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const PAGE_LABELS = [
  'Basics',
  'Use Cases',
  'How It Works',
  'Impact',
  'Extras',
]

export default function ListAgent() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const supabase = useSupabaseClient()
  const { data: profile, isLoading: profileLoading } = useProviderProfile()
  const submitAgent = useSubmitAgent()

  const [currentPage, setCurrentPage] = useState(1)
  const [completedPages, setCompletedPages] = useState<number[]>([])
  const [formData, setFormData] = useState<PartialAgent>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const markComplete = useCallback((page: number) => {
    setCompletedPages((prev) =>
      prev.includes(page) ? prev : [...prev, page].sort((a, b) => a - b),
    )
  }, [])

  const handleSavePage = useCallback(
    (pageData: PartialAgent, file?: File | null) => {
      setFormData((prev) => ({ ...prev, ...pageData }))
      if (file !== undefined) setLogoFile(file)
      markComplete(currentPage)

      if (currentPage < 5) {
        setCurrentPage(currentPage + 1)
      }
    },
    [currentPage, markComplete],
  )

  const handleSubmit = useCallback(
    async (pageData: PartialAgent) => {
      if (!profile || !userId || !supabase) return

      setIsSubmitting(true)
      const merged = { ...formData, ...pageData }

      try {
        // Upload logo if a file was selected
        let logoUrl = merged.logo_url ?? null
        if (logoFile) {
          logoUrl = await uploadLogo(supabase, 'agent-logos', userId, logoFile)
        }

        const submission: Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          provider_profile_id: profile.id,
          agent_name: merged.agent_name ?? '',
          tagline: merged.tagline ?? null,
          description: merged.description ?? '',
          category: merged.category ?? '',
          logo_url: logoUrl,
          tags: merged.tags ?? [],
          use_cases: merged.use_cases ?? [],
          industries: merged.industries ?? [],
          integration_type: merged.integration_type ?? null,
          supported_platforms: merged.supported_platforms ?? [],
          data_requirements: merged.data_requirements ?? null,
          impact_metrics: merged.impact_metrics ?? [],
          demo_url: merged.demo_url ?? null,
          compliance_certifications: merged.compliance_certifications ?? [],
          security_features: merged.security_features ?? [],
          submission_status: 'pending',
          admin_notes: null,
        }

        submitAgent.mutate(submission, {
          onSuccess: () => {
            toast.success('Agent submitted for review!')
            setTimeout(() => navigate('/provider'), 600)
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to submit agent')
            setIsSubmitting(false)
          },
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Upload failed')
        setIsSubmitting(false)
      }
    },
    [formData, logoFile, profile, userId, supabase, submitAgent, navigate],
  )

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-enterprise-500">No profile found. Please complete onboarding first.</p>
      </div>
    )
  }

  const allPagesComplete =
    completedPages.length === 5 ||
    (completedPages.length === 4 && !completedPages.includes(currentPage))

  const isSaving = isSubmitting || submitAgent.isPending

  return (
    <div>
      <Toaster position="top-center" richColors />

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-enterprise-900">List Your Agent</h1>
        <p className="text-sm text-enterprise-500 mt-1">
          Submit a new AI agent to the Orbyt marketplace.
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
            data={formData}
            onSave={handleSavePage}
            isSaving={isSaving}
          />
        )}
        {currentPage === 2 && (
          <AgentPage2
            data={formData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 3 && (
          <AgentPage3
            data={formData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 4 && (
          <AgentPage4
            data={formData}
            onSave={(d) => handleSavePage(d)}
            isSaving={isSaving}
          />
        )}
        {currentPage === 5 && (
          <AgentPage5
            data={formData}
            onSave={(d) => {
              setFormData((prev) => ({ ...prev, ...d }))
              markComplete(5)
            }}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            allPagesComplete={allPagesComplete}
          />
        )}
      </WizardShell>
    </div>
  )
}
