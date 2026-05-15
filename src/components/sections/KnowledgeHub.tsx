"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, GitCompareArrows, ListChecks, Zap, ArrowRight } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'
import { slugifyCategory } from '@/lib/categories'

const placeholders = [
  "Try 'customer experience'...",
  "Try 'IT operations'...",
  "Try 'data analytics'...",
  "Try 'sales & marketing'...",
  "Try 'HR & workforce'...",
]

const categoryPills = [
  "Customer Experience",
  "IT Operations",
  "Sales & Marketing",
  "Data & Analytics",
  "Operations & Supply Chain",
  "HR & Workforce",
]

const features = [
  { icon: Search, text: "500+ Agents, One Search" },
  { icon: GitCompareArrows, text: "Compare Before You Commit" },
  { icon: ListChecks, text: "Your Evaluation Pipeline" },
  { icon: Zap, text: "Skip the Sales Maze" },
]

const sideCards = [
  {
    title: "Tools & Templates",
    description: "Ready-to-use project templates, checklists, and frameworks.",
    image: "/images/icons/implementation-templates.webp",
    href: "/tools",
    linkText: "Browse tools",
  },
  {
    title: "AI Agent Thoughtbook",
    description: "Comprehensive guide to agentic AI in enterprise environments.",
    image: "/images/icons/playbooks-frameworks.webp",
    href: "/thoughtbook",
    linkText: "Start reading",
  },
]

const bottomCards = [
  {
    title: "AI Pulse — Daily Briefs",
    description: "Curated daily updates on AI developments and trends.",
    image: "/news.webp",
    href: "/ai-pulse",
    linkText: "Read briefs",
  },
  {
    title: "Thought Leadership",
    description: "In-depth articles on AI governance, talent strategy, and operational models.",
    image: "/advisors.webp",
    href: "/thought-leadership",
    linkText: "Read articles",
  },
  {
    title: "Provider Ecosystem",
    description: "Curated AI solution providers with detailed analyst profiles.",
    image: "/images/icons/research-benchmarks.webp",
    href: "/providers",
    linkText: "View providers",
  },
  {
    title: "AI Job Board",
    description: "Source AI talent for your Global Capability Center — engineers, scientists, and operators.",
    image: "/images/icons/operating-models.webp",
    href: "/jobs",
    linkText: "Browse jobs",
  },
]

function ResourceCard({ card }: { card: typeof sideCards[number] }) {
  return (
    <Link href={card.href} className="block h-full group">
      <div className="h-full rounded-2xl bg-white shadow-card overflow-hidden flex flex-col transition-all duration-400 hover:shadow-card-hover hover:-translate-y-1">
        {/* Image area */}
        <div className="h-44 bg-gradient-to-br from-enterprise-100 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.03]" />
          <img
            src={card.image}
            alt=""
            className="w-32 h-32 object-contain drop-shadow-md transition-transform duration-400 group-hover:scale-110 group-hover:-translate-y-1"
            loading="lazy"
          />
        </div>
        {/* Body */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-enterprise-900 mb-2 font-display">
            {card.title}
          </h3>
          <p className="text-sm text-enterprise-500 leading-relaxed mb-4 flex-1">
            {card.description}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all duration-300">
            {card.linkText}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function KnowledgeHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/directory?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/directory')
    }
  }

  return (
    <section id="knowledge-hub" className="py-24 bg-enterprise-50 relative overflow-hidden">
      {/* Subtle radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05),transparent_60%)]" />

      <Container size="wide" className="relative">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest rounded-full mb-5">
            Knowledge Hub
          </span>
          <h2 className="font-display text-display-sm md:text-display-md text-enterprise-900 mb-4">
            Everything you need to navigate the AI transformation
          </h2>
          <p className="text-enterprise-500 text-base leading-relaxed">
            Agents, frameworks, playbooks, and expert guidance — curated for enterprise leaders.
          </p>
        </AnimatedSection>

        {/* Bento Grid — Top: Marketplace (2/3) + 2 stacked cards (1/3) */}
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-5"
          staggerDelay={0.1}
        >
          {/* ── MEGA CARD: Dark marketplace surface ── */}
          <StaggerItem className="md:col-span-2 md:row-span-2">
            <div className="h-full rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 flex flex-col relative overflow-hidden shadow-glow-lg transition-all duration-400 group">
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />
              {/* Noise texture */}
              <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

              {/* Top: Icon + Title */}
              <div className="relative flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/images/icons/agent-marketplace.webp"
                    alt=""
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-display tracking-tight">
                    AI Agents Marketplace
                  </h3>
                  <p className="text-base text-white/50 mt-1">
                    Search, compare, and connect with 500+ production-ready AI agents
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-enterprise-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-4 rounded-xl border border-white/10 bg-white text-enterprise-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-lg"
                />
                {!searchQuery && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="text-enterprise-400 text-base"
                      >
                        {placeholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors shadow-md"
                >
                  Search
                </button>
              </form>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categoryPills.map((category) => (
                  <Link
                    key={category}
                    href={`/directory?tab=${slugifyCategory(category)}`}
                    className="px-4 py-2 rounded-full text-xs font-medium border border-white/15 text-white/60 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {features.map((feature) => (
                  <div
                    key={feature.text}
                    className="p-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl text-center hover:bg-white/10 hover:border-white/15 transition-all duration-200 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-300">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-white/80">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Explore Link */}
              <Link
                href="/directory"
                className="relative inline-flex items-center gap-2 text-sm font-bold text-indigo-300 mt-auto pt-6 group/link hover:text-indigo-200 transition-colors"
              >
                Explore all agents
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </StaggerItem>

          {/* ── RIGHT SIDE CARDS (stacked) ── */}
          {sideCards.map((card) => (
            <StaggerItem key={card.title}>
              <ResourceCard card={card} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom Row — 3 equal cards */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5"
          staggerDelay={0.1}
        >
          {bottomCards.map((card) => (
            <StaggerItem key={card.title}>
              <ResourceCard card={card} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
