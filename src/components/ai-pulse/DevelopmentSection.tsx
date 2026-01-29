import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { AIDevelopment } from '@/data/aiPulseTypes'

const numberLabels = ['01', '02', '03'] as const

export function DevelopmentSection({ developments }: { developments: AIDevelopment[] }) {
  return (
    <section className="py-5">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-6"
      >
        Top Developments
      </motion.h2>

      <div className="space-y-5">
        {developments.map((dev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-enterprise-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-sm font-bold text-enterprise-700">
                {numberLabels[i]}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-newspaper text-lg font-bold text-enterprise-900 mb-2 leading-snug">
                  {dev.headline}
                </h3>
                <p className="text-enterprise-600 text-sm leading-relaxed mb-3">{dev.description}</p>
                <a
                  href={dev.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {dev.source.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
