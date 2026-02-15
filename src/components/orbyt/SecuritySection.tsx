import { Shield, Lock, Server, FileCheck, Globe, Award } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from '@/components/shared/AnimatedSection'

const securityFeatures = [
  {
    icon: Globe,
    title: 'Data Residency',
    description: 'Choose where your data lives. Region-specific deployment options.',
  },
  {
    icon: Server,
    title: 'Deployment Models',
    description: 'On-premise, private cloud, or SaaS. Your infrastructure, your rules.',
  },
  {
    icon: Lock,
    title: 'SSO Integration',
    description: 'Seamless authentication with your existing identity provider.',
  },
  {
    icon: FileCheck,
    title: 'Audit Logging',
    description: 'Complete audit trail for every agent interaction and data access.',
  },
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Built for global compliance. Data protection by design.',
  },
  {
    icon: Award,
    title: 'SOC2 / ISO 27001',
    description: 'Enterprise-grade security certifications as standard.',
  },
]

export function SecuritySection() {
  return (
    <section className="py-20 md:py-28 bg-enterprise-950 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-purple/5 blur-[120px] pointer-events-none" />

      <Container>
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-purple-400 mb-3">
            Enterprise Security
          </span>
          <h2 className="font-display text-display-md text-white mb-4">
            Security that enterprises demand
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-enterprise-400">
            Every agent on Orbyt meets enterprise security standards. No exceptions.
          </p>
        </AnimatedSection>

        {/* Security feature cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {securityFeatures.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group h-full rounded-2xl border border-enterprise-800 bg-enterprise-900/60 backdrop-blur-sm p-7 transition-all duration-300 hover:border-purple-800/60 hover:bg-enterprise-900/80">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4 transition-colors duration-300 group-hover:bg-purple-500/15">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-enterprise-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
