import { Component, useState } from 'react'
import type { ErrorInfo, ReactNode, FormEvent } from 'react'
import { Container } from '@/components/shared/Container'
import {
  Shield,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  LogOut,
  MessageSquareDashed,
  Bot,
  Building2,
  FileQuestion,
  AlertTriangle,
} from 'lucide-react'
import {
  useAdminSession,
  useAdminLogin,
  useAdminLogout,
  usePendingContactRequests,
  useApproveContactRequest,
  useRejectContactRequest,
  usePendingAgentSubmissions,
  usePendingProviderSubmissions,
  usePendingProblems,
} from '@/hooks/use-admin'
import { AgentsTab } from '@/components/admin/AgentsTab'
import { ProvidersTab } from '@/components/admin/ProvidersTab'
import { ProblemsTab } from '@/components/admin/ProblemsTab'
import type { PendingContactRequest } from '@/lib/api/admin'

type AdminTab = 'contacts' | 'agents' | 'providers' | 'problems'

// ---------------------------------------------------------------------------
// Error Boundary — catches render errors and shows them
// ---------------------------------------------------------------------------

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AdminDashboard error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-enterprise-50 flex items-center justify-center p-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-enterprise-900 mb-4">
              Something went wrong
            </h1>
            <pre className="text-left text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 overflow-auto max-h-64 mb-4">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-enterprise-900 text-white text-sm font-semibold hover:bg-enterprise-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  return (
    <AdminErrorBoundary>
      <AdminDashboardInner />
    </AdminErrorBoundary>
  )
}

function AdminDashboardInner() {
  const { isValid, token, isLoading } = useAdminSession()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-enterprise-500">Validating admin session...</p>
        </div>
      </div>
    )
  }

  if (!isValid || !token) {
    return <AdminLoginForm />
  }

  return <AuthenticatedDashboard token={token} />
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

function AdminLoginForm() {
  const [password, setPassword] = useState('')
  const login = useAdminLogin()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password.trim()) return
    login.mutate(password)
  }

  return (
    <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-enterprise-900">
            Admin Access
          </h1>
          <p className="text-sm text-enterprise-500 mt-1">
            Enter the admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {login.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {login.error instanceof Error ? login.error.message : 'Login failed'}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending || !password.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-enterprise-900 px-4 py-3 text-sm font-semibold text-white hover:bg-enterprise-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {login.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard (shown after auth)
// ---------------------------------------------------------------------------

function AuthenticatedDashboard({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('contacts')
  const logout = useAdminLogout()

  // Fetch counts for the tab badges
  const { data: contactRequests } = usePendingContactRequests(token)
  const { data: agentSubmissions } = usePendingAgentSubmissions(token)
  const { data: providerSubmissions } = usePendingProviderSubmissions(token)
  const { data: problems } = usePendingProblems(token)

  const pendingProblemCount = problems?.filter((p) => p.status === 'pending_review').length ?? 0

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'contacts',
      label: 'Contact Requests',
      icon: <MessageSquareDashed className="w-4 h-4" />,
      count: contactRequests?.length ?? 0,
    },
    {
      key: 'agents',
      label: 'Agents',
      icon: <Bot className="w-4 h-4" />,
      count: agentSubmissions?.length ?? 0,
    },
    {
      key: 'providers',
      label: 'Providers',
      icon: <Building2 className="w-4 h-4" />,
      count: providerSubmissions?.length ?? 0,
    },
    {
      key: 'problems',
      label: 'Problems',
      icon: <FileQuestion className="w-4 h-4" />,
      count: pendingProblemCount,
    },
  ]

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-enterprise-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-enterprise-500">
              Review and manage platform operations
            </p>
          </div>
          <button
            onClick={() => logout.mutate(token)}
            disabled={logout.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-enterprise-500 hover:text-enterprise-700 hover:bg-enterprise-100 transition-colors disabled:opacity-50"
          >
            {logout.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-enterprise-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                ${activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-enterprise-500 hover:text-enterprise-700 hover:border-enterprise-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold
                    ${activeTab === tab.key
                      ? 'bg-primary text-white'
                      : 'bg-enterprise-100 text-enterprise-600'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'contacts' && <ContactRequestsSection token={token} />}
        {activeTab === 'agents' && <AgentsTab token={token} />}
        {activeTab === 'providers' && <ProvidersTab token={token} />}
        {activeTab === 'problems' && <ProblemsTab token={token} />}
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contact Requests Section (preserved from original)
// ---------------------------------------------------------------------------

function ContactRequestsSection({ token }: { token: string }) {
  const { data: requests, isLoading } = usePendingContactRequests(token)
  const approveRequest = useApproveContactRequest()
  const rejectRequest = useRejectContactRequest()

  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  function handleApprove(requestId: string) {
    setPendingAction(requestId)
    approveRequest.mutate(
      { token, requestId },
      { onSettled: () => setPendingAction(null) },
    )
  }

  function handleReject(requestId: string) {
    setPendingAction(requestId)
    rejectRequest.mutate(
      { token, requestId, notes: rejectNotes || undefined },
      {
        onSettled: () => {
          setPendingAction(null)
          setRejectingId(null)
          setRejectNotes('')
        },
      },
    )
  }

  return (
    <section>
      <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
        Pending Contact Requests
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
        </div>
      ) : !requests?.length ? (
        <div className="text-center py-16 rounded-xl border border-enterprise-200 bg-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
            <Inbox className="w-6 h-6 text-enterprise-400" />
          </div>
          <p className="text-sm text-enterprise-500">
            No pending contact requests to review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <ContactRequestCard
              key={req.id}
              request={req}
              isPending={pendingAction === req.id}
              isRejecting={rejectingId === req.id}
              rejectNotes={rejectingId === req.id ? rejectNotes : ''}
              onRejectNotesChange={setRejectNotes}
              onStartReject={() => {
                setRejectingId(req.id)
                setRejectNotes('')
              }}
              onCancelReject={() => {
                setRejectingId(null)
                setRejectNotes('')
              }}
              onApprove={() => handleApprove(req.id)}
              onReject={() => handleReject(req.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Contact Request Card
// ---------------------------------------------------------------------------

function ContactRequestCard({
  request,
  isPending,
  isRejecting,
  rejectNotes,
  onRejectNotesChange,
  onStartReject,
  onCancelReject,
  onApprove,
  onReject,
}: {
  request: PendingContactRequest
  isPending: boolean
  isRejecting: boolean
  rejectNotes: string
  onRejectNotesChange: (v: string) => void
  onStartReject: () => void
  onCancelReject: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const [messageExpanded, setMessageExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-5 space-y-3">
      {/* Top row */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-enterprise-900">
            {request.gcc_user_email}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-enterprise-500">
            {request.agent_name && (
              <span>Agent: <span className="text-enterprise-700 font-medium">{request.agent_name}</span></span>
            )}
            {request.provider_company_name && (
              <span>Provider: <span className="text-enterprise-700 font-medium">{request.provider_company_name}</span></span>
            )}
            <span>
              {new Date(request.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {!isRejecting && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Approve
            </button>
            <button
              onClick={onStartReject}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {request.message && (
        <div>
          <button
            onClick={() => setMessageExpanded((p) => !p)}
            className="inline-flex items-center gap-1 text-xs text-enterprise-500 hover:text-enterprise-700 transition-colors"
          >
            {messageExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {messageExpanded ? 'Hide message' : 'Show message'}
          </button>
          {messageExpanded && (
            <div className="mt-2 rounded-lg bg-enterprise-50 border border-enterprise-100 p-3 text-sm text-enterprise-700">
              {request.message}
            </div>
          )}
        </div>
      )}

      {/* Reject notes input */}
      {isRejecting && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2">
          <textarea
            value={rejectNotes}
            onChange={(e) => onRejectNotesChange(e.target.value)}
            placeholder="Optional rejection notes (internal only)..."
            rows={2}
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Confirm Reject
            </button>
            <button
              onClick={onCancelReject}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-enterprise-600 hover:bg-enterprise-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
