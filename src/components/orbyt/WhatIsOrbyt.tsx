import { Building2, Users, Briefcase } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const audienceCards = [
  {
    icon: Building2,
    title: 'For GCC Leaders',
    description:
      'Discover vetted AI agents mapped to your function-specific needs. Filter by deployment model, compliance requirements, and enterprise maturity.',
  },
  {
    icon: Users,
    title: 'For AI Providers',
    description:
      'Reach enterprise buyers through a function-first marketplace. List your agents with clear taxonomy and connect directly with GCC decision-makers.',
  },
  {
    icon: Briefcase,
    title: 'For Enterprises',
    description:
      'Standardize AI agent procurement with quality assurance. Every agent is screened for security, compliance, and production readiness.',
  },
]

export function WhatIsOrbyt() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-purple mb-3">
            What is Orbyt
          </span>
          <h2 className="font-display text-display-md text-enterprise-900 mb-4">
            The marketplace enterprise AI was missing
          </h2>
        </AnimatedSection>

        {/* Problem / Solution two-column layout */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-20">
          <AnimatedSection direction="left" delay={0.1}>
            <div className="relative h-full rounded-2xl border border-enterprise-200 bg-enterprise-50/50 p-8 md:p-10">
              <div className="absolute top-0 left-8 -translate-y-1/2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-sm font-semibold text-red-600">
                  The Problem
                </span>
              </div>
              <p className="text-enterprise-700 text-lg leading-relaxed mt-4">
                Generic AI tools weren't built for enterprise GCCs. They lack function-specific
                workflows, enterprise compliance, and the context needed for complex operations.
                The result is fragmented adoption, shadow AI, and missed opportunities.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.2}>
            <div className="relative h-full rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-violet-50/40 p-8 md:p-10">
              <div className="absolute top-0 left-8 -translate-y-1/2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-sm font-semibold text-accent-purple">
                  The Solution
                </span>
              </div>
              <p className="text-enterprise-700 text-lg leading-relaxed mt-4">
                Orbyt is the GCC-exclusive AI agent marketplace. Purpose-built agents for every
                enterprise function, vetted for security, and designed to integrate into your
                existing workflows from day one.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Audience cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {audienceCards.map((card, index) => (
            <AnimatedSection key={card.title} delay={0.1 + index * 0.15}>
              <div className="group h-full rounded-2xl border border-enterprise-200 bg-white p-8 transition-all duration-300 hover:shadow-card-hover hover:border-enterprise-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-purple/10 mb-5 transition-colors duration-300 group-hover:bg-accent-purple/15">
                  <card.icon className="w-6 h-6 text-accent-purple" />
                </div>
                <h3 className="font-display text-xl font-semibold text-enterprise-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-enterprise-600 leading-relaxed">{card.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
