"use client"

import { motion } from 'framer-motion'
import { Building2, Users2, Globe2, TrendingUp } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const stats = [
  {
    icon: Building2,
    value: '1,700+',
    label: 'GCCs in India alone',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Users2,
    value: '2.1M',
    label: 'GCC professionals employed',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Globe2,
    value: '$64.6B',
    label: 'Annual GCC revenue',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: TrendingUp,
    value: '11%',
    label: 'CAGR over 5 years',
    color: 'from-emerald-500 to-teal-600',
  },
]

export function SocialProofDark() {
  return (
    <section className="py-20 relative overflow-hidden bg-enterprise-950">
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <Container className="relative">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-300 bg-purple-500/20 border border-purple-500/30 rounded-full">
            The GCC Opportunity
          </span>
          <h3 className="font-display text-display-sm text-white">
            A <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">$64.6 Billion</span> Ecosystem
          </h3>
          <p className="mt-3 text-white/60">
            India hosts <span className="font-semibold text-white/80">50-55%</span> of the world&apos;s GCCs
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>

                {/* Value */}
                <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>

                {/* Label */}
                <p className="text-sm text-white/60">
                  {stat.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
