'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Search,
  Building2,
  MapPin,
  Users,
  ArrowRight,
  Inbox,
  X,
  Sparkles,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Pagination } from '@/components/shared/Pagination'
import { providerData, type ProviderSummary } from '@/data/providerDirectoryData'

const PAGE_SIZE = 12

export function ProvidersPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [searchInput, setSearchInput] = useState(search)

  const filtered = useMemo(() => {
    return providerData.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.tagline.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedProviders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // URL helpers
  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchInput.trim())
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return
    updateParam('page', p > 1 ? String(p) : '')
  }

  const hasFilters = !!search

  return (
    <div className="pt-28 pb-16">
      <Container size="wide">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-enterprise-50 flex items-center justify-center border border-emerald-200/50">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-display-sm font-display text-enterprise-900">
              Provider Ecosystem
            </h1>
          </div>
          <p className="text-enterprise-600 max-w-2xl leading-relaxed">
            Explore the curated network of technology service providers, AI
            specialists, and consulting firms driving AI-first GCC
            transformation across the ecosystem.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-enterprise-200">
          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{providerData.length} AI providers</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by provider name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-300 text-sm transition-shadow"
            />
          </form>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-enterprise-500">Filters:</span>
            {search && (
              <FilterChip
                label={`"${search}"`}
                onRemove={() => {
                  setSearchInput('')
                  updateParam('search', '')
                }}
              />
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-enterprise-500 mb-5">
          {filtered.length} provider{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
              <Inbox className="w-7 h-7 text-enterprise-400" />
            </div>
            <h3 className="text-lg font-semibold text-enterprise-900 mb-1">
              No providers found
            </h3>
            <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}

        {/* Provider cards grid */}
        {paginatedProviders.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}

        {/* Become a Provider CTA */}
        <div className="mt-12 rounded-xl border border-enterprise-200 bg-gradient-to-br from-enterprise-50 to-white p-8 text-center">
          <h2 className="text-lg font-display font-semibold text-enterprise-900 mb-2">
            Join the Provider Ecosystem
          </h2>
          <p className="text-sm text-enterprise-600 max-w-lg mx-auto mb-5">
            Are you a technology service provider or AI specialist? Join the
            Orbys360 ecosystem to connect with GCC organizations seeking
            AI-first transformation partners.
          </p>
          <a
            href="/#signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Join Waitlist
          </a>
        </div>
      </Container>
    </div>
  )
}

function ProviderCard({ provider }: { provider: ProviderSummary }) {
  const initials = provider.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-emerald-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Provider identity */}
        <div className="flex items-start gap-4 mb-4">
          {provider.logo ? (
            <img
              src={provider.logo}
              alt={provider.name}
              loading="lazy"
              className="shrink-0 w-14 h-14 rounded-xl object-contain bg-white border border-enterprise-100 p-1.5"
            />
          ) : (
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-enterprise-800 to-enterprise-900 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-enterprise-900 group-hover:text-emerald-700 transition-colors truncate">
              {provider.name}
            </h3>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-enterprise-600 line-clamp-2 mb-5 flex-1 leading-relaxed">
          {provider.tagline}
        </p>

        {/* Meta */}
        <div className="space-y-2 text-xs text-enterprise-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{provider.locations}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>{provider.employees}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="pt-4 border-t border-enterprise-100 mt-4 flex items-center justify-between">
          <span className="text-xs text-enterprise-400">View profile</span>
          <ArrowRight className="w-4 h-4 text-enterprise-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
