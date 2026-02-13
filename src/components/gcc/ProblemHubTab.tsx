import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  Lightbulb,
  PlusCircle,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react'
import { useMyProblems } from '@/hooks/use-gcc'
import { ProblemSubmitModal } from '@/components/gcc/ProblemSubmitModal'
import { cn } from '@/lib/utils'
import type { ProblemStatement } from '@/types/problem'

const statusConfig: Record<
  ProblemStatement['status'],
  { label: string; className: string; icon: typeof Clock }
> = {
  pending_review: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: XCircle },
}

const timelineLabels: Record<ProblemStatement['timeline'], string> = {
  immediate: 'Immediate (< 1 month)',
  short: 'Short-term (1–3 months)',
  medium: 'Medium-term (3–6 months)',
  long: 'Long-term (6+ months)',
}

interface ProblemHubTabProps {
  orgId: string
}

export function ProblemHubTab({ orgId }: ProblemHubTabProps) {
  const { userId } = useAuth()
  const { data: problems, isLoading } = useMyProblems(orgId)
  const [modalOpen, setModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Problem
        </button>
      </div>

      {/* Submit modal */}
      {userId && (
        <ProblemSubmitModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          orgId={orgId}
          userId={userId}
        />
      )}

      {/* Problems list */}
      {!problems?.length ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
            <Lightbulb className="w-6 h-6 text-enterprise-400" />
          </div>
          <h3 className="text-sm font-semibold text-enterprise-900 mb-1">No problem statements yet</h3>
          <p className="text-sm text-enterprise-500 max-w-xs mx-auto">
            Submit a problem statement to let AI solution providers know what challenges you're facing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Problem Card
// ---------------------------------------------------------------------------

function ProblemCard({ problem }: { problem: ProblemStatement }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[problem.status]

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4
            className="text-sm font-semibold text-enterprise-900 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => setExpanded((p) => !p)}
          >
            {problem.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium">
              {problem.category}
            </span>
            <span className="text-xs text-enterprise-500">{problem.industry}</span>
            <span className="text-xs text-enterprise-500">
              {new Date(problem.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {problem.interest_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-enterprise-500">
              <Users className="w-3 h-3" />
              {problem.interest_count}
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
            <status.icon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 pt-2 border-t border-enterprise-100">
          <div>
            <p className="text-xs font-medium text-enterprise-500 mb-1">Description</p>
            <p className="text-sm text-enterprise-700 leading-relaxed">{problem.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-enterprise-500 mb-1">Desired Outcome</p>
            <p className="text-sm text-enterprise-700">{problem.desired_outcome}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-enterprise-500">
            <span>
              Timeline: <span className="text-enterprise-700 font-medium">{timelineLabels[problem.timeline]}</span>
            </span>
            <span>
              Budget: <span className="text-enterprise-700 font-medium">{problem.budget_range}</span>
            </span>
          </div>
          {problem.rejection_reason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <span className="font-medium">Rejection note:</span> {problem.rejection_reason}
            </div>
          )}
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="inline-flex items-center gap-1 text-xs text-enterprise-500 hover:text-enterprise-700 transition-colors"
      >
        {expanded ? <XCircle className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
        {expanded ? 'Collapse' : 'View details'}
      </button>
    </div>
  )
}
