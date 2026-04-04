import { motion } from 'framer-motion'
import { Lightbulb, ExternalLink } from 'lucide-react'
import type { AIUseCase } from '@/data/aiPulseTypes'

export function UseCaseSection({ useCase }: { useCase: AIUseCase }) {
  return (
    <section className="py-5">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 text-sm font-semibold text-amber-600 uppercase tracking-wider mb-6"
      >
        <Lightbulb className="w-4 h-4 text-amber-500" />
        Use Case of the Day
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white rounded-xl border border-enterprise-200 overflow-hidden"
      >
        {/* Gradient left border accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500" />

        <div className="p-6 pl-8">
          <h3 className="font-newspaper text-xl font-bold text-enterprise-900 mb-3">{useCase.title}</h3>
          <p className="text-enterprise-600 text-sm leading-relaxed mb-4">{useCase.description}</p>

          <a
            href={useCase.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {useCase.source.label}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </section>
  )
}
