import { motion } from 'framer-motion'
import { Check, Crown, Gem, Rocket, Users, FileText, Compass, Star } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const benefits = [
  {
    icon: Rocket,
    title: 'Early access to the AI-First GCC Framework',
    description: 'Be first to implement our comprehensive methodology',
  },
  {
    icon: Users,
    title: 'Exclusive roundtables & virtual discussions',
    description: 'Connect with GCC leaders from Fortune 500 companies',
  },
  {
    icon: FileText,
    title: 'Priority access to research reports',
    description: 'AI benchmarks and industry insights before anyone else',
  },
  {
    icon: Gem,
    title: 'Free templates and readiness checklists',
    description: 'Ready-to-use tools to accelerate your AI journey',
  },
  {
    icon: Compass,
    title: 'Shape the direction of the platform',
    description: 'Your feedback directly influences what we build',
  },
  {
    icon: Star,
    title: 'Join the Founding Community',
    description: 'Exclusive network of AI-first GCC pioneers',
  },
]

export function EarlyMemberBenefits() {
  return (
    <section id="benefits" className="section-padding bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-enterprise-50/50 to-white" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-radial from-emerald-100/40 to-transparent blur-2xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-radial from-purple-100/40 to-transparent blur-2xl" />

      <Container className="relative">
        <AnimatedSection className="text-center mb-14">
          {/* Crown badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
          >
            <Crown className="w-8 h-8" />
          </motion.div>

          <h2 className="font-display text-display-sm sm:text-display-md text-enterprise-900 mb-4">
            What You'll Get as an
            <br />
            <span className="text-gradient">Early Member</span>
          </h2>
          <p className="text-enterprise-600 text-lg max-w-xl mx-auto">
            Exclusive benefits for those who join before launch
          </p>
        </AnimatedSection>

        {/* 2-column grid on desktop */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto" staggerDelay={0.08}>
          {benefits.map((benefit, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="group h-full flex items-start gap-4 p-5 rounded-2xl bg-white border border-enterprise-100 hover:border-emerald-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Icon container */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors duration-300">
                  <benefit.icon className="w-6 h-6 text-emerald-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={3} />
                    <h3 className="font-display font-semibold text-enterprise-900 text-sm md:text-base leading-tight">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-enterprise-600 text-sm leading-relaxed pl-6">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  )
}
