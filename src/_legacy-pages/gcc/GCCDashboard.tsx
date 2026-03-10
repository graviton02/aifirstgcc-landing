import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useOrganization } from '@clerk/clerk-react'
import {
  Loader2,
  Star,
  MessageSquare,
  Lightbulb,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { ShortlistedAgentsTab } from '@/components/gcc/ShortlistedAgentsTab'
import { CurrentRequestsTab } from '@/components/gcc/CurrentRequestsTab'
import { ProblemHubTab } from '@/components/gcc/ProblemHubTab'
import { useShortlist, useMyContactRequests, useMyProblems } from '@/hooks/use-gcc'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'shortlisted', label: 'Shortlisted Agents', icon: Star },
  { key: 'requests', label: 'Current Requests', icon: MessageSquare },
  { key: 'problems', label: 'Problem Hub', icon: Lightbulb },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function GCCDashboard() {
  const { userId, orgId } = useAuth()
  const { organization } = useOrganization()
  const [activeTab, setActiveTab] = useState<TabKey>('shortlisted')

  // Stat counts
  const { data: shortlist, isLoading: shortlistLoading } = useShortlist(orgId ?? undefined)
  const { data: requests, isLoading: requestsLoading } = useMyContactRequests(userId ?? undefined)
  const { data: problems, isLoading: problemsLoading } = useMyProblems(orgId ?? undefined)

  const isLoading = !orgId || !userId

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Shortlisted',
      value: shortlistLoading ? '—' : (shortlist?.length ?? 0),
      tab: 'shortlisted' as TabKey,
    },
    {
      label: 'Pending Requests',
      value: requestsLoading
        ? '—'
        : (requests?.filter((r) => r.status === 'pending_admin' || r.status === 'approved').length ?? 0),
      tab: 'requests' as TabKey,
    },
    {
      label: 'Problems',
      value: problemsLoading ? '—' : (problems?.length ?? 0),
      tab: 'problems' as TabKey,
    },
  ]

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-enterprise-900">
                GCC Dashboard
              </h1>
              {organization?.name && (
                <p className="text-sm text-enterprise-500">{organization.name}</p>
              )}
            </div>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Browse Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => setActiveTab(stat.tab)}
              className={cn(
                'rounded-xl border p-4 text-center transition-all',
                activeTab === stat.tab
                  ? 'border-purple-300 bg-purple-50 shadow-sm'
                  : 'border-enterprise-200 bg-white hover:border-enterprise-300',
              )}
            >
              <p className="text-2xl font-display font-bold text-enterprise-900">{stat.value}</p>
              <p className="text-xs text-enterprise-500 mt-0.5">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="border-b border-enterprise-200 mb-6">
          <nav className="-mb-px flex gap-6" aria-label="Dashboard tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-enterprise-500 hover:text-enterprise-700 hover:border-enterprise-300',
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
        <div className="py-4">
          {activeTab === 'shortlisted' && (
            <ShortlistedAgentsTab orgId={orgId} />
          )}
          {activeTab === 'requests' && (
            <CurrentRequestsTab />
          )}
          {activeTab === 'problems' && (
            <ProblemHubTab orgId={orgId} />
          )}
        </div>
      </Container>
    </div>
  )
}
