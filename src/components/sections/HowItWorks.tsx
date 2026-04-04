"use client"

import { Search, GitCompareArrows, Handshake } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Search',
    description: 'Browse 500+ AI agents by function, industry, or use case',
  },
  {
    icon: GitCompareArrows,
    number: '02',
    title: 'Compare',
    description: 'Stack agents side by side on integrations, outcomes, and fit',
  },
  {
    icon: Handshake,
    number: '03',
    title: 'Connect',
    description: 'Reach verified providers directly for demos and pilots',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-display text-display-sm text-enterprise-900">
            How It Works
          </h2>
        </AnimatedSection>

        <StaggerContainer className="relative grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] border-t-2 border-dashed border-enterprise-200 -translate-y-1/2 z-0" />

          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <div className="relative z-10 p-8 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center">
                {/* Step number */}
                <span className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest">
                  Step {step.number}
                </span>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 mt-4 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
                  <step.icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-bold text-enterprise-900 mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-enterprise-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
