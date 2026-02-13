import { useState } from 'react'
import {
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Calendar,
  Tag,
  Factory,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react'
import {
  usePendingProblems,
  useAdminApproveProblem,
  useAdminRejectProblem,
  useProblemInterests,
} from '@/hooks/use-admin'
import type { PendingProblem, ProblemInterest } from '@/lib/api/admin'

interface ProblemsTabProps {
  token: string
}

export function ProblemsTab({ token }: ProblemsTabProps) {
  const { data: problems, isLoading } = usePendingProblems(token)
  const approveProblem = useAdminApproveProblem()
  const rejectProblem = useAdminRejectProblem()

  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  function handleApprove(problemId: string) {
    setPendingAction(problemId)
    approveProblem.mutate(
      { token, problemId },
      { onSettled: () => setPendingAction(null) },
    )
  }

  function handleReject(problemId: string) {
    setPendingAction(problemId)
    rejectProblem.mutate(
      { token, problemId, notes: rejectNotes || undefined },
      {
        onSettled: () => {
          setPendingAction(null)
          setRejectingId(null)
          setRejectNotes('')
        },
      },
    )
  }

  const pendingProblems = problems?.filter((p) => p.status === 'pending_review') ?? []
  const approvedProblems = problems?.filter((p) => p.status === 'approved') ?? []

  return (
    <div className="space-y-8">
      {/* Pending Review Section */}
      <section>
        <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
          Pending Review
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
          </div>
        ) : !pendingProblems.length ? (
          <div className="text-center py-16 rounded-xl border border-enterprise-200 bg-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
              <Inbox className="w-6 h-6 text-enterprise-400" />
            </div>
            <p className="text-sm text-enterprise-500">
              No pending problem statements to review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                token={token}
                isPending={pendingAction === problem.id}
                isRejecting={rejectingId === problem.id}
                rejectNotes={rejectingId === problem.id ? rejectNotes : ''}
                onRejectNotesChange={setRejectNotes}
                onStartReject={() => {
                  setRejectingId(problem.id)
                  setRejectNotes('')
                }}
                onCancelReject={() => {
                  setRejectingId(null)
                  setRejectNotes('')
                }}
                onApprove={() => handleApprove(problem.id)}
                onReject={() => handleReject(problem.id)}
                showActions
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved Section */}
      {approvedProblems.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
            Approved Problems
          </h2>
          <div className="space-y-3">
            {approvedProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                token={token}
                isPending={false}
                isRejecting={false}
                rejectNotes=""
                onRejectNotesChange={() => {}}
                onStartReject={() => {}}
                onCancelReject={() => {}}
                onApprove={() => {}}
                onReject={() => {}}
                showActions={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Problem Card
// ---------------------------------------------------------------------------

function ProblemCard({
  problem,
  token,
  isPending,
  isRejecting,
  rejectNotes,
  onRejectNotesChange,
  onStartReject,
  onCancelReject,
  onApprove,
  onReject,
  showActions,
}: {
  problem: PendingProblem
  token: string
  isPending: boolean
  isRejecting: boolean
  rejectNotes: string
  onRejectNotesChange: (v: string) => void
  onStartReject: () => void
  onCancelReject: () => void
  onApprove: () => void
  onReject: () => void
  showActions: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [showInterests, setShowInterests] = useState(false)

  const timelineLabels: Record<string, string> = {
    immediate: 'Immediate',
    short: 'Short-term',
    medium: 'Medium-term',
    long: 'Long-term',
  }

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white overflow-hidden">
      <div className="p-5 space-y-3">
        {/* Header Row */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <FileQuestion className="w-5 h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-enterprise-900 truncate">
                {problem.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-enterprise-500 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {problem.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Factory className="w-3 h-3" />
                  {problem.industry}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timelineLabels[problem.timeline] ?? problem.timeline}
                </span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {problem.budget_range}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(problem.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Interest count badge */}
          {problem.interest_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold flex-shrink-0">
              <Users className="w-3.5 h-3.5" />
              {problem.interest_count} interested
            </span>
          )}

          {/* Action buttons */}
          {showActions && !isRejecting && (
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

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {/* Interests toggle for approved problems */}
        {problem.status === 'approved' && problem.interest_count > 0 && (
          <button
            onClick={() => setShowInterests((p) => !p)}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium ml-3"
          >
            <Users className="w-3 h-3" />
            {showInterests ? 'Hide interested providers' : 'View interested providers'}
          </button>
        )}

        {/* Reject notes input */}
        {isRejecting && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2">
            <textarea
              value={rejectNotes}
              onChange={(e) => onRejectNotesChange(e.target.value)}
              placeholder="Rejection reason (optional)..."
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

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-enterprise-100 bg-enterprise-50/50 p-5 space-y-4">
          <DetailSection label="Description">
            <p className="text-sm text-enterprise-700 whitespace-pre-wrap">
              {problem.description}
            </p>
          </DetailSection>

          <DetailSection label="Desired Outcome">
            <p className="text-sm text-enterprise-700 whitespace-pre-wrap">
              {problem.desired_outcome}
            </p>
          </DetailSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailSection label="GCC Org ID">
              <p className="text-xs text-enterprise-600 font-mono break-all">
                {problem.gcc_org_id}
              </p>
            </DetailSection>
            <DetailSection label="GCC User ID">
              <p className="text-xs text-enterprise-600 font-mono break-all">
                {problem.gcc_user_id}
              </p>
            </DetailSection>
          </div>
        </div>
      )}

      {/* Interested Providers */}
      {showInterests && (
        <div className="border-t border-enterprise-100 bg-blue-50/30 p-5">
          <InterestsList token={token} problemId={problem.id} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Interests List
// ---------------------------------------------------------------------------

function InterestsList({ token, problemId }: { token: string; problemId: string }) {
  const { data: interests, isLoading } = useProblemInterests(token, problemId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="w-4 h-4 text-enterprise-400 animate-spin" />
        <span className="text-xs text-enterprise-500">Loading interests...</span>
      </div>
    )
  }

  if (!interests?.length) {
    return (
      <p className="text-xs text-enterprise-500 py-2">No interested providers found.</p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide mb-2">
        Interested Providers ({interests.length})
      </p>
      {interests.map((interest: ProblemInterest) => (
        <div
          key={interest.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-white border border-enterprise-200 px-3 py-2 text-xs"
        >
          <span className="text-enterprise-700 font-medium">
            {interest.provider_user_email}
          </span>
          <span className="text-enterprise-500 font-mono text-[10px]">
            Org: {interest.provider_org_id}
          </span>
          <span className="text-enterprise-400">
            {new Date(interest.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detail Section
// ---------------------------------------------------------------------------

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      {children}
    </div>
  )
}
