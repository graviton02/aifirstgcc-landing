"use client"

import { motion } from 'framer-motion'
import { FlutedGlass } from '@paper-design/shaders-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const benefits = [
  {
    number: '01',
    title: 'Direct Access to Buyers',
    description: 'Engage directly with GCC Heads and Transformation Leaders who are actively funding AI-first programs.',
  },
  {
    number: '02',
    title: 'Enterprise Credibility by Default',
    description: 'All providers are curated and positioned for production-grade deployment with real enterprise outcomes.',
  },
  {
    number: '03',
    title: 'Faster Go-To-Market',
    description: 'Accelerate from discovery to production by reducing sales cycles, pilots, and customization overhead.',
  },
  {
    number: '04',
    title: 'Structured Demand Across the GCC Lifecycle',
    description: 'Your offering is visible across new GCC setups, modernization programs, and productivity transformations.',
  },
  {
    number: '05',
    title: 'From Custom Projects to Repeatable Revenue',
    description: 'Convert bespoke work into standardized enterprise use cases and scalable solution bundles.',
  },
  {
    number: '06',
    title: 'Co-Creation With Live Enterprise Programs',
    description: 'Selected partners co-design with active GCCs and build real production references.',
  },
  {
    number: '07',
    title: 'Positioning for the AI-First Enterprise',
    description: 'Your brand is aligned with AI-first operating models and next-generation shared services.',
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

export function ProvidersSection() {
  return (
    <section id="providers" className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* FlutedGlass shader background */}
      <div className="absolute inset-0">
        <FlutedGlass
          size={0.5}
          shape="wave"
          angle={0}
          distortionShape="lens"
          distortion={0.5}
          shift={0}
          blur={0}
          edges={0}
          stretch={0}
          image="https://workers.paper.design/file-assets/01KH9JD322HQFK1KE4YGW4GNAT/01KH9JJHZ34GAY6YYZVV7KB90E.webp"
          scale={1.3}
          fit="cover"
          highlights={0.1}
          shadows={0.25}
          colorBack="#00000000"
          colorHighlight="#FFFFFF"
          colorShadow="#000000"
          className="w-full h-full"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <Container className="relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-14 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-purple-200/90 tracking-widest uppercase mb-4"
          >
            For Service & Solution Providers
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5"
          >
            Why Providers Should List
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-white/70"
          >
            Connect with enterprise buyers, build credibility, and scale your AI solutions across the GCC ecosystem.
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
