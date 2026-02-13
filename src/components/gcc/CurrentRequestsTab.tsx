import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  Archive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useMyContactRequests } from '@/hooks/use-gcc'
import { cn } from '@/lib/utils'
import type { ProviderRequest } from '@/types/agent'

const statusConfig: Record<
  ProviderRequest['status'],
  { label: string; className: string; icon: typeof Clock }
> = {
  pending_admin: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', className: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  rejected: { label: 'Not Approved', className: 'bg-red-100 text-red-700', icon: XCircle },
  contacted: { label: 'Contacted', className: 'bg-green-100 text-green-700', icon: Phone },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500', icon: Archive },
}

export function CurrentRequestsTab() {
  const { user } = useUser()
  const { data: requests, isLoading } = useMyContactRequests(user?.id)

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
          <MessageSquare className="w-6 h-6 text-enterprise-400" />
        </div>
        <h3 className="text-sm font-semibold text-enterprise-900 mb-1">No contact requests yet</h3>
        <p className="text-sm text-enterprise-500 max-w-xs mx-auto mb-4">
          When you contact providers about their agents, your requests will appear here.
        </p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Desktop table */}
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="border-b border-enterprise-200">
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Agent
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Date
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Status
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3">
              Message
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-enterprise-100">
          {requests.map((req) => (
            <RequestRow key={req.id} request={req} />
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop row
// ---------------------------------------------------------------------------

function RequestRow({ request }: { request: ProviderRequest }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[request.status]

  return (
    <>
      <tr className="group">
        <td className="py-3 pr-4">
          <Link
            to={`/marketplace/agent/${request.agent_id}`}
            className="text-sm font-medium text-enterprise-900 hover:text-purple-600 transition-colors"
          >
            View Agent
          </Link>
        </td>
        <td className="py-3 pr-4 text-sm text-enterprise-500">
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </td>
        <td className="py-3 pr-4">
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
            <status.icon className="w-3 h-3" />
            {status.label}
          </span>
        </td>
        <td className="py-3">
          {request.message ? (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex items-center gap-1 text-xs text-enterprise-500 hover:text-enterprise-700 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Hide' : 'Show'}
            </button>
          ) : (
            <span className="text-xs text-enterprise-400">—</span>
          )}
        </td>
      </tr>
      {expanded && request.message && (
        <tr>
          <td colSpan={4} className="px-4 pb-3">
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
// Mobile card
// ---------------------------------------------------------------------------

function RequestCard({ request }: { request: ProviderRequest }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[request.status]

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Link
          to={`/marketplace/agent/${request.agent_id}`}
          className="text-sm font-medium text-enterprise-900 hover:text-purple-600 transition-colors"
        >
          View Agent
        </Link>
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.className)}>
          <status.icon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="text-xs text-enterprise-500">
        Submitted {new Date(request.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
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
    </div>
  )
}
