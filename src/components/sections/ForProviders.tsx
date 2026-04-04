"use client"

import Link from 'next/link'
import { Users, ShieldCheck, Rocket, Repeat, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const valueProps = [
  {
    icon: Users,
    text: 'Direct access to GCC buyers actively funding AI programs',
  },
  {
    icon: ShieldCheck,
    text: 'Enterprise credibility through curated positioning',
  },
  {
    icon: Rocket,
    text: 'Faster go-to-market with reduced sales cycles',
  },
  {
    icon: Repeat,
    text: 'From custom projects to repeatable revenue',
  },
]

export function ForProviders() {
  return (
    <section className="py-24 bg-white border-t border-enterprise-100">
      <Container>
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy + CTA */}
            <div>
              <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full uppercase tracking-wider">
                For Providers
              </span>
              <h2 className="font-display text-display-xs text-enterprise-900">
                Built for Providers Too
              </h2>
              <p className="text-enterprise-600 mt-4 max-w-md">
                Connect with enterprise buyers and scale your AI solutions across the GCC ecosystem.
              </p>
              <div className="mt-8">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  >
                    List Your Agent
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Value props */}
            <div className="space-y-4">
              {valueProps.map((prop) => (
                <div key={prop.text} className="flex items-start gap-4 p-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <prop.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-enterprise-800 pt-2">
                    {prop.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
