"use client"

import { Search, GitCompareArrows, Handshake } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Browse 500+ AI agents by function, industry, or use case',
  },
  {
    icon: GitCompareArrows,
    title: 'Compare',
    description: 'Stack agents side by side on integrations, outcomes, and fit',
  },
  {
    icon: Handshake,
    title: 'Connect',
    description: 'Reach verified providers directly for demos and pilots',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-enterprise-50/30">
      <Container>
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-display-sm text-enterprise-900">
            Three steps to the right agent
          </h2>
        </AnimatedSection>

        <StaggerContainer className="relative max-w-3xl mx-auto" staggerDelay={0.15}>
          {/* Dashed connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-9 left-[16%] right-[16%] h-0.5 z-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #d4d1cc 0, #d4d1cc 8px, transparent 8px, transparent 16px)',
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
            {steps.map((step) => (
              <StaggerItem key={step.title}>
                <div className="relative z-10 flex flex-col items-center text-center px-4">
                  {/* Icon circle */}
                  <div className="flex items-center justify-center w-[72px] h-[72px] mb-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25">
                    <step.icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-enterprise-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-enterprise-600 leading-relaxed max-w-[240px]">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </Container>
    </section>
  )
}
