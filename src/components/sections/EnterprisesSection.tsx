import { motion } from 'framer-motion'
import { GrainGradient } from '@paper-design/shaders-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const benefits = [
  {
    number: '01',
    title: 'Faster Access to Trusted Solutions',
    description: 'Discover curated, enterprise-ready solutions aligned to AI-first transformation priorities.',
  },
  {
    number: '02',
    title: 'Reduced Transformation Risk',
    description: 'All listed providers are positioned for production-grade deployment with governance and security frameworks.',
  },
  {
    number: '03',
    title: 'Accelerated AI-First Programs',
    description: 'Move faster from intent to impact using ready-to-deploy solution stacks and adoption frameworks.',
  },
  {
    number: '04',
    title: 'Structured Choice Across the GCC Lifecycle',
    description: 'Access relevant solutions across new GCC setup, modernization, and scale-up phases.',
  },
  {
    number: '05',
    title: 'Better ROI on Transformation Spend',
    description: 'Shift from fragmented pilots to framework-led, outcome-driven enterprise programs.',
  },
  {
    number: '06',
    title: 'Co-Creation With the Provider Ecosystem',
    description: 'Collaborate with curated providers to co-build use cases and run guided pilots.',
  },
  {
    number: '07',
    title: 'Future-Ready GCC Positioning',
    description: 'Position your GCC as an AI-first, platform-led transformation engine.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function EnterprisesSection() {
  return (
    <section id="enterprises" className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* GrainGradient Background - Purple tones for Enterprises */}
      <div className="absolute inset-0">
        <GrainGradient
          speed={1}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
          softness={0.5}
          intensity={0.5}
          noise={0.25}
          shape="corners"
          colors={['#4C1D95', '#7C3AED', '#5B21B6', '#6D28D9']}
          colorBack="#1a0a2e"
          className="w-full h-full"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
      </div>

      <Container className="relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-14 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-teal-200/90 tracking-widest uppercase mb-4"
          >
            For Enterprises & GCCs
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
          >
            What's in It for Enterprises & GCCs
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-white/70"
          >
            Transform your GCC into an AI-first powerhouse with curated solutions and proven frameworks.
          </motion.p>
        </AnimatedSection>

        {/* Cards Grid - First row 4 cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {benefits.slice(0, 4).map((benefit) => (
            <motion.div
              key={benefit.number}
              variants={cardVariants}
              className="group"
            >
              <div className="h-full flex flex-col justify-between p-6 rounded-2xl bg-black/30 backdrop-blur-md border border-white/[0.15] hover:bg-black/40 hover:border-white/[0.25] transition-all duration-400">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2 leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                <div className="mt-6">
                  <span className="text-2xl font-display font-bold text-white/30">
                    {benefit.number}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Second row - 3 cards centered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-w-4xl mx-auto"
        >
          {benefits.slice(4).map((benefit) => (
            <motion.div
              key={benefit.number}
              variants={cardVariants}
              className="group"
            >
              <div className="h-full flex flex-col justify-between p-6 rounded-2xl bg-black/30 backdrop-blur-md border border-white/[0.15] hover:bg-black/40 hover:border-white/[0.25] transition-all duration-400">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2 leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                <div className="mt-6">
                  <span className="text-2xl font-display font-bold text-white/30">
                    {benefit.number}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
