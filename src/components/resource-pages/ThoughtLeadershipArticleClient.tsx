"use client"

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import type {
  ThoughtLeadershipTheme,
  BlogPost,
  ThemeInfo,
} from '@/data/thoughtLeadershipContent'

const themeColorMap: Record<ThoughtLeadershipTheme, string> = {
  'strategic-role-ai-gcc': 'bg-blue-50 text-blue-700 border-blue-200',
  'ai-enterprise-functions': 'bg-purple-50 text-purple-700 border-purple-200',
  'benchmarks-maturity': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'talent-culture-org': 'bg-amber-50 text-amber-700 border-amber-200',
  'technology-ecosystem': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'risk-ethics-policy': 'bg-rose-50 text-rose-700 border-rose-200',
}

interface Props {
  post: BlogPost
  relatedPosts: BlogPost[]
  themes: ThemeInfo[]
}

export function ThoughtLeadershipArticleClient({ post, relatedPosts, themes }: Props) {
  const themeInfo = themes.find((t) => t.id === post.theme)
  const colors = themeColorMap[post.theme] || 'bg-enterprise-50 text-enterprise-600 border-enterprise-200'

  return (
    <div className="pt-28 pb-16">
      {/* Back link */}
      <Container size="narrow">
        <Link
          href="/thought-leadership"
          className="inline-flex items-center gap-1.5 text-sm text-enterprise-500 hover:text-enterprise-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Thought Leadership
        </Link>
      </Container>

      {/* Article hero */}
      <Container size="narrow">
        <header className="mb-10">
          {/* Theme badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colors}`}
            >
              {themeInfo?.title || post.theme}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-display-md font-display text-enterprise-900 mb-5 leading-tight">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-enterprise-500 pb-6 border-b border-enterprise-200">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTimeMinutes} min read
            </span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-500 text-xs border border-enterprise-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
      </Container>

      {/* Article body */}
      <Container size="narrow">
        <article className="prose-article">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </Container>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <Container size="wide" className="mt-16">
          <div className="border-t border-enterprise-200 pt-10">
            <h2 className="text-lg font-display font-semibold text-enterprise-900 mb-6">
              More on {themeInfo?.title || 'this topic'}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <RelatedCard key={related.id} post={related} themes={themes} />
              ))}
            </div>
          </div>
        </Container>
      )}
    </div>
  )
}

function RelatedCard({ post, themes }: { post: BlogPost; themes: ThemeInfo[] }) {
  const colors = themeColorMap[post.theme] || 'bg-enterprise-50 text-enterprise-600 border-enterprise-200'

  return (
    <Link
      href={`/thought-leadership/${post.slug}`}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-purple-200 hover:shadow-card transition-all duration-300 p-5 flex flex-col"
    >
      <span
        className={`self-start inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border mb-3 ${colors}`}
      >
        {themes.find((t) => t.id === post.theme)?.title.split(' ').slice(0, 3).join(' ') || post.theme}
      </span>
      <h3 className="text-sm font-semibold text-enterprise-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
        {post.title}
      </h3>
      <p className="text-xs text-enterprise-600 line-clamp-2 mb-3 flex-1">
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between text-[11px] text-enterprise-500">
        <span>{post.readTimeMinutes} min read</span>
        <ArrowRight className="w-3.5 h-3.5 text-enterprise-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}
