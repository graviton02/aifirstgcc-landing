import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Target,
  Database,
  Workflow,
  Factory,
  GraduationCap,
  Rocket,
  Shield,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const mandates = [
  {
    number: '01',
    title: 'Institutionalize Enterprise AI Strategy',
    subtitle: 'Foundation',
    icon: Target,
    description: 'Embed AI into the core strategic fabric of the organization',
    color: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    number: '02',
    title: 'Build the Enterprise Data & Semantic Layer',
    subtitle: 'Infrastructure',
    icon: Database,
    description: 'Create the unified data backbone for AI-driven decisions',
    color: 'from-violet-500 to-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    number: '03',
    title: 'Engineer Intelligent Workflows',
    subtitle: 'Automation',
    icon: Workflow,
    description: 'Transform processes with AI-powered intelligence',
    color: 'from-fuchsia-500 to-pink-400',
    glowColor: 'rgba(217, 70, 239, 0.3)',
  },
  {
    number: '04',
    title: 'Operationalize AI at Scale',
    subtitle: 'AI Factory',
    icon: Factory,
    description: 'Industrialize AI development and deployment',
    color: 'from-orange-500 to-amber-400',
    glowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    number: '05',
    title: 'Develop Future-Ready AI Talent',
    subtitle: 'People',
    icon: GraduationCap,
    description: 'Build the workforce of tomorrow, today',
    color: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    number: '06',
    title: 'Drive Enterprise-Wide Adoption',
    subtitle: 'Scale',
    icon: Rocket,
    description: 'Accelerate AI adoption across all functions',
    color: 'from-rose-500 to-red-400',
    glowColor: 'rgba(244, 63, 94, 0.3)',
  },
  {
    number: '07',
    title: 'Establish Responsible AI & Governance',
    subtitle: 'Trust',
    icon: Shield,
    description: 'Ensure ethical, compliant, and trustworthy AI',
    color: 'from-indigo-500 to-blue-400',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
]

export function SevenMandates() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section id="mandates" className="relative py-24 md:py-32 overflow-hidden">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-[#0a0a1a]" />

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative diagonal lines */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] w-[200%] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              top: `${20 + i * 20}%`,
              left: '-50%',
              transform: 'rotate(-15deg)',
            }}
          />
        ))}
      </div>

      <Container size="wide" className="relative">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2.5 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm font-medium text-purple-300 tracking-wide uppercase">
              Strategic Framework
            </span>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Mandates</span>
            <br />
            <span className="text-white/80">of an AI-First GCC</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-white/50">
            The strategic pillars that define the transformation journey
          </p>
        </AnimatedSection>

        {/* Mandates Grid - 2-3-2 layout */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
          {mandates.map((mandate, index) => {
            // Row 1 (index 0-1): 2 cards spanning 3 cols each
            // Row 2 (index 2-4): 3 cards spanning 2 cols each
            // Row 3 (index 5-6): 2 cards spanning 3 cols each
            const getColSpan = () => {
              if (index <= 1 || index >= 5) return 'lg:col-span-3'
              return 'lg:col-span-2'
            }

            return (
            <motion.div
              key={mandate.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`group relative ${getColSpan()}`}
            >
              <div
                className="relative h-full p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.15] hover:from-white/[0.08] hover:to-white/[0.04] min-h-[200px]"
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${mandate.glowColor}, transparent 40%)`,
                  }}
                />

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Top row: Number + Subtitle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-5xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br ${mandate.color} opacity-30 group-hover:opacity-50 transition-opacity`}>
                      {mandate.number}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium text-white/50 bg-white/5 rounded-full border border-white/10">
                      {mandate.subtitle}
                    </span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`inline-flex items-center justify-center w-14 h-14 mb-5 rounded-xl bg-gradient-to-br ${mandate.color} shadow-lg`}
                    style={{ boxShadow: `0 8px 32px ${mandate.glowColor}` }}
                  >
                    <mandate.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-3 leading-tight group-hover:text-white transition-colors">
                    {mandate.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-sm leading-relaxed mt-auto group-hover:text-white transition-colors">
                    {mandate.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${mandate.color} opacity-50 group-hover:opacity-100 group-hover:w-16 transition-all duration-500`} />
                      <div className="w-2 h-1 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${mandate.color} opacity-10 rounded-full blur-2xl`} />
                </div>
              </div>
            </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA hint */}
        <AnimatedSection delay={0.8} className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-white/40"
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-sm font-medium">
              Detailed frameworks coming soon
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
