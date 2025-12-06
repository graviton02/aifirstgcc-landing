import { motion } from 'framer-motion'
import { Building2, Globe2, Users2, TrendingUp } from 'lucide-react'
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

export function SocialProof() {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-enterprise-50/50 to-transparent" />

      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      <Container className="relative">
        {/* Stats Section */}
        <AnimatedSection className="mb-16">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
              The GCC Opportunity
            </span>
            <h3 className="font-display text-display-sm text-enterprise-900">
              A <span className="text-gradient">$64.6 Billion</span> Ecosystem
            </h3>
            <p className="mt-3 text-enterprise-600">
              India hosts <span className="font-semibold text-enterprise-800">50-55%</span> of the world's GCCs
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.1}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative group p-6 rounded-2xl bg-white border border-enterprise-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                    <stat.icon className="w-5 h-5" />
                  </div>

                  {/* Value */}
                  <div className="font-display text-3xl md:text-4xl font-bold text-enterprise-900 mb-1">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <p className="text-sm text-enterprise-600">
                    {stat.label}
                  </p>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>

      </Container>
    </section>
  )
}
