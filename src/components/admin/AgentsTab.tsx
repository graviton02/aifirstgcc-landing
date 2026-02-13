import { useState } from 'react'
import {
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Bot,
  Building2,
  Tag,
  Calendar,
} from 'lucide-react'
import {
  usePendingAgentSubmissions,
  useAdminApproveAgent,
  useAdminRejectAgent,
  useAdminRequestChangesAgent,
  usePendingAgentEdits,
  useAdminApproveAgentEdit,
  useAdminRejectAgentEdit,
} from '@/hooks/use-admin'
import type { PendingAgentSubmission, PendingAgentEdit } from '@/lib/api/admin'

interface AgentsTabProps {
  token: string
}

export function AgentsTab({ token }: AgentsTabProps) {
  const { data: submissions, isLoading } = usePendingAgentSubmissions(token)
  const approveAgent = useAdminApproveAgent()
  const rejectAgent = useAdminRejectAgent()
  const requestChanges = useAdminRequestChangesAgent()

  const pendingSubmissions = submissions?.filter((s) => s.submission_status === 'pending') ?? []
  const approvedSubmissions = submissions?.filter((s) => s.submission_status === 'approved') ?? []

  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [notesTarget, setNotesTarget] = useState<{ id: string; type: 'reject' | 'changes' } | null>(null)
  const [notes, setNotes] = useState('')

  function handleApprove(submissionId: string) {
    setPendingAction(submissionId)
    approveAgent.mutate(
      { token, submissionId },
      { onSettled: () => setPendingAction(null) },
    )
  }

  function handleReject(submissionId: string) {
    setPendingAction(submissionId)
    rejectAgent.mutate(
      { token, submissionId, notes: notes || undefined },
      {
        onSettled: () => {
          setPendingAction(null)
          setNotesTarget(null)
          setNotes('')
        },
      },
    )
  }

  function handleRequestChanges(submissionId: string) {
    setPendingAction(submissionId)
    requestChanges.mutate(
      { token, submissionId, notes: notes || undefined },
      {
        onSettled: () => {
          setPendingAction(null)
          setNotesTarget(null)
          setNotes('')
        },
      },
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
          Pending Agent Submissions
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
          </div>
        ) : !pendingSubmissions.length ? (
          <div className="text-center py-16 rounded-xl border border-enterprise-200 bg-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
              <Inbox className="w-6 h-6 text-enterprise-400" />
            </div>
            <p className="text-sm text-enterprise-500">
              No pending agent submissions to review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.map((submission) => (
              <AgentSubmissionCard
                key={submission.id}
                submission={submission}
                isPending={pendingAction === submission.id}
                notesTarget={notesTarget?.id === submission.id ? notesTarget.type : null}
                notesValue={notesTarget?.id === submission.id ? notes : ''}
                onNotesChange={setNotes}
                onStartReject={() => {
                  setNotesTarget({ id: submission.id, type: 'reject' })
                  setNotes('')
                }}
                onStartRequestChanges={() => {
                  setNotesTarget({ id: submission.id, type: 'changes' })
                  setNotes('')
                }}
                onCancelNotes={() => {
                  setNotesTarget(null)
                  setNotes('')
                }}
                onApprove={() => handleApprove(submission.id)}
                onReject={() => handleReject(submission.id)}
                onRequestChanges={() => handleRequestChanges(submission.id)}
                showActions
              />
            ))}
          </div>
        )}
      </section>

      <AgentEditsSection token={token} />

      {/* Approved Agents History */}
      {approvedSubmissions.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
            Approved Agents
          </h2>
          <div className="space-y-3">
            {approvedSubmissions.map((submission) => (
              <AgentSubmissionCard
                key={submission.id}
                submission={submission}
                isPending={false}
                notesTarget={null}
                notesValue=""
                onNotesChange={() => {}}
                onStartReject={() => {}}
                onStartRequestChanges={() => {}}
                onCancelNotes={() => {}}
                onApprove={() => {}}
                onReject={() => {}}
                onRequestChanges={() => {}}
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
// Agent Edits Section
// ---------------------------------------------------------------------------

function AgentEditsSection({ token }: { token: string }) {
  const { data: edits, isLoading } = usePendingAgentEdits(token)
  const approveEdit = useAdminApproveAgentEdit()
  const rejectEdit = useAdminRejectAgentEdit()

  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  function handleApprove(editId: string) {
    setPendingAction(editId)
    approveEdit.mutate(
      { token, editId },
      { onSettled: () => setPendingAction(null) },
    )
  }

  function handleReject(editId: string) {
    setPendingAction(editId)
    rejectEdit.mutate(
      { token, editId, notes: rejectNotes || undefined },
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
        Pending Agent Edit Requests
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
        </div>
      ) : !edits?.length ? (
        <div className="text-center py-16 rounded-xl border border-enterprise-200 bg-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
            <Inbox className="w-6 h-6 text-enterprise-400" />
          </div>
          <p className="text-sm text-enterprise-500">
            No pending agent edit requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {edits.map((edit) => (
            <AgentEditCard
              key={edit.id}
              edit={edit}
              isPending={pendingAction === edit.id}
              isRejecting={rejectingId === edit.id}
              rejectNotes={rejectingId === edit.id ? rejectNotes : ''}
              onRejectNotesChange={setRejectNotes}
              onStartReject={() => {
                setRejectingId(edit.id)
                setRejectNotes('')
              }}
              onCancelReject={() => {
                setRejectingId(null)
                setRejectNotes('')
              }}
              onApprove={() => handleApprove(edit.id)}
              onReject={() => handleReject(edit.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Agent Edit Card
// ---------------------------------------------------------------------------

function AgentEditCard({
  edit,
  isPending,
  isRejecting,
  rejectNotes,
  onRejectNotesChange,
  onStartReject,
  onCancelReject,
  onApprove,
  onReject,
}: {
  edit: PendingAgentEdit
  isPending: boolean
  isRejecting: boolean
  rejectNotes: string
  onRejectNotesChange: (v: string) => void
  onStartReject: () => void
  onCancelReject: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const fieldCount = Object.keys(edit.payload).length

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white overflow-hidden">
      <div className="p-5 space-y-3">
        {/* Header Row */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-enterprise-900 truncate">
                {edit.agent_name ?? 'Unknown Agent'}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-enterprise-500 mt-0.5">
                <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''} changed</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(edit.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
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

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide changes' : 'View proposed changes'}
        </button>

        {/* Reject notes input */}
        {isRejecting && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2">
            <textarea
              value={rejectNotes}
              onChange={(e) => onRejectNotesChange(e.target.value)}
              placeholder="Rejection notes (optional)..."
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

      {/* Expanded Diff View */}
      {expanded && (
        <div className="border-t border-enterprise-100 bg-enterprise-50/50 p-5">
          <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide mb-3">
            Proposed Changes
          </p>
          <div className="space-y-2">
            {Object.entries(edit.payload).map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-enterprise-200 bg-white px-3 py-2"
              >
                <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide mb-1">
                  {formatFieldName(key)}
                </p>
                <p className="text-sm text-enterprise-900 whitespace-pre-wrap break-words">
                  {formatFieldValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent Submission Card
// ---------------------------------------------------------------------------

function AgentSubmissionCard({
  submission,
  isPending,
  notesTarget,
  notesValue,
  onNotesChange,
  onStartReject,
  onStartRequestChanges,
  onCancelNotes,
  onApprove,
  onReject,
  onRequestChanges,
  showActions = true,
}: {
  submission: PendingAgentSubmission
  isPending: boolean
  notesTarget: 'reject' | 'changes' | null
  notesValue: string
  onNotesChange: (v: string) => void
  onStartReject: () => void
  onStartRequestChanges: () => void
  onCancelNotes: () => void
  onApprove: () => void
  onReject: () => void
  onRequestChanges: () => void
  showActions?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white overflow-hidden">
      {/* Header Row */}
      <div className="p-5 space-y-3">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {submission.logo_url ? (
              <img
                src={submission.logo_url}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-enterprise-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-enterprise-900 truncate">
                {submission.agent_name}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-enterprise-500 mt-0.5">
                {submission.provider_company_name && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {submission.provider_company_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {submission.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(submission.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {showActions && !notesTarget && (
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
                onClick={onStartRequestChanges}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Changes
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

        {/* Tagline */}
        {submission.tagline && (
          <p className="text-xs text-enterprise-600">{submission.tagline}</p>
        )}

        {/* Tags */}
        {submission.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {submission.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-600 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show full details'}
        </button>

        {/* Notes input area */}
        {notesTarget && (
          <NotesInput
            type={notesTarget}
            value={notesValue}
            onChange={onNotesChange}
            isPending={isPending}
            onConfirm={notesTarget === 'reject' ? onReject : onRequestChanges}
            onCancel={onCancelNotes}
          />
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-enterprise-100 bg-enterprise-50/50 p-5 space-y-5">
          {/* Description */}
          <DetailSection label="Description">
            <p className="text-sm text-enterprise-700 whitespace-pre-wrap">
              {submission.description}
            </p>
          </DetailSection>

          {/* Use Cases */}
          {submission.use_cases?.length > 0 && (
            <DetailSection label="Use Cases">
              <div className="grid gap-2 sm:grid-cols-2">
                {submission.use_cases.map((uc, i) => (
                  <div key={i} className="rounded-lg border border-enterprise-200 bg-white p-3">
                    <p className="text-xs font-semibold text-enterprise-900 mb-1">{uc.title}</p>
                    <p className="text-xs text-enterprise-600">{uc.description}</p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Industries */}
          {submission.industries?.length > 0 && (
            <DetailSection label="Industries">
              <div className="flex flex-wrap gap-1.5">
                {submission.industries.map((ind) => (
                  <span key={ind} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium">
                    {ind}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Integration */}
          <div className="grid gap-4 sm:grid-cols-2">
            {submission.integration_type && (
              <DetailSection label="Integration Type">
                <p className="text-sm text-enterprise-700">{submission.integration_type}</p>
              </DetailSection>
            )}
            {submission.supported_platforms?.length > 0 && (
              <DetailSection label="Supported Platforms">
                <div className="flex flex-wrap gap-1.5">
                  {submission.supported_platforms.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-600 text-[10px] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}
          </div>

          {submission.data_requirements && (
            <DetailSection label="Data Requirements">
              <p className="text-sm text-enterprise-700">{submission.data_requirements}</p>
            </DetailSection>
          )}

          {/* Impact Metrics */}
          {submission.impact_metrics?.length > 0 && (
            <DetailSection label="Impact Metrics">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {submission.impact_metrics.map((m, i) => (
                  <div key={i} className="rounded-lg border border-enterprise-200 bg-white p-3 text-center">
                    <p className="text-lg font-bold text-purple-600">{m.value}</p>
                    <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide">{m.type}</p>
                    <p className="text-xs text-enterprise-600 mt-1">{m.description}</p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Compliance & Security */}
          <div className="grid gap-4 sm:grid-cols-2">
            {submission.compliance_certifications?.length > 0 && (
              <DetailSection label="Compliance Certifications">
                <div className="flex flex-wrap gap-1.5">
                  {submission.compliance_certifications.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}
            {submission.security_features?.length > 0 && (
              <DetailSection label="Security Features">
                <div className="flex flex-wrap gap-1.5">
                  {submission.security_features.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}
          </div>

          {submission.demo_url && (
            <DetailSection label="Demo URL">
              <a
                href={submission.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:underline break-all"
              >
                {submission.demo_url}
              </a>
            </DetailSection>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared sub-components
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

function NotesInput({
  type,
  value,
  onChange,
  isPending,
  onConfirm,
  onCancel,
}: {
  type: 'reject' | 'changes'
  value: string
  onChange: (v: string) => void
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const isReject = type === 'reject'
  const borderColor = isReject ? 'border-red-200' : 'border-amber-200'
  const bgColor = isReject ? 'bg-red-50/50' : 'bg-amber-50/50'
  const btnBg = isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
  const ringColor = isReject ? 'focus:ring-red-400' : 'focus:ring-amber-400'
  const label = isReject ? 'Confirm Reject' : 'Request Changes'
  const icon = isReject ? <XCircle className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-3 space-y-2`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isReject ? 'Rejection notes (optional)...' : 'Describe what changes are needed...'}
        rows={2}
        className={`w-full rounded-lg border ${borderColor} bg-white px-3 py-2 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent resize-none`}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${btnBg} transition-colors disabled:opacity-50`}
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
          {label}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-enterprise-600 hover:bg-enterprise-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFieldName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)'
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join(', ')
  return JSON.stringify(value, null, 2)
}
