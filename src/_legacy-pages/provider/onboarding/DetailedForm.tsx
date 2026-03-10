import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useAuth } from '@clerk/clerk-react'
import {
  useProviderProfile,
  useProviderSubmission,
  useSaveTspPage,
  useSaveStartupPage,
  useFinalizeSubmission,
} from '@/hooks/use-provider'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { uploadLogo } from '@/lib/api/storage'
import type { TspSubmission, StartupSubmission } from '@/types/provider'
import { WizardShell } from '@/components/provider/wizard/WizardShell'
import { TspPage1 } from '@/components/provider/wizard/TspPage1'
import { TspPage2 } from '@/components/provider/wizard/TspPage2'
import { TspPage3 } from '@/components/provider/wizard/TspPage3'
import { TspPage4 } from '@/components/provider/wizard/TspPage4'
import { TspPage5 } from '@/components/provider/wizard/TspPage5'
import { StartupPage1 } from '@/components/provider/wizard/StartupPage1'
import { StartupPage2 } from '@/components/provider/wizard/StartupPage2'
import { StartupPage3 } from '@/components/provider/wizard/StartupPage3'
import { StartupPage4 } from '@/components/provider/wizard/StartupPage4'
import { StartupPage5 } from '@/components/provider/wizard/StartupPage5'

const TSP_PAGE_LABELS = [
  'Company Profile',
  'AI-First Positioning',
  'Capabilities',
  'Track Record',
  'Vision & Contact',
]

const STARTUP_PAGE_LABELS = [
  'Company Profile',
  'Product & Technology',
  'Market & Traction',
  'Compliance & Security',
  'Contact & Partnership',
]

export default function DetailedForm() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { userId } = useAuth()
  const supabase = useSupabaseClient()
  const { data: profile, isLoading: profileLoading } = useProviderProfile()
  const { data: submission, isLoading: submissionLoading } = useProviderSubmission(profile?.id)

  const saveTspPage = useSaveTspPage()
  const saveStartupPage = useSaveStartupPage()
  const finalize = useFinalizeSubmission()
  const [isUploading, setIsUploading] = useState(false)

  const isSaving = saveTspPage.isPending || saveStartupPage.isPending || finalize.isPending || isUploading

  const rawPage = parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage = rawPage >= 1 && rawPage <= 5 ? rawPage : 1

  const completedPages = submission?.completed_pages ?? []
  const isTsp = profile?.category === 'tsp'
  const pageLabels = isTsp ? TSP_PAGE_LABELS : STARTUP_PAGE_LABELS

  const goToPage = useCallback(
    (page: number) => {
      setSearchParams({ page: String(page) })
    },
    [setSearchParams],
  )

  // Upload logo file if provided, returning the merged page data with logo_url
  const uploadLogoIfNeeded = useCallback(
    async (
      pageData: Partial<TspSubmission> | Partial<StartupSubmission>,
      logoFile?: File | null,
    ): Promise<Partial<TspSubmission> | Partial<StartupSubmission>> => {
      if (!logoFile || !userId || !supabase) return pageData

      setIsUploading(true)
      try {
        const logoUrl = await uploadLogo(supabase, 'provider-logos', userId, logoFile)
        return { ...pageData, logo_url: logoUrl }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload logo')
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [userId, supabase],
  )

  const handleSavePage = useCallback(
    (pageData: Partial<TspSubmission> | Partial<StartupSubmission>, advance: boolean) => {
      if (!profile) return

      const mutate = isTsp ? saveTspPage : saveStartupPage

      mutate.mutate(
        {
          profileId: profile.id,
          pageData,
          pageNumber: currentPage,
        } as never, // type narrowing handled by isTsp check
        {
          onSuccess: () => {
            if (advance && currentPage < 5) {
              goToPage(currentPage + 1)
            } else if (advance && currentPage === 5) {
              toast.success('Page saved!')
            }
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to save. Please try again.')
          },
        },
      )
    },
    [profile, isTsp, saveTspPage, saveStartupPage, currentPage, goToPage],
  )

  const handleSaveAndNext = useCallback(
    async (pageData: Partial<TspSubmission> | Partial<StartupSubmission>, logoFile?: File | null) => {
      try {
        const data = await uploadLogoIfNeeded(pageData, logoFile)
        handleSavePage(data, true)
      } catch {
        // Upload error already toasted
      }
    },
    [handleSavePage, uploadLogoIfNeeded],
  )

  const handleSaveAndExit = useCallback(
    async (pageData: Partial<TspSubmission> | Partial<StartupSubmission>, logoFile?: File | null) => {
      if (!profile) return

      try {
        const data = await uploadLogoIfNeeded(pageData, logoFile)

        const mutate = isTsp ? saveTspPage : saveStartupPage

        mutate.mutate(
          {
            profileId: profile.id,
            pageData: data,
            pageNumber: currentPage,
          } as never,
          {
            onSuccess: () => {
              navigate('/provider')
            },
            onError: (error) => {
              toast.error(error.message || 'Failed to save. Please try again.')
            },
          },
        )
      } catch {
        // Upload error already toasted
      }
    },
    [profile, isTsp, saveTspPage, saveStartupPage, currentPage, navigate, uploadLogoIfNeeded],
  )

  const handleSubmitForReview = useCallback(
    (pageData: Partial<TspSubmission> | Partial<StartupSubmission>) => {
      if (!profile) return

      const mutate = isTsp ? saveTspPage : saveStartupPage
      const table = isTsp ? 'tsp_submissions' : 'startup_submissions'

      // Save page 5 first, then finalize
      mutate.mutate(
        {
          profileId: profile.id,
          pageData,
          pageNumber: 5,
        } as never,
        {
          onSuccess: (savedSubmission) => {
            finalize.mutate(
              { submissionId: savedSubmission.id, table },
              {
                onSuccess: () => {
                  toast.success('Submitted for review!')
                  navigate('/provider')
                },
                onError: (error) => {
                  toast.error(error.message || 'Failed to submit. Please try again.')
                },
              },
            )
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to save. Please try again.')
          },
        },
      )
    },
    [profile, isTsp, saveTspPage, saveStartupPage, finalize, navigate],
  )

  if (profileLoading || submissionLoading) {
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
        <button
          onClick={() => navigate('/onboarding/category')}
          className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          Go to Category Select
        </button>
      </div>
    )
  }

  // Already submitted — redirect to dashboard
  if (submission && submission.submission_status === 'pending') {
    navigate('/provider')
    return null
  }

  const tspSubmission = isTsp ? (submission as TspSubmission | null) : null
  const startupSubmission = !isTsp ? (submission as StartupSubmission | null) : null

  // Check if all 5 pages would be complete after saving current page
  const allPagesComplete =
    completedPages.length === 5 ||
    (completedPages.length === 4 && !completedPages.includes(currentPage))

  return (
    <div>
      <Toaster position="top-center" richColors />

      <WizardShell
        currentPage={currentPage}
        completedPages={completedPages}
        totalPages={5}
        pageLabels={pageLabels}
        onPageClick={goToPage}
      >
        {isTsp ? (
          <>
            {currentPage === 1 && (
              <TspPage1
                submission={tspSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 2 && (
              <TspPage2
                submission={tspSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 3 && (
              <TspPage3
                submission={tspSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 4 && (
              <TspPage4
                submission={tspSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 5 && (
              <TspPage5
                submission={tspSubmission}
                onSave={(data) => handleSavePage(data, false)}
                onSaveAndExit={handleSaveAndExit}
                onSubmitForReview={handleSubmitForReview}
                isSaving={isSaving}
                allPagesComplete={allPagesComplete}
              />
            )}
          </>
        ) : (
          <>
            {currentPage === 1 && (
              <StartupPage1
                submission={startupSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 2 && (
              <StartupPage2
                submission={startupSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 3 && (
              <StartupPage3
                submission={startupSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 4 && (
              <StartupPage4
                submission={startupSubmission}
                onSave={handleSaveAndNext}
                onSaveAndExit={handleSaveAndExit}
                isSaving={isSaving}
              />
            )}
            {currentPage === 5 && (
              <StartupPage5
                submission={startupSubmission}
                onSave={(data) => handleSavePage(data, false)}
                onSaveAndExit={handleSaveAndExit}
                onSubmitForReview={handleSubmitForReview}
                isSaving={isSaving}
                allPagesComplete={allPagesComplete}
              />
            )}
          </>
        )}
      </WizardShell>
    </div>
  )
}
