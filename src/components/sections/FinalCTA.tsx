"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

export function FinalCTA() {
  return (
    <section className="py-24 bg-enterprise-50/30">
      <Container size="narrow">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl bg-enterprise-950 px-8 py-16 sm:px-16 text-center">
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 30% 50%, rgba(108,60,224,0.3), transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.2), transparent 50%)',
              }}
            />

            <div className="relative z-10">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                Ready to find your agent?
              </h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                500+ AI agents across every GCC function. Start searching now.
              </p>
              <Link href="/directory">
                <Button
                  size="lg"
                  className="group bg-white text-enterprise-950 hover:bg-white/90 shadow-lg hover:shadow-xl"
                >
                  Explore the Directory
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
