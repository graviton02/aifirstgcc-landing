import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Lightbulb,
  Users,
  Clock,
  DollarSign,
  SlidersHorizontal,
  Inbox,
  X,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Pagination } from '@/components/shared/Pagination'
import { ExpressInterestButton } from '@/components/problems/ExpressInterestButton'
import { useApprovedProblems } from '@/hooks/use-gcc'
import { AGENT_CATEGORIES } from '@/data/constants/agentCategories'
import type { ProblemStatement } from '@/types/problem'

const PAGE_SIZE = 12

const timelineLabels: Record<ProblemStatement['timeline'], string> = {
  immediate: 'Immediate',
  short: '1–3 months',
  medium: '3–6 months',
  long: '6+ months',
}

export default function ProblemsListing() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const timeline = searchParams.get('timeline') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [searchInput, setSearchInput] = useState(search)

  const filters = useMemo(
    () => ({
      search,
      category: category || undefined,
      timeline: timeline || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, category, timeline, page],
  )

  const { data, isLoading } = useApprovedProblems(filters)
  const problems = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // URL helpers
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
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

  const hasFilters = !!search || !!category || !!timeline

  return (
    <div className="pt-28 pb-12">
      <Container size="wide">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-enterprise-900">
              Problem Statements
            </h1>
          </div>
          <p className="text-enterprise-500 mt-2 max-w-2xl">
            Browse anonymized challenges from GCC organizations. Providers can express interest to connect through admin-facilitated introductions.
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
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </form>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Categories</option>
              {AGENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400 pointer-events-none" />
            <select
              value={timeline}
              onChange={(e) => updateParam('timeline', e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">All Timelines</option>
              <option value="immediate">Immediate</option>
              <option value="short">1–3 months</option>
              <option value="medium">3–6 months</option>
              <option value="long">6+ months</option>
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
            {timeline && (
              <FilterChip label={timelineLabels[timeline as ProblemStatement['timeline']]} onRemove={() => updateParam('timeline', '')} />
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
            {totalCount} problem{totalCount !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && problems.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
              <Inbox className="w-7 h-7 text-enterprise-400" />
            </div>
            <h3 className="text-lg font-semibold text-enterprise-900 mb-1">No problem statements found</h3>
            <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Problem statements will appear here once GCC organizations submit and they are approved.'}
            </p>
          </div>
        )}

        {/* Problem cards grid */}
        {!isLoading && problems.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>

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
// Problem card
// ---------------------------------------------------------------------------

function ProblemCard({ problem }: { problem: ProblemStatement }) {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-white hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-enterprise-900 mb-2 line-clamp-2">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-enterprise-600 line-clamp-3 mb-4 flex-1">
          {problem.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-medium">
            {problem.category}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-600 text-[10px] font-medium">
            {problem.industry}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-enterprise-500 mb-4">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timelineLabels[problem.timeline]}
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {problem.budget_range}
          </span>
          {problem.interest_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {problem.interest_count} interested
            </span>
          )}
        </div>

        {/* Footer: Express Interest */}
        <div className="pt-3 border-t border-enterprise-100 mt-auto">
          <ExpressInterestButton problemId={problem.id} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-5 animate-pulse">
      <div className="h-4 bg-enterprise-100 rounded w-3/4 mb-2" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-enterprise-100 rounded w-full" />
        <div className="h-3 bg-enterprise-100 rounded w-5/6" />
        <div className="h-3 bg-enterprise-100 rounded w-2/3" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-enterprise-100 rounded w-16" />
        <div className="h-5 bg-enterprise-100 rounded w-14" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-4 bg-enterprise-100 rounded w-16" />
        <div className="h-4 bg-enterprise-100 rounded w-14" />
      </div>
      <div className="pt-3 border-t border-enterprise-100">
        <div className="h-7 bg-enterprise-100 rounded w-28" />
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
