"use client"

import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const challenges = [
  {
    number: '01',
    title: 'Fragmented Discovery',
    description: 'AI agent vendors are scattered across product hunt listings, blog posts, and LinkedIn ads. No single source of truth.',
  },
  {
    number: '02',
    title: 'Apples-to-Oranges Comparisons',
    description: 'Every vendor frames their solution differently. Comparing capabilities, integrations, and outcomes takes days.',
  },
  {
    number: '03',
    title: 'Slow Procurement Cycles',
    description: 'Getting from discovery to demo takes too many emails, forms, and handoffs. Urgency gets lost in the sales maze.',
  },
]

export function Challenges() {
  return (
    <section className="py-24 bg-white border-t border-enterprise-100">
      <Container>
        <AnimatedSection className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            The Challenge
          </span>
          <h2 className="font-display text-display-sm text-enterprise-900 mb-4">
            Finding the right AI agent shouldn&apos;t feel like a research project
          </h2>
          <p className="text-enterprise-600 leading-relaxed">
            GCC leaders spend weeks evaluating fragmented vendors across dozens of tabs, PDFs, and sales calls.
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
