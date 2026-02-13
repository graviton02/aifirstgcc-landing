import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, PlusCircle, XCircle, Inbox, FileText, UserCog, MessageSquare } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { OnboardingBanner } from '@/components/provider/OnboardingBanner'
import { RequestsTab } from '@/components/provider/RequestsTab'
import { SubmissionsTab } from '@/components/provider/SubmissionsTab'
import { ProfileTab } from '@/components/provider/ProfileTab'
import { useProviderProfile, useProviderSubmission, useProviderRequests } from '@/hooks/use-provider'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'requests', label: 'Requests', icon: Inbox },
  { key: 'submissions', label: 'Submissions', icon: FileText },
  { key: 'profile', label: 'Profile', icon: UserCog },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function ProviderDashboard() {
  const { data: profile, isLoading } = useProviderProfile()
  const { data: submission } = useProviderSubmission(profile?.id)
  const { data: requests } = useProviderRequests(profile?.id)
  const [activeTab, setActiveTab] = useState<TabKey>('requests')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const isApproved = profile?.status === 'approved'
  const isRejected = profile?.status === 'rejected'

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-enterprise-900">
            Provider Dashboard
          </h1>
          {isApproved ? (
            <Link
              to="/list-your-agent"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              List Agent
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-enterprise-100 text-enterprise-400 text-sm font-semibold cursor-not-allowed">
              <PlusCircle className="w-4 h-4" />
              List Agent
            </span>
          )}
        </div>

        {/* Banners */}
        <div className="space-y-3 mb-8">
          <OnboardingBanner />

          <NewRequestsBanner
            count={requests?.filter((r) => r.status === 'approved').length ?? 0}
            onViewRequests={() => setActiveTab('requests')}
          />

          {isRejected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Your profile has been rejected
                </p>
                {submission?.admin_notes && (
                  <p className="text-xs text-red-700 mt-1">
                    {submission.admin_notes}
                  </p>
                )}
                <Link
                  to="/onboarding/form"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                >
                  Resubmit your application &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="border-b border-enterprise-200 mb-6">
          <nav className="-mb-px flex gap-6" aria-label="Dashboard tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              const disabled = isRejected

              return (
                <button
                  key={tab.key}
                  onClick={() => !disabled && setActiveTab(tab.key)}
                  disabled={disabled}
                  className={cn(
                    'inline-flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                    isActive && !disabled
                      ? 'border-primary text-primary'
                      : 'border-transparent',
                    disabled
                      ? 'text-enterprise-300 cursor-not-allowed'
                      : !isActive
                        ? 'text-enterprise-500 hover:text-enterprise-700 hover:border-enterprise-300'
                        : ''
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab content */}
        {!isRejected && (
          <div className="py-4">
            {activeTab === 'requests' && profile && (
              <RequestsTab profileId={profile.id} />
            )}
            {activeTab === 'submissions' && profile && (
              <SubmissionsTab profileId={profile.id} isApproved={isApproved ?? false} />
            )}
            {activeTab === 'profile' && profile && (
              <ProfileTab profileId={profile.id} />
            )}
          </div>
        )}
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------------------
// New Requests Banner
// ---------------------------------------------------------------------------

function NewRequestsBanner({
  count,
  onViewRequests,
}: {
  count: number
  onViewRequests: () => void
}) {
  if (count === 0) return null

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
      <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">
          You have {count} new contact request{count !== 1 ? 's' : ''}!
        </p>
        <p className="text-xs text-blue-700 mt-0.5">
          GCC organizations want to connect about your agents.
        </p>
      </div>
      <button
        onClick={onViewRequests}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
      >
        View Requests
      </button>
    </div>
  )
}
