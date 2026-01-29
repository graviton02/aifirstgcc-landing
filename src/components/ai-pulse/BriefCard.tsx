import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import type { DailyBrief } from '@/data/aiPulseTypes'

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BriefCard({ brief, index }: { brief: DailyBrief; index: number }) {
  const displayHeadline = brief.editorHeadline ?? brief.topDevelopments[0].headline

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/ai-pulse/${brief.slug}`}
        className="group block relative bg-white rounded-2xl border border-enterprise-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-enterprise-300 hover:-translate-y-1"
      >
        {/* Date badge */}
        <div className="px-6 pt-6 pb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(brief.date)}
          </span>
        </div>

        {/* Headline */}
        <div className="px-6 pb-4">
          <h3 className="font-newspaper text-xl font-bold text-enterprise-900 leading-tight group-hover:text-blue-700 transition-colors mb-4">
            {displayHeadline}
          </h3>

          {/* Development previews */}
          <ul className="space-y-2">
            {brief.topDevelopments.map((dev, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-enterprise-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-enterprise-100 text-enterprise-500 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="line-clamp-1">{dev.headline}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 flex items-center justify-end border-t border-enterprise-100">
          <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Read Brief
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        </div>
      </Link>
    </motion.div>
  )
}
