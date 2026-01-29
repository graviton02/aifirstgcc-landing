import { motion } from 'framer-motion'
import { TrendingUp, ShieldAlert } from 'lucide-react'
import type { OpportunityPathway, RiskVector } from '@/data/aiPulseTypes'

export function OpportunitiesRisksSection({
  opportunities,
  risks,
}: {
  opportunities: OpportunityPathway[]
  risks: RiskVector[]
}) {
  return (
    <section className="py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl border border-emerald-200 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Opportunity Pathways
            </span>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold text-enterprise-900 mb-1">{opp.title}</h4>
                <p className="text-sm text-enterprise-600 leading-relaxed">{opp.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl border border-amber-200 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Risk Vectors</span>
          </div>

          <div className="space-y-4">
            {risks.map((risk, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold text-enterprise-900 mb-1">{risk.title}</h4>
                <p className="text-sm text-enterprise-600 leading-relaxed">{risk.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
