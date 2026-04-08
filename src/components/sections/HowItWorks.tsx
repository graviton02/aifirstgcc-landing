"use client"

import Link from 'next/link'
import { Newspaper, GraduationCap, Rocket, ArrowRight } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const pillars = [
  {
    icon: Newspaper,
    number: '01',
    title: 'Stay Informed',
    description:
      'Cut through the noise with curated daily briefings and in-depth research written for enterprise AI leaders.',
    offerings: [
      {
        name: 'AI Pulse',
        detail: 'Daily briefs on the developments that matter',
        href: '/ai-pulse',
      },
      {
        name: 'Thought Leadership',
        detail: 'Deep analysis on governance, talent, and operations',
        href: '/thought-leadership',
      },
    ],
  },
  {
    icon: GraduationCap,
    number: '02',
    title: 'Build Capability',
    description:
      'Equip your teams with structured learning and ready-to-use frameworks purpose-built for GCC environments.',
    offerings: [
      {
        name: 'AI Agent Thoughtbook',
        detail: '40+ chapters on agentic AI, from foundations to scaling',
        href: '/thoughtbook',
      },
      {
        name: 'Tools & Templates',
        detail: 'Charters, skills taxonomies, business case templates, and more',
        href: '/tools',
      },
    ],
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Take Action',
    description:
      'When you are ready to move, find the right agents and providers without the sales maze.',
    offerings: [
      {
        name: 'AI Agents Marketplace',
        detail: '500+ agents searchable by function, industry, and use case',
        href: '/directory',
      },
      {
        name: 'Provider Ecosystem',
        detail: 'Curated providers with analyst-written profiles',
        href: '/providers',
      },
    ],
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <AnimatedSection className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
            How Orbys360 Works
          </span>
          <h2 className="font-display text-display-sm text-enterprise-900 mb-4">
            From awareness to action, everything in one place
          </h2>
          <p className="text-enterprise-600 leading-relaxed">
            Orbys360 brings together the intelligence, tools, and ecosystem your GCC needs to move from exploring AI to operating with it.
          </p>
        </AnimatedSection>

        <StaggerContainer className="relative grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] border-t-2 border-dashed border-enterprise-200 -translate-y-1/2 z-0" />

          {pillars.map((pillar) => (
            <StaggerItem key={pillar.number}>
              <div className="relative z-10 p-8 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center flex flex-col items-center h-full">
                {/* Step number */}
                <span className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest">
                  Step {pillar.number}
                </span>

                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mt-4 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
                  <pillar.icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-bold text-enterprise-900 mb-2">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-enterprise-600 leading-relaxed mb-6">
                  {pillar.description}
                </p>

                {/* Sub-offerings */}
                <div className="w-full mt-auto space-y-2">
                  {pillar.offerings.map((offering) => (
                    <Link
                      key={offering.href}
                      href={offering.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-enterprise-50 hover:bg-enterprise-100 border border-enterprise-100 transition-colors group text-left"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-enterprise-900 block">
                          {offering.name}
                        </span>
                        <span className="text-xs text-enterprise-500 block truncate">
                          {offering.detail}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-enterprise-400 group-hover:text-purple-600 shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <AnimatedSection className="text-center mt-10">
          <Link
            href="#knowledge-hub"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors"
          >
            Explore the Knowledge Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </Container>
    </section>
  )
}
