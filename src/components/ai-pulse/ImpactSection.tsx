import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'

export function ImpactSection({ impacts }: { impacts: string[] }) {
  return (
    <section className="py-5">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 text-sm font-semibold text-purple-600 uppercase tracking-wider mb-6"
      >
        <Building2 className="w-4 h-4" />
        Enterprise & GCC Impact
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-enterprise-950 rounded-xl p-6 md:p-8"
      >
        <ul className="space-y-3">
          {impacts.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
              {point}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
