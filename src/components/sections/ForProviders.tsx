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
    <section className="py-20 relative overflow-hidden bg-enterprise-950">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

      <Container className="relative">
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Copy + CTA */}
            <div>
              <h2 className="font-display text-display-xs text-white">
                Built for Providers Too
              </h2>
              <p className="text-white/60 mt-4 max-w-md">
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
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <prop.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-white/80 pt-2">
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
