import fs from 'fs'
import path from 'path'
import { calculateReadTimeMinutes, deriveExcerpt, parseMarkdownWithJsonFrontMatter } from '@/lib/markdown'

export type ThoughtLeadershipTheme =
  | 'strategic-role-ai-gcc'
  | 'ai-enterprise-functions'
  | 'benchmarks-maturity'
  | 'talent-culture-org'
  | 'technology-ecosystem'
  | 'risk-ethics-policy'

export interface BlogPost {
  id: string
  slug: string
  title: string
  theme: ThoughtLeadershipTheme
  excerpt: string
  content: string
  author: string
  publishDate: string
  readTimeMinutes: number
  tags: string[]
  featured: boolean
}

export interface ThemeInfo {
  id: ThoughtLeadershipTheme
  title: string
  description: string
  icon: string
  color: string
}

type BlogFrontMatter = {
  title: string
  slug?: string
  theme: ThoughtLeadershipTheme
  excerpt?: string
  author?: string
  publishDate?: string
  readTimeMinutes?: number
  tags?: string[]
  featured?: boolean
}

const defaultAuthor = 'AI-First GCC Research Team'

export function loadBlogPosts(): BlogPost[] {
  const contentDir = path.join(process.cwd(), 'content', 'thought-leadership')
  if (!fs.existsSync(contentDir)) return []

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))

  const posts: BlogPost[] = files.map((filename) => {
    const filePath = path.join(contentDir, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = parseMarkdownWithJsonFrontMatter<BlogFrontMatter>(raw)

    const title = data.title?.trim()
    if (!title) {
      throw new Error(`Missing required 'title' field in blog markdown: ${filename}`)
    }

    const slugFromPath = filename.replace(/\.md$/, '')
    const slug = (data.slug || slugFromPath || title).trim()

    const theme = data.theme
    if (!theme) {
      throw new Error(`Missing required 'theme' field in blog markdown: ${filename}`)
    }

    const excerpt = data.excerpt?.trim() || deriveExcerpt(content)
    const publishDate = data.publishDate || new Date().toISOString().slice(0, 10)
    const readTimeMinutes = typeof data.readTimeMinutes === 'number' && data.readTimeMinutes > 0
      ? Math.round(data.readTimeMinutes)
      : calculateReadTimeMinutes(content)
    const tags = Array.isArray(data.tags) ? data.tags.map(tag => String(tag)) : []
    const featured = Boolean(data.featured)
    const author = data.author?.trim() || defaultAuthor

    return {
      id: slug,
      slug,
      title,
      theme,
      excerpt,
      content,
      author,
      publishDate,
      readTimeMinutes,
      tags,
      featured,
    }
  })

  posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
  return posts
}

export const thoughtLeadershipThemes: ThemeInfo[] = [
  {
    id: 'strategic-role-ai-gcc',
    title: 'Strategic Role of AI in GCC Evolution',
    description: 'How AI is transforming GCCs from cost centers to strategic business partners',
    icon: 'TrendingUp',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'ai-enterprise-functions',
    title: 'AI + Enterprise Functions in GCCs',
    description: 'AI applications across finance, HR, operations, and other enterprise functions',
    icon: 'Building2',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'benchmarks-maturity',
    title: 'Benchmarks & Maturity Models',
    description: 'Frameworks and metrics for measuring AI maturity in GCC environments',
    icon: 'BarChart3',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    id: 'talent-culture-org',
    title: 'Talent, Culture & Organization',
    description: 'Building AI-ready teams and organizational culture in GCCs',
    icon: 'Users',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'technology-ecosystem',
    title: 'Technology & Ecosystem',
    description: 'Technology stack, platforms, and ecosystem partnerships for AI implementation',
    icon: 'Cpu',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'risk-ethics-policy',
    title: 'Risk, Ethics & Policy',
    description: 'Governance, compliance, and ethical considerations for AI in GCCs',
    icon: 'Shield',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
]

export const getPostsByTheme = (theme: ThoughtLeadershipTheme, posts: BlogPost[]): BlogPost[] => {
  return posts.filter(post => post.theme === theme)
}

export const getFeaturedPosts = (posts: BlogPost[]): BlogPost[] => {
  return posts.filter(post => post.featured)
}

export const getPostBySlug = (slug: string, posts: BlogPost[]): BlogPost | undefined => {
  return posts.find(post => post.slug === slug)
}
