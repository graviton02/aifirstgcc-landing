import { useState } from 'react'
import { Inbox, CheckCircle2, Archive, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useProviderRequests, useMarkRequestContacted, useArchiveRequest } from '@/hooks/use-provider'
import { useMyAgents } from '@/hooks/use-agents'
import { cn } from '@/lib/utils'
import type { ProviderRequest } from '@/types/agent'

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: 'New', className: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

interface RequestsTabProps {
  profileId: string
}

export function RequestsTab({ profileId }: RequestsTabProps) {
  const { data: requests, isLoading } = useProviderRequests(profileId)
  const { data: agents } = useMyAgents(profileId)
  const markContacted = useMarkRequestContacted()
  const archive = useArchiveRequest()

  const [pendingAction, setPendingAction] = useState<string | null>(null)

  // Build agent name lookup
  const agentNames = new Map(agents?.map((a) => [a.id, a.agent_name]) ?? [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
      </div>
    )
  }

  if (!requests?.length) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
          <Inbox className="w-6 h-6 text-enterprise-400" />
        </div>
        <p className="text-sm text-enterprise-500">
          No contact requests yet. Requests from GCC organizations will appear here.
        </p>
      </div>
    )
  }

  function handleMarkContacted(requestId: string) {
    setPendingAction(requestId)
    markContacted.mutate(requestId, { onSettled: () => setPendingAction(null) })
  }

  function handleArchive(requestId: string) {
    setPendingAction(requestId)
    archive.mutate(requestId, { onSettled: () => setPendingAction(null) })
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop table */}
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="border-b border-enterprise-200">
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              GCC Email
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Agent
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Date
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Status
            </th>
            <th className="text-right text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-enterprise-100">
          {requests.map((req) => (
            <RequestRow
              key={req.id}
              request={req}
              agentName={agentNames.get(req.agent_id)}
              isPending={pendingAction === req.id}
              onMarkContacted={handleMarkContacted}
              onArchive={handleArchive}
            />
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {requests.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            agentName={agentNames.get(req.agent_id)}
            isPending={pendingAction === req.id}
            onMarkContacted={handleMarkContacted}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Table row (desktop)
// ---------------------------------------------------------------------------

interface RequestItemProps {
  request: ProviderRequest
  agentName: string | undefined
  isPending: boolean
  onMarkContacted: (id: string) => void
  onArchive: (id: string) => void
}

function RequestRow({ request, agentName, isPending, onMarkContacted, onArchive }: RequestItemProps) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[request.status] ?? { label: request.status, className: 'bg-gray-100 text-gray-500' }

  return (
    <>
      <tr className="group">
        <td className="py-3 pr-4 text-sm text-enterprise-900">{request.gcc_user_email}</td>
        <td className="py-3 pr-4 text-sm text-enterprise-700">{agentName ?? 'Unknown Agent'}</td>
        <td className="py-3 pr-4 text-sm text-enterprise-500">
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </td>
        <td className="py-3 pr-4">
          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
            {status.label}
          </span>
        </td>
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            {request.message && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-enterprise-500 hover:text-enterprise-700 hover:bg-enterprise-50 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Message
              </button>
            )}
            <ActionButtons
              status={request.status}
              isPending={isPending}
              onMarkContacted={() => onMarkContacted(request.id)}
              onArchive={() => onArchive(request.id)}
            />
          </div>
        </td>
      </tr>
      {expanded && request.message && (
        <tr>
          <td colSpan={5} className="px-4 pb-3">
            <div className="rounded-lg bg-enterprise-50 border border-enterprise-100 p-3 text-sm text-enterprise-700">
              {request.message}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Card (mobile)
// ---------------------------------------------------------------------------

function RequestCard({ request, agentName, isPending, onMarkContacted, onArchive }: RequestItemProps) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[request.status] ?? { label: request.status, className: 'bg-gray-100 text-gray-500' }

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-enterprise-900 truncate">
          {request.gcc_user_email}
        </span>
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
          {status.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-enterprise-500">
        <span>{agentName ?? 'Unknown Agent'}</span>
        <span>
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      {request.message && (
        <div>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="inline-flex items-center gap-1 text-xs text-enterprise-500 hover:text-enterprise-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide message' : 'Show message'}
          </button>
          {expanded && (
            <div className="mt-2 rounded-lg bg-enterprise-50 border border-enterprise-100 p-3 text-sm text-enterprise-700">
              {request.message}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <ActionButtons
          status={request.status}
          isPending={isPending}
          onMarkContacted={() => onMarkContacted(request.id)}
          onArchive={() => onArchive(request.id)}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Action buttons
// ---------------------------------------------------------------------------

function ActionButtons({
  status,
  isPending,
  onMarkContacted,
  onArchive,
}: {
  status: ProviderRequest['status']
  isPending: boolean
  onMarkContacted: () => void
  onArchive: () => void
}) {
  if (status === 'archived') return null

  return (
    <div className="flex items-center gap-2">
      {status === 'approved' && (
        <button
          onClick={onMarkContacted}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          Contacted
        </button>
      )}
      <button
        onClick={onArchive}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-enterprise-600 bg-enterprise-50 hover:bg-enterprise-100 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Archive className="w-3 h-3" />
        )}
        Archive
      </button>
    </div>
  )
}
