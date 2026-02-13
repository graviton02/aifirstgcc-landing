import { useState } from 'react'
import {
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Users,
  Globe,
  Calendar,
} from 'lucide-react'
import {
  usePendingProviderSubmissions,
  useAdminApproveProvider,
  useAdminRejectProvider,
  usePendingTspEdits,
  useAdminApproveTspEdit,
  useAdminRejectTspEdit,
} from '@/hooks/use-admin'
import type { PendingProvider, PendingTspEdit } from '@/lib/api/admin'
import type { TspSubmission, StartupSubmission } from '@/types/provider'

interface ProvidersTabProps {
  token: string
}

export function ProvidersTab({ token }: ProvidersTabProps) {
  const { data: providers, isLoading } = usePendingProviderSubmissions(token)
  const approveProvider = useAdminApproveProvider()
  const rejectProvider = useAdminRejectProvider()

  const pendingProviders = providers?.filter((p) => p.status === 'pending') ?? []
  const approvedProviders = providers?.filter((p) => p.status === 'approved') ?? []

  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  function handleApprove(profileId: string) {
    setPendingAction(profileId)
    approveProvider.mutate(
      { token, profileId },
      { onSettled: () => setPendingAction(null) },
    )
  }

  function handleReject(profileId: string) {
    setPendingAction(profileId)
    rejectProvider.mutate(
      { token, profileId, notes: rejectNotes || undefined },
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
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
          Pending Provider Applications
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
          </div>
        ) : !pendingProviders.length ? (
          <div className="text-center py-16 rounded-xl border border-enterprise-200 bg-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
              <Inbox className="w-6 h-6 text-enterprise-400" />
            </div>
            <p className="text-sm text-enterprise-500">
              No pending provider applications to review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isPending={pendingAction === provider.id}
                isRejecting={rejectingId === provider.id}
                rejectNotes={rejectingId === provider.id ? rejectNotes : ''}
                onRejectNotesChange={setRejectNotes}
                onStartReject={() => {
                  setRejectingId(provider.id)
                  setRejectNotes('')
                }}
                onCancelReject={() => {
                  setRejectingId(null)
                  setRejectNotes('')
                }}
                onApprove={() => handleApprove(provider.id)}
                onReject={() => handleReject(provider.id)}
                showActions
              />
            ))}
          </div>
        )}
      </section>

      <TspEditsSection token={token} />

      {/* Approved Providers History */}
      {approvedProviders.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-enterprise-900 mb-4">
            Approved Providers
          </h2>
          <div className="space-y-3">
            {approvedProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
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
// TSP Edits Section
// ---------------------------------------------------------------------------

function TspEditsSection({ token }: { token: string }) {
  const { data: edits, isLoading } = usePendingTspEdits(token)
  const approveEdit = useAdminApproveTspEdit()
  const rejectEdit = useAdminRejectTspEdit()

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
        Pending Profile Edit Requests
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
            No pending profile edit requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {edits.map((edit) => (
            <TspEditCard
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
// TSP Edit Card
// ---------------------------------------------------------------------------

function TspEditCard({
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
  edit: PendingTspEdit
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
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-enterprise-900 truncate">
                {edit.company_name ?? 'Unknown Provider'}
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
// Provider Card
// ---------------------------------------------------------------------------

function ProviderCard({
  provider,
  isPending,
  isRejecting,
  rejectNotes,
  onRejectNotesChange,
  onStartReject,
  onCancelReject,
  onApprove,
  onReject,
  showActions = true,
}: {
  provider: PendingProvider
  isPending: boolean
  isRejecting: boolean
  rejectNotes: string
  onRejectNotesChange: (v: string) => void
  onStartReject: () => void
  onCancelReject: () => void
  onApprove: () => void
  onReject: () => void
  showActions?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const categoryLabel = provider.category === 'tsp' ? 'TSP' : 'Startup'
  const categoryColor =
    provider.category === 'tsp'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white overflow-hidden">
      <div className="p-5 space-y-3">
        {/* Header Row */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {provider.logo_url ? (
              <img
                src={provider.logo_url}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-enterprise-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-enterprise-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-enterprise-500" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-enterprise-900 truncate">
                  {provider.company_name}
                </p>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryColor}`}>
                  {categoryLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-enterprise-500 mt-0.5">
                {provider.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {provider.location}
                  </span>
                )}
                {provider.company_size && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {provider.company_size}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(provider.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

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

        {/* Website */}
        {provider.website && (
          <div className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3 h-3 text-enterprise-400" />
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline break-all"
            >
              {provider.website}
            </a>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {/* Reject notes */}
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
        <div className="border-t border-enterprise-100 bg-enterprise-50/50 p-5 space-y-5">
          {/* Profile IDs reference */}
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Profile ID" value={provider.id} mono />
            <DetailItem label="User ID" value={provider.user_id} mono />
            <DetailItem label="Organization ID" value={provider.organization_id} mono />
            <DetailItem
              label="Applied"
              value={new Date(provider.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          </div>

          {/* Full Submission Details */}
          {provider.category === 'tsp' && provider.tsp_submission && (
            <TspSubmissionDetails submission={provider.tsp_submission} />
          )}
          {provider.category === 'startup' && provider.startup_submission && (
            <StartupSubmissionDetails submission={provider.startup_submission} />
          )}

          {/* Fallback if no submission data */}
          {!provider.tsp_submission && !provider.startup_submission && (
            <p className="text-xs text-enterprise-400 italic">No submission details available.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TSP Submission Details
// ---------------------------------------------------------------------------

function TspSubmissionDetails({ submission }: { submission: TspSubmission }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1">
        TSP Submission Details
      </p>

      {submission.about_text && (
        <DetailSection label="About">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.about_text}</p>
        </DetailSection>
      )}

      {submission.core_positioning && (
        <DetailSection label="Core Positioning">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.core_positioning}</p>
        </DetailSection>
      )}

      {submission.ai_first_definition && (
        <DetailSection label="AI-First Definition">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.ai_first_definition}</p>
        </DetailSection>
      )}

      {submission.unique_differentiators && (
        <DetailSection label="Unique Differentiators">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.unique_differentiators}</p>
        </DetailSection>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {submission.founding_year && (
          <DetailItem label="Founding Year" value={String(submission.founding_year)} />
        )}
        <DetailItem label="GCCs Enabled" value={String(submission.gccs_enabled)} />
      </div>

      {submission.ai_enabled_workflows?.length > 0 && (
        <DetailSection label="AI-Enabled Workflows">
          <TagList items={submission.ai_enabled_workflows} color="purple" />
        </DetailSection>
      )}

      {submission.governance_frameworks?.length > 0 && (
        <DetailSection label="Governance Frameworks">
          <TagList items={submission.governance_frameworks} color="blue" />
        </DetailSection>
      )}

      {submission.service_offerings?.length > 0 && (
        <DetailSection label="Service Offerings">
          <TagList items={submission.service_offerings} color="enterprise" />
        </DetailSection>
      )}

      {submission.impact_metrics && (
        <DetailSection label="Impact Metrics">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.impact_metrics}</p>
        </DetailSection>
      )}

      {submission.case_studies && (
        <DetailSection label="Case Studies">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.case_studies}</p>
        </DetailSection>
      )}

      {submission.industry_recognitions && (
        <DetailSection label="Industry Recognitions">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.industry_recognitions}</p>
        </DetailSection>
      )}

      {submission.agent_native_vision && (
        <DetailSection label="Agent-Native Vision">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.agent_native_vision}</p>
        </DetailSection>
      )}

      {submission.expansion_plans && (
        <DetailSection label="Expansion Plans">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.expansion_plans}</p>
        </DetailSection>
      )}

      {/* Contact Info */}
      {(submission.contact_name || submission.contact_email || submission.contact_phone) && (
        <DetailSection label="Contact Information">
          <div className="grid gap-2 sm:grid-cols-3">
            {submission.contact_name && (
              <DetailItem label="Name" value={submission.contact_name} />
            )}
            {submission.contact_email && (
              <DetailItem label="Email" value={submission.contact_email} />
            )}
            {submission.contact_phone && (
              <DetailItem label="Phone" value={submission.contact_phone} />
            )}
          </div>
        </DetailSection>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Startup Submission Details
// ---------------------------------------------------------------------------

function StartupSubmissionDetails({ submission }: { submission: StartupSubmission }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide border-b border-emerald-100 pb-1">
        Startup Submission Details
      </p>

      {submission.product_description && (
        <DetailSection label="Product Description">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.product_description}</p>
        </DetailSection>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {submission.funding_stage && (
          <DetailItem label="Funding Stage" value={submission.funding_stage} />
        )}
        {submission.founding_year && (
          <DetailItem label="Founding Year" value={String(submission.founding_year)} />
        )}
      </div>

      {submission.ai_capabilities && (
        <DetailSection label="AI Capabilities">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.ai_capabilities}</p>
        </DetailSection>
      )}

      {submission.tech_stack && (
        <DetailSection label="Tech Stack">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.tech_stack}</p>
        </DetailSection>
      )}

      {submission.target_industries?.length > 0 && (
        <DetailSection label="Target Industries">
          <TagList items={submission.target_industries} color="purple" />
        </DetailSection>
      )}

      {submission.customer_segments?.length > 0 && (
        <DetailSection label="Customer Segments">
          <TagList items={submission.customer_segments} color="blue" />
        </DetailSection>
      )}

      {submission.key_metrics && (
        <DetailSection label="Key Metrics">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.key_metrics}</p>
        </DetailSection>
      )}

      {submission.certifications?.length > 0 && (
        <DetailSection label="Certifications">
          <TagList items={submission.certifications} color="green" />
        </DetailSection>
      )}

      {submission.data_privacy_posture && (
        <DetailSection label="Data Privacy Posture">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.data_privacy_posture}</p>
        </DetailSection>
      )}

      {submission.security_measures && (
        <DetailSection label="Security Measures">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.security_measures}</p>
        </DetailSection>
      )}

      {submission.partnership_interests && (
        <DetailSection label="Partnership Interests">
          <p className="text-sm text-enterprise-700 whitespace-pre-wrap">{submission.partnership_interests}</p>
        </DetailSection>
      )}

      {/* Contact Info */}
      {(submission.contact_name || submission.contact_email || submission.contact_phone) && (
        <DetailSection label="Contact Information">
          <div className="grid gap-2 sm:grid-cols-3">
            {submission.contact_name && (
              <DetailItem label="Name" value={submission.contact_name} />
            )}
            {submission.contact_email && (
              <DetailItem label="Email" value={submission.contact_email} />
            )}
            {submission.contact_phone && (
              <DetailItem label="Phone" value={submission.contact_phone} />
            )}
          </div>
        </DetailSection>
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

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-enterprise-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={`text-sm text-enterprise-700 ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </p>
    </div>
  )
}

const tagColors: Record<string, string> = {
  purple: 'bg-purple-50 text-purple-600',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  enterprise: 'bg-enterprise-50 text-enterprise-600',
}

function TagList({ items, color }: { items: string[]; color: string }) {
  const cls = tagColors[color] ?? tagColors.enterprise
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${cls}`}
        >
          {item}
        </span>
      ))}
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
