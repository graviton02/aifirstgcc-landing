import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Sparkles, Bot, Cpu, Network, Zap, Brain, Building2 } from 'lucide-react'
import { Container } from '@/components/shared/Container'

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const dummyStories = [
  {
    id: 1,
    category: 'Enterprise AI',
    headline: 'Fortune 500 Companies Racing to Deploy Autonomous AI Agents',
    excerpt: 'Major enterprises are accelerating their adoption of agentic AI systems, with early movers reporting significant operational efficiencies.',
    readTime: '5 min read',
    featured: true,
    icon: Building2,
  },
  {
    id: 2,
    category: 'Automation',
    headline: 'The Rise of Self-Healing Enterprise Systems',
    excerpt: 'New generation of AI-powered infrastructure can detect, diagnose, and resolve issues without human intervention.',
    readTime: '4 min read',
    featured: false,
    icon: Zap,
  },
  {
    id: 3,
    category: 'GCC Insights',
    headline: 'Global Capability Centers Embrace AI-First Strategies',
    excerpt: 'GCCs worldwide are pivoting from cost centers to innovation hubs powered by advanced AI capabilities.',
    readTime: '6 min read',
    featured: false,
    icon: Network,
  },
  {
    id: 4,
    category: 'Agentic AI',
    headline: 'Multi-Agent Systems Transform Complex Workflows',
    excerpt: 'Organizations deploying coordinated AI agent teams are seeing unprecedented gains in process automation.',
    readTime: '5 min read',
    featured: false,
    icon: Bot,
  },
  {
    id: 5,
    category: 'Technology',
    headline: 'Next-Gen LLMs Unlock New Enterprise Use Cases',
    excerpt: 'Latest foundation models demonstrate remarkable reasoning capabilities for enterprise decision-making.',
    readTime: '4 min read',
    featured: false,
    icon: Brain,
  },
  {
    id: 6,
    category: 'Infrastructure',
    headline: 'Edge AI Deployment Accelerates Across Industries',
    excerpt: 'Enterprises are pushing AI capabilities closer to where decisions need to be made in real-time.',
    readTime: '3 min read',
    featured: false,
    icon: Cpu,
  },
]

export function AIPulse() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Newspaper-Style Hero Header */}
      <header className="relative h-[50vh] min-h-[400px] bg-enterprise-950 overflow-hidden flex items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <Container className="relative z-10 text-center">
          {/* Top Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"
          />

          {/* Masthead */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/80 font-medium">Orbys360 Intelligence</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-newspaper text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4"
          >
            AI Pulse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-newspaper text-xl md:text-2xl lg:text-3xl text-white/70 italic mb-8 max-w-3xl mx-auto"
          >
            Today in Agentic AI & Enterprise Automation
          </motion.p>

          {/* Date Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-white/60"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Daily Digest</span>
            </div>
          </motion.div>

          {/* Bottom Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"
          />
        </Container>

        {/* Bottom Edge Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="h-8 bg-gradient-to-b from-enterprise-950 to-transparent" />
        </div>
      </header>

      {/* Story Cards Section */}
      <section className="py-16 md:py-24">
        <Container>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-newspaper text-3xl md:text-4xl font-bold text-enterprise-900 mb-4">
              Latest Intelligence
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
          </motion.div>

          {/* Story Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {dummyStories.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-enterprise-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-enterprise-700 font-medium">
                Full content coming soon. Stay tuned for curated AI insights.
              </span>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}

interface Story {
  id: number
  category: string
  headline: string
  excerpt: string
  readTime: string
  featured: boolean
  icon: React.ComponentType<{ className?: string }>
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const Icon = story.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative bg-white rounded-2xl border border-enterprise-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-enterprise-300 hover:-translate-y-1 ${
        story.featured ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      {/* Card Header with Icon */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
            <Icon className="w-6 h-6 text-enterprise-700" />
          </div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {story.category}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-newspaper text-xl font-bold text-enterprise-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">
          {story.headline}
        </h3>

        {/* Excerpt */}
        <p className="text-enterprise-600 text-sm leading-relaxed mb-4">
          {story.excerpt}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-enterprise-100">
        <span className="text-xs text-enterprise-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {story.readTime}
        </span>
        <button className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Read More
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      </div>
    </motion.article>
  )
}
