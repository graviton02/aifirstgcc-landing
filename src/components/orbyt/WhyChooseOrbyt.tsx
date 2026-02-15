import { Layers, ShieldCheck, ArrowLeftRight, BadgeCheck } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const features = [
  {
    icon: Layers,
    title: 'Function-First Taxonomy',
    description:
      'Unlike generic marketplaces, every agent is mapped to enterprise functions: Finance, HR, IT, Legal, Supply Chain, and more. Find exactly what your team needs.',
    accent: 'from-purple-500 to-violet-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    span: true, // This card spans full width on desktop
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Trust Layer',
    description:
      'SOC2 compliance, data residency controls, SSO integration, and deployment model transparency — built into every listing.',
    accent: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    span: false,
  },
  {
    icon: ArrowLeftRight,
    title: 'Two-Way Matching',
    description:
      'GCCs post challenges, providers propose solutions. Smart matching based on function, maturity, and deployment requirements.',
    accent: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    span: false,
  },
  {
    icon: BadgeCheck,
    title: 'Quality Over Quantity',
    description:
      'Every agent is vetted. No demo-ware. No vaporware. Only production-ready agents that meet enterprise standards.',
    accent: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    span: false,
  },
]

export function WhyChooseOrbyt() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-purple mb-3">
            Why Orbyt
          </span>
          <h2 className="font-display text-display-md text-enterprise-900 mb-4">
            Built different, on purpose
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-enterprise-600">
            Everything an enterprise needs from an AI marketplace — and nothing it doesn't.
          </p>
        </AnimatedSection>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection
              key={feature.title}
              delay={0.1 + index * 0.1}
              className={feature.span ? 'md:col-span-2' : ''}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-enterprise-200 bg-enterprise-50/30 p-8 md:p-10 transition-all duration-300 hover:shadow-card-hover hover:border-enterprise-300">
                {/* Subtle gradient accent at top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className={feature.span ? 'md:max-w-3xl' : ''}>
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} mb-5`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-enterprise-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-enterprise-600 leading-relaxed text-base md:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
