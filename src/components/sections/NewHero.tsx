"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Container } from '@/components/shared/Container'
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

export function NewHero() {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* MeshGradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#cbbcf7_0%,_#8d6cff_22%,_#241d9a_48%,_#120b4a_72%,_#05030f_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-enterprise-950/30 via-transparent to-enterprise-950/60" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative dots */}
      <div className="absolute top-1/4 left-[10%] w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
      <div className="absolute top-1/3 right-[15%] w-3 h-3 bg-purple-300/50 rounded-full blur-[2px]" />
      <div className="absolute bottom-1/3 left-[20%] w-1.5 h-1.5 bg-blue-200/60 rounded-full blur-[1px]" />

      {/* Content */}
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            Find the Right AI Agent
            <br />
            <span className="text-gradient-light">for Your Enterprise</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10 leading-relaxed"
          >
            The curated directory of 500+ AI agents built for Global Capability Centers
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-enterprise-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 rounded-xl border border-white/20 bg-white/95 backdrop-blur-sm text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-xl text-lg"
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
                  href={`/directory?tab=${slugifyCategory(category)}`}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40 hover:text-white transition-colors backdrop-blur-sm"
                >
                  {category}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
