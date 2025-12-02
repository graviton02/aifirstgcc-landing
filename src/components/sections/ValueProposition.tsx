import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Bot,
  BookOpen,
  Workflow,
  Route,
  FileCode,
  BarChart3,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const features = [
  {
    icon: Bot,
    title: 'AI Agent Marketplace',
    description: 'Discover and deploy enterprise-ready AI agents',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: BookOpen,
    title: 'Playbooks & Frameworks',
    description: 'Proven methodologies for AI transformation',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    shadowColor: 'rgba(6, 182, 212, 0.3)',
  },
  {
    icon: Workflow,
    title: 'Operating Models',
    description: 'Blueprints for AI-enabled operations',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    shadowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: Route,
    title: 'AI Roadmaps',
    description: 'Strategic paths to AI maturity',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    icon: FileCode,
    title: 'Implementation Templates',
    description: 'Ready-to-use AI project templates',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    shadowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: BarChart3,
    title: 'Research & Benchmarks',
    description: 'Data-driven insights and comparisons',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    shadowColor: 'rgba(99, 102, 241, 0.3)',
  },
]

export function ValueProposition() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="value" className="section-padding relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30" />

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-100/30 to-fuchsia-100/30 rounded-full blur-3xl" />

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
            A curated collection of tools, frameworks, and insights to accelerate your AI transformation journey.
          </p>
        </AnimatedSection>

        {/* 3D Card Stack Container */}
        <div
          ref={containerRef}
          className="relative perspective-1000 py-8"
        >
          {/* Desktop: Fanned card layout */}
          <div className="hidden md:flex justify-center items-center gap-4 lg:gap-6">
            {features.map((feature, index) => {
              const isHovered = hoveredIndex === index
              const totalCards = features.length
              const middleIndex = (totalCards - 1) / 2
              const offsetFromCenter = index - middleIndex

              // Calculate rotation for fan effect
              const baseRotation = offsetFromCenter * 3
              const baseTranslateY = Math.abs(offsetFromCenter) * 8

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                    y: 100,
                    rotateX: -20,
                    scale: 0.8
                  }}
                  animate={isInView ? {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    scale: 1
                  } : {}}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="preserve-3d"
                  style={{
                    zIndex: isHovered ? 50 : totalCards - Math.abs(offsetFromCenter),
                  }}
                >
                  <motion.div
                    animate={{
                      rotateZ: isHovered ? 0 : baseRotation,
                      y: isHovered ? -20 : baseTranslateY,
                      scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="relative cursor-pointer"
                  >
                    {/* Card shadow layer */}
                    <div
                      className="absolute inset-0 rounded-3xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${feature.shadowColor}, transparent)`,
                        filter: 'blur(30px)',
                        opacity: isHovered ? 0.8 : 0.4,
                        transform: 'translateY(10px)',
                      }}
                    />

                    {/* Main card */}
                    <div
                      className={`relative card-glass noise-texture rounded-3xl p-6 w-[200px] lg:w-[220px] transition-all duration-300 ${
                        isHovered ? 'bg-white' : ''
                      }`}
                      style={{
                        boxShadow: isHovered
                          ? `0 25px 50px -12px ${feature.shadowColor}, 0 0 0 1px rgba(255,255,255,0.8)`
                          : undefined,
                      }}
                    >
                      {/* Gradient accent bar */}
                      <div
                        className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${feature.gradient} opacity-80`}
                      />

                      {/* Icon */}
                      <motion.div
                        animate={{
                          scale: isHovered ? 1.1 : 1,
                          rotate: isHovered ? 5 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <feature.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </motion.div>

                      {/* Title */}
                      <h3 className="font-display text-base font-semibold text-enterprise-900 mb-2 leading-tight">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-enterprise-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>

                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile: Simple stacked grid */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="relative card-glass noise-texture rounded-2xl p-5"
              >
                {/* Gradient accent */}
                <div
                  className={`absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${feature.gradient} opacity-80`}
                />

                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-md`}
                >
                  <feature.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-sm font-semibold text-enterprise-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-enterprise-500 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </Container>
    </section>
  )
}
