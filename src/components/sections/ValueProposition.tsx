import { motion } from 'framer-motion'
import {
  BookOpen,
  Workflow,
  Route,
  FileCode,
  BarChart3,
  Users,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const features = [
  {
    icon: BookOpen,
    title: 'Playbooks & Frameworks',
    description: 'Proven methodologies for AI transformation',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Workflow,
    title: 'Operating Models',
    description: 'Blueprints for AI-enabled operations',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: Route,
    title: 'AI Roadmaps',
    description: 'Strategic paths to AI maturity',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileCode,
    title: 'Implementation Templates',
    description: 'Ready-to-use AI project templates',
    gradient: 'from-indigo-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Research & Benchmarks',
    description: 'Data-driven insights and comparisons',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Users,
    title: 'Community Events',
    description: 'Roundtables and peer discussions',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
]

export function ValueProposition() {
  return (
    <section id="value" className="section-padding bg-enterprise-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-purple-200/30 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-blue-200/30 to-transparent blur-3xl" />

      <Container className="relative">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
            Why AI-First GCC?
          </span>
          <h2 className="font-display text-display-md md:text-display-lg text-enterprise-900 mb-6">
            The{' '}
            <span className="text-gradient">AI Core</span>
            {' '}of the Enterprise
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-enterprise-600 leading-relaxed">
            GCCs sit at the intersection of technology, talent, data, and operations,
            uniquely positioned to become the AI backbone of the enterprise.
            <br className="hidden md:block" />
            <span className="font-medium text-enterprise-800">
              AI-First GCC exists to help leaders reimagine this role.
            </span>
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mb-8">
          <p className="text-center text-enterprise-600 mb-12">
            The platform will bring together:
          </p>
        </AnimatedSection>

        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="group relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-400"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                <div className="relative">
                  {/* Icon container */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-enterprise-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-enterprise-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-200 rounded-tr-lg" />
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom accent line */}
        <AnimatedSection delay={0.6} className="mt-16">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-300" />
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-300" />
          </div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
