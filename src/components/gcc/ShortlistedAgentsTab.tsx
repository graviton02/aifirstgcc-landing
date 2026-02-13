import { Link } from 'react-router-dom'
import { Bot, Star, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import { useShortlist, useRemoveFromShortlist } from '@/hooks/use-gcc'
import { useAgentsByIds } from '@/hooks/use-agents'
import type { Agent } from '@/types/agent'

interface ShortlistedAgentsTabProps {
  orgId: string
}

export function ShortlistedAgentsTab({ orgId }: ShortlistedAgentsTabProps) {
  const { data: shortlist, isLoading: shortlistLoading } = useShortlist(orgId)
  const agentIds = shortlist?.map((s) => s.agent_id)
  const { data: agents, isLoading: agentsLoading } = useAgentsByIds(agentIds)

  const isLoading = shortlistLoading || agentsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-enterprise-400 animate-spin" />
      </div>
    )
  }

  if (!shortlist?.length) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
          <Star className="w-6 h-6 text-enterprise-400" />
        </div>
        <h3 className="text-sm font-semibold text-enterprise-900 mb-1">No shortlisted agents yet</h3>
        <p className="text-sm text-enterprise-500 max-w-xs mx-auto mb-4">
          Browse the marketplace and shortlist agents you're interested in.
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

  // Build agent lookup
  const agentMap = new Map(agents?.map((a) => [a.id, a]) ?? [])

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
              Category
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Rating
            </th>
            <th className="text-left text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3 pr-4">
              Added
            </th>
            <th className="text-right text-xs font-semibold text-enterprise-500 uppercase tracking-wider pb-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-enterprise-100">
          {shortlist.map((entry) => {
            const agent = agentMap.get(entry.agent_id)
            return (
              <ShortlistRow
                key={entry.id}
                agentId={entry.agent_id}
                agent={agent}
                addedAt={entry.created_at}
                orgId={orgId}
              />
            )
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {shortlist.map((entry) => {
          const agent = agentMap.get(entry.agent_id)
          return (
            <ShortlistCard
              key={entry.id}
              agentId={entry.agent_id}
              agent={agent}
              addedAt={entry.created_at}
              orgId={orgId}
            />
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function ShortlistRow({
  agentId,
  agent,
  addedAt,
  orgId,
}: {
  agentId: string
  agent: Agent | undefined
  addedAt: string
  orgId: string
}) {
  const remove = useRemoveFromShortlist()

  return (
    <tr className="group">
      <td className="py-3 pr-4">
        <Link to={`/marketplace/agent/${agentId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {agent?.logo_url ? (
            <img src={agent.logo_url} alt={agent.agent_name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-purple-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-enterprise-900 truncate">
              {agent?.agent_name ?? 'Unknown Agent'}
            </p>
            {agent?.tagline && (
              <p className="text-xs text-enterprise-500 truncate">{agent.tagline}</p>
            )}
          </div>
        </Link>
      </td>
      <td className="py-3 pr-4">
        <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-xs font-medium">
          {agent?.category ?? '—'}
        </span>
      </td>
      <td className="py-3 pr-4">
        {agent && agent.rating > 0 ? (
          <div className="flex items-center gap-1 text-xs text-enterprise-500">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{agent.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-xs text-enterprise-400">—</span>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-enterprise-500">
        {new Date(addedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/marketplace/agent/${agentId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </Link>
          <button
            onClick={() => remove.mutate({ orgId, agentId })}
            disabled={remove.isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {remove.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            Remove
          </button>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Card (mobile)
// ---------------------------------------------------------------------------

function ShortlistCard({
  agentId,
  agent,
  addedAt,
  orgId,
}: {
  agentId: string
  agent: Agent | undefined
  addedAt: string
  orgId: string
}) {
  const remove = useRemoveFromShortlist()

  return (
    <div className="rounded-lg border border-enterprise-200 bg-white p-4 space-y-3">
      <Link to={`/marketplace/agent/${agentId}`} className="flex items-center gap-3">
        {agent?.logo_url ? (
          <img src={agent.logo_url} alt={agent.agent_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-purple-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-enterprise-900 truncate">
            {agent?.agent_name ?? 'Unknown Agent'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium">
              {agent?.category ?? '—'}
            </span>
            {agent && agent.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-enterprise-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{agent.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between">
        <span className="text-xs text-enterprise-500">
          Added {new Date(addedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/marketplace/agent/${agentId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </Link>
          <button
            onClick={() => remove.mutate({ orgId, agentId })}
            disabled={remove.isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {remove.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
