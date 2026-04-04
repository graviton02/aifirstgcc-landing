"use client"

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Search,
  BookOpen,
  Clock,
  Star,
  Inbox,
  X,
  ArrowRight,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Pagination } from '@/components/shared/Pagination'
import type {
  ThoughtLeadershipTheme,
  BlogPost,
  ThemeInfo,
} from '@/data/thoughtLeadershipContent'

const PAGE_SIZE = 9

const themeColorMap: Record<ThoughtLeadershipTheme, string> = {
  'strategic-role-ai-gcc': 'bg-blue-50 text-blue-700 border-blue-200',
  'ai-enterprise-functions': 'bg-purple-50 text-purple-700 border-purple-200',
  'benchmarks-maturity': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'talent-culture-org': 'bg-amber-50 text-amber-700 border-amber-200',
  'technology-ecosystem': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'risk-ethics-policy': 'bg-rose-50 text-rose-700 border-rose-200',
}

interface Props {
  blogPosts: BlogPost[]
  themes: ThemeInfo[]
}

export function ThoughtLeadershipClient({ blogPosts, themes }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const search = searchParams.get('search') ?? ''
  const activeTheme = (searchParams.get('theme') ?? '') as ThoughtLeadershipTheme | ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [searchInput, setSearchInput] = useState(search)

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      if (activeTheme && post.theme !== activeTheme) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !post.title.toLowerCase().includes(q) &&
          !post.excerpt.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [blogPosts, search, activeTheme])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedPosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    if (key !== 'page') next.delete('page')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchInput.trim())
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return
    updateParam('page', p > 1 ? String(p) : '')
  }

  const hasFilters = !!search || !!activeTheme
  const activeThemeInfo = themes.find((t) => t.id === activeTheme)

  return (
    <div className="pt-28 pb-16">
      <Container size="wide">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center border border-purple-200/50">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-display-sm font-display text-enterprise-900">
              Thought Leadership
            </h1>
          </div>
          <p className="text-enterprise-600 max-w-2xl leading-relaxed">
            In-depth articles on AI-first GCC transformation — governance
            frameworks, talent strategy, operational models, and benchmarking
            best practices from the AI-First GCC Research Team.
          </p>
        </div>

        {/* Theme filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => updateParam('theme', '')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
              !activeTheme
                ? 'bg-enterprise-900 text-white border-enterprise-900 shadow-sm'
                : 'bg-white text-enterprise-600 border-enterprise-200 hover:border-enterprise-300 hover:bg-enterprise-50'
            }`}
          >
            All Topics
          </button>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() =>
                updateParam('theme', activeTheme === theme.id ? '' : theme.id)
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                activeTheme === theme.id
                  ? `${themeColorMap[theme.id]} border shadow-sm`
                  : 'bg-white text-enterprise-600 border-enterprise-200 hover:border-enterprise-300 hover:bg-enterprise-50'
              }`}
            >
              {theme.title}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles by title or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 text-sm transition-shadow"
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
            {activeTheme && activeThemeInfo && (
              <FilterChip
                label={activeThemeInfo.title}
                onRemove={() => updateParam('theme', '')}
              />
            )}
            <button
              onClick={() => {
                setSearchInput('')
                router.replace(pathname)
              }}
              className="text-xs text-enterprise-500 hover:text-enterprise-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-enterprise-500 mb-5">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
              <Inbox className="w-7 h-7 text-enterprise-400" />
            </div>
            <h3 className="text-lg font-semibold text-enterprise-900 mb-1">
              No articles found
            </h3>
            <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
              Try adjusting your search or theme filter to find what you&apos;re
              looking for.
            </p>
          </div>
        )}

        {/* Article cards grid */}
        {paginatedPosts.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <ArticleCard key={post.id} post={post} themes={themes} />
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
      </Container>
    </div>
  )
}

function ArticleCard({ post, themes }: { post: BlogPost; themes: ThemeInfo[] }) {
  const themeInfo = themes.find((t) => t.id === post.theme)
  const colors = themeColorMap[post.theme] || 'bg-enterprise-50 text-enterprise-600 border-enterprise-200'

  return (
    <Link
      href={`/thought-leadership/${post.slug}`}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-purple-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div
        className={`h-1 w-full ${colors.split(' ')[0]} opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors}`}
          >
            {themeInfo?.title.split(' ').slice(0, 3).join(' ') || post.theme}
          </span>
          {post.featured && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-medium">
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-enterprise-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {post.title}
        </h3>

        <p className="text-xs text-enterprise-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-enterprise-50 text-enterprise-500 text-[10px]"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-[10px] text-enterprise-400">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-enterprise-100 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-enterprise-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTimeMinutes} min
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-enterprise-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
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
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-purple-100 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
