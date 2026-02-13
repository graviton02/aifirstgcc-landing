import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { useProviderProfile, useProviderSubmission } from '@/hooks/use-provider'

export function OnboardingBanner() {
  const { data: profile } = useProviderProfile()
  const { data: submission } = useProviderSubmission(profile?.id)

  if (!profile) return null

  // Approved profile — no banner needed
  if (profile.status === 'approved') return null

  // Submission exists and is pending review
  if (submission && submission.submission_status === 'pending') {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            Your submission is under review
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            We'll notify you once our team has reviewed your application.
          </p>
        </div>
      </div>
    )
  }

  // Submission approved
  if (submission && submission.submission_status === 'approved') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm font-medium text-green-900 flex-1">
          Your submission has been approved!
        </p>
      </div>
    )
  }

  // Draft — partially complete
  if (submission && submission.submission_status === 'draft') {
    const completedCount = submission.completed_pages?.length ?? 0
    const nextPage = getNextIncompletePage(submission.completed_pages ?? [])

    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            Your onboarding is {completedCount}/5 sections complete
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Complete all sections and submit for review to get listed on the platform.
          </p>
        </div>
        <Link
          to={`/onboarding/form?page=${nextPage}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors flex-shrink-0"
        >
          Continue Form
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  // No submission at all — need to start
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          Complete your onboarding forms to get listed
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          Fill out the 5-section form so our team can review and approve your profile.
        </p>
      </div>
      <Link
        to="/onboarding/form"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors flex-shrink-0"
      >
        Start Form
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function getNextIncompletePage(completedPages: number[]): number {
  for (let i = 1; i <= 5; i++) {
    if (!completedPages.includes(i)) return i
  }
  return 1
}
