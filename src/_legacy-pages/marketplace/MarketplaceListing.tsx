import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Bot,
  Star,
  X,
  SlidersHorizontal,
  Inbox,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Pagination } from '@/components/shared/Pagination'
import { ShortlistButton } from '@/components/shared/ShortlistButton'
import { useAgents } from '@/hooks/use-agents'
import { AGENT_CATEGORIES } from '@/data/constants/agentCategories'
import type { Agent } from '@/types/agent'

const PAGE_SIZE = 12

export default function MarketplaceListing() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [searchInput, setSearchInput] = useState(search)

  const filters = useMemo(
    () => ({ search, category: category || undefined, page, pageSize: PAGE_SIZE }),
    [search, category, page],
  )

  const { data, isLoading } = useAgents(filters)
  const agents = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // URL helpers
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    // Reset to page 1 when filters change
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchInput.trim())
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return
    updateParam('page', p > 1 ? String(p) : '')
  }

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const hasFilters = !!search || !!category

  return (
    <div className="pt-28 pb-12">
      <Container size="wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-enterprise-900">Agent Marketplace</h1>
          <p className="text-enterprise-500 mt-2">
            Browse AI agents across {AGENT_CATEGORIES.length} categories. Find solutions for your organization.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search agents by name or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </form>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="">All Categories</option>
              {AGENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-enterprise-500">Filters:</span>
            {search && (
              <FilterChip label={`"${search}"`} onRemove={() => { setSearchInput(''); updateParam('search', '') }} />
            )}
            {category && (
              <FilterChip label={category} onRemove={() => updateParam('category', '')} />
            )}
            <button
              onClick={() => {
                setSearchInput('')
                setSearchParams(new URLSearchParams())
              }}
              className="text-xs text-enterprise-500 hover:text-enterprise-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-enterprise-500 mb-4">
            {totalCount} agent{totalCount !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && agents.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
              <Inbox className="w-7 h-7 text-enterprise-400" />
            </div>
            <h3 className="text-lg font-semibold text-enterprise-900 mb-1">No agents found</h3>
            <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Agents will appear here once providers list them.'}
            </p>
          </div>
        )}

        {/* Agent grid */}
        {!isLoading && agents.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      to={`/marketplace/agent/${agent.id}`}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {agent.logo_url ? (
            <img
              src={agent.logo_url}
              alt={agent.agent_name}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-enterprise-900 group-hover:text-purple-700 transition-colors truncate">
              {agent.agent_name}
            </h3>
            {agent.tagline && (
              <p className="text-xs text-enterprise-500 truncate mt-0.5">{agent.tagline}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-enterprise-600 line-clamp-3 mb-4 flex-1">
          {agent.description}
        </p>

        {/* Tags */}
        {agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-500 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="text-[10px] text-enterprise-400">+{agent.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-enterprise-100 mt-auto">
          <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium">
            {agent.category}
          </span>
          <div className="flex items-center gap-1.5">
            {agent.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-enterprise-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{agent.rating.toFixed(1)}</span>
                {agent.review_count > 0 && (
                  <span className="text-enterprise-400">({agent.review_count})</span>
                )}
              </div>
            )}
            <ShortlistButton agentId={agent.id} variant="icon" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-enterprise-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-enterprise-100 rounded w-3/4" />
          <div className="h-3 bg-enterprise-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-enterprise-100 rounded w-full" />
        <div className="h-3 bg-enterprise-100 rounded w-5/6" />
        <div className="h-3 bg-enterprise-100 rounded w-2/3" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-enterprise-100 rounded w-12" />
        <div className="h-5 bg-enterprise-100 rounded w-14" />
      </div>
      <div className="flex justify-between pt-3 border-t border-enterprise-100">
        <div className="h-5 bg-enterprise-100 rounded w-20" />
        <div className="h-4 bg-enterprise-100 rounded w-10" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
      {label}
      <button onClick={onRemove} className="p-0.5 hover:bg-purple-100 rounded-full transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

