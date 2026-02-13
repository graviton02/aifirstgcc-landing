import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Bot,
  PenLine,
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useMyAgents, useMyAgentSubmissions, useMyAgentEdits, useSoftDeleteAgent } from '@/hooks/use-agents'
import { cn } from '@/lib/utils'
import type { Agent, AgentSubmission, AgentEdit } from '@/types/agent'

const submissionStatusConfig = {
  pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  changes_requested: { label: 'Changes Requested', className: 'bg-amber-100 text-amber-700' },
} as const

const editStatusConfig = {
  pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
} as const

interface SubmissionsTabProps {
  profileId: string
  isApproved: boolean
}

export function SubmissionsTab({ profileId, isApproved }: SubmissionsTabProps) {
  const { data: agents, isLoading: agentsLoading } = useMyAgents(profileId)
  const { data: submissions, isLoading: subsLoading } = useMyAgentSubmissions()
  const { data: edits, isLoading: editsLoading } = useMyAgentEdits()

  const isLoading = agentsLoading || subsLoading || editsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
      </div>
    )
  }

  const activeAgents = agents?.filter((a) => a.status === 'active') ?? []
  const pendingSubmissions = submissions?.filter((s) => s.submission_status !== 'approved') ?? []
  const pendingEdits = edits ?? []

  const isEmpty = !activeAgents.length && !pendingSubmissions.length && !pendingEdits.length

  return (
    <div className="space-y-10">
      {/* List Agent CTA */}
      <div className="flex justify-end">
        {isApproved ? (
          <Link
            to="/list-your-agent"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            List Your Agent
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-enterprise-100 text-enterprise-400 text-sm font-semibold cursor-not-allowed">
            <PlusCircle className="w-4 h-4" />
            List Your Agent
          </span>
        )}
      </div>

      {isEmpty && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
            <FileText className="w-6 h-6 text-enterprise-400" />
          </div>
          <p className="text-sm text-enterprise-500">
            Your agent submissions and edit requests will appear here.
          </p>
        </div>
      )}

      {/* My Agents */}
      {activeAgents.length > 0 && (
        <section>
          <SectionHeader icon={Bot} title="My Agents" count={activeAgents.length} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {activeAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <section>
          <SectionHeader icon={FileText} title="Pending Submissions" count={pendingSubmissions.length} />
          <div className="space-y-3 mt-4">
            {pendingSubmissions.map((sub) => (
              <SubmissionRow key={sub.id} submission={sub} />
            ))}
          </div>
        </section>
      )}

      {/* Edit Requests */}
      {pendingEdits.length > 0 && (
        <section>
          <SectionHeader icon={PenLine} title="Edit Requests" count={pendingEdits.length} />
          <div className="space-y-3 mt-4">
            {pendingEdits.map((edit) => (
              <EditRow key={edit.id} edit={edit} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-enterprise-500" />
      <h3 className="text-sm font-semibold text-enterprise-700">{title}</h3>
      <span className="text-xs text-enterprise-400">({count})</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------

function AgentCard({ agent }: { agent: Agent }) {
  const softDelete = useSoftDeleteAgent()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDelete() {
    softDelete.mutate(agent.id, { onSettled: () => setShowConfirm(false) })
  }

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        {agent.logo_url ? (
          <img
            src={agent.logo_url}
            alt={agent.agent_name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-enterprise-900 truncate">{agent.agent_name}</p>
          {agent.tagline && (
            <p className="text-xs text-enterprise-500 truncate mt-0.5">{agent.tagline}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-enterprise-600 line-clamp-2 mb-4 flex-1">
        {agent.description}
      </p>

      {/* Confirm delete */}
      {showConfirm ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-red-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Remove this agent listing?
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={softDelete.isPending}
              className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {softDelete.isPending ? 'Removing...' : 'Yes, remove'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-enterprise-700 bg-enterprise-100 hover:bg-enterprise-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-enterprise-100">
          <Link
            to={`/agents/${agent.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors"
          >
            <Eye className="w-3 h-3" />
            View
          </Link>
          <Link
            to={`/provider/agents/${agent.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Submission row
// ---------------------------------------------------------------------------

function SubmissionRow({ submission }: { submission: AgentSubmission }) {
  const status = submissionStatusConfig[submission.submission_status]

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-enterprise-900 truncate">
            {submission.agent_name}
          </p>
          <p className="text-xs text-enterprise-500 mt-0.5">
            Submitted{' '}
            {new Date(submission.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', status.className)}>
          {status.label}
        </span>
      </div>
      {submission.admin_notes &&
        (submission.submission_status === 'rejected' || submission.submission_status === 'changes_requested') && (
          <div className="mt-3 rounded-md bg-enterprise-50 px-3 py-2">
            <p className="text-xs text-enterprise-600">
              <span className="font-medium">Admin notes:</span> {submission.admin_notes}
            </p>
          </div>
        )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit request row
// ---------------------------------------------------------------------------

function EditRow({ edit }: { edit: AgentEdit }) {
  const status = editStatusConfig[edit.status]
  const changedFields = Object.keys(edit.payload)

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-enterprise-900">
            Edit request
          </p>
          <p className="text-xs text-enterprise-500 mt-0.5">
            {changedFields.length} field{changedFields.length !== 1 ? 's' : ''} changed &middot;{' '}
            {new Date(edit.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', status.className)}>
          {status.label}
        </span>
      </div>
      {edit.admin_notes && edit.status === 'rejected' && (
        <div className="mt-3 rounded-md bg-enterprise-50 px-3 py-2">
          <p className="text-xs text-enterprise-600">
            <span className="font-medium">Admin notes:</span> {edit.admin_notes}
          </p>
        </div>
      )}
    </div>
  )
}
