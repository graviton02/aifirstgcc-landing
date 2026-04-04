"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, GitCompareArrows, ListChecks, Zap } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

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
  { icon: Search, text: "500+ AI Agents, One Search" },
  { icon: GitCompareArrows, text: "Compare Before You Commit" },
  { icon: ListChecks, text: "Your Evaluation Pipeline" },
  { icon: Zap, text: "Skip the Sales Maze" },
]

export function SearchAndFeatures() {
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
    <section className="py-16 bg-gradient-to-b from-enterprise-50 to-white">
      <Container>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-enterprise-400 w-5 h-5 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-card text-lg"
            />
            {/* Animated placeholder overlay */}
            {!searchQuery && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-enterprise-400 text-lg"
                  >
                    {placeholders[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {categoryPills.map((category) => (
            <Link
              key={category}
              href={`/directory?search=${encodeURIComponent(category)}`}
              className="px-4 py-2 rounded-full text-sm font-medium border border-enterprise-200 text-enterprise-600 hover:bg-enterprise-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Feature Boxes */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.text}>
              <div className="p-6 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center">
                <feature.icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-enterprise-800">{feature.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
