import { Upload, Search, ShieldCheck, Handshake } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from '@/components/shared/AnimatedSection'

const steps = [
  {
    number: '01',
    title: 'List',
    description:
      'AI providers list their agents with function tags, deployment details, and compliance documentation.',
    icon: Upload,
  },
  {
    number: '02',
    title: 'Discover',
    description:
      'GCCs browse by enterprise function, filter by deployment model, and compare agent capabilities.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Screen',
    description:
      'Enterprise-grade screening: SOC2, data residency, SSO compatibility, and bias audits.',
    icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Connect',
    description:
      'Direct connection between GCC and provider — no intermediaries, no markup.',
    icon: Handshake,
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-enterprise-50/60">
      <Container size="wide">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-purple mb-3">
            How It Works
          </span>
          <h2 className="font-display text-display-md text-enterprise-900 mb-4">
            From listing to live in four steps
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-enterprise-600">
            A streamlined process that connects AI providers with enterprise buyers — transparently and efficiently.
          </p>
        </AnimatedSection>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <StaggerContainer className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Connecting rail — desktop only */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-accent-purple/20 via-accent-purple/40 to-accent-purple/20 z-0" />

          {/* Connecting rail — mobile only (vertical) */}
          <div className="md:hidden absolute top-0 bottom-0 left-[27px] w-[2px] bg-gradient-to-b from-accent-purple/20 via-accent-purple/40 to-accent-purple/20 z-0" />

          {steps.map((step) => (
            <StaggerItem key={step.number} className="relative z-10">
              <div className="flex md:flex-col items-start md:items-center gap-5 md:gap-0 md:text-center">
                {/* Step number circle */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-accent-purple/30 flex items-center justify-center shadow-sm md:mb-5">
                  <step.icon className="w-6 h-6 text-accent-purple" />
                </div>

                <div>
                  {/* Step number + title */}
                  <div className="flex items-center gap-2 md:justify-center mb-2">
                    <span className="text-xs font-bold tracking-wider text-accent-purple/60 uppercase">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-enterprise-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-enterprise-600 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
