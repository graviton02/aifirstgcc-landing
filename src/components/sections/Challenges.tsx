"use client"

import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const challenges = [
  {
    number: '01',
    title: 'Scattered Intelligence',
    description: 'AI developments move daily. Vendor landscapes shift weekly. But most GCC leaders still rely on ad hoc searches, forwarded articles, and analyst decks that are outdated before they arrive.',
  },
  {
    number: '02',
    title: 'No Shared Playbook',
    description: 'Every GCC is reinventing the wheel on AI governance, business cases, and skills assessments. There is no standardized set of frameworks built for how GCCs actually operate.',
  },
  {
    number: '03',
    title: 'Evaluation Without Context',
    description: 'Choosing AI agents and providers without structured comparisons, peer benchmarks, or domain-specific research turns every procurement into a guess.',
  },
]

export function Challenges() {
  return (
    <section className="py-24 bg-white border-t border-enterprise-100">
      <Container>
        <AnimatedSection className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            The Reality
          </span>
          <h2 className="font-display text-display-sm text-enterprise-900 mb-4">
            The gap between AI ambition and AI readiness is widening
          </h2>
          <p className="text-enterprise-600 leading-relaxed">
            GCC leaders face pressure to move fast on AI, but the infrastructure for informed decision-making barely exists.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.12}>
          {challenges.map((item) => (
            <StaggerItem key={item.number}>
              <div className="relative p-8 bg-enterprise-50 border border-enterprise-100 rounded-2xl">
                <span className="absolute top-4 right-5 font-display text-5xl text-purple-100 leading-none select-none -z-0">
                  {item.number}
                </span>
                <h3 className="relative text-base font-semibold text-enterprise-900 mb-2 pr-12">
                  {item.title}
                </h3>
                <p className="text-sm text-enterprise-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
