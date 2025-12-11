import { motion } from 'framer-motion'
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
      {/* CSS Gradient Background - Purple tones for Providers */}
      <div className="absolute inset-0 bg-[#1a0a2e]">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 0% 0%, #7C3AED 0%, transparent 50%),
              radial-gradient(ellipse at 100% 0%, #A855F7 0%, transparent 50%),
              radial-gradient(ellipse at 100% 100%, #8B5CF6 0%, transparent 50%),
              radial-gradient(ellipse at 0% 100%, #9333EA 0%, transparent 50%)
            `,
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
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
