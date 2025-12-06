import { motion } from 'framer-motion'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

// Feature illustrations (transparent PNGs)
const agentMarketplaceImg = '/images/icons/agent-marketplace.png'
const playbooksImg = '/images/icons/playbooks-frameworks.png'
const operatingModelsImg = '/images/icons/operating-models.png'
const aiRoadmapsImg = '/images/icons/ai-roadmaps.png'
const templatesImg = '/images/icons/implementation-templates.png'
const researchImg = '/images/icons/research-benchmarks.png'

const features = [
  {
    title: 'Agent Marketplace',
    subtitle: 'Ready-to-deploy AI Agents designed for GCC use cases.',
    image: agentMarketplaceImg,
  },
  {
    title: 'Playbooks & Frameworks',
    subtitle: 'Proven methodologies for AI transformation.',
    image: playbooksImg,
  },
  {
    title: 'Operating Models',
    subtitle: 'Blueprints for AI-enabled operations.',
    image: operatingModelsImg,
  },
  {
    title: 'AI Roadmaps',
    subtitle: 'Strategic paths to AI maturity.',
    image: aiRoadmapsImg,
  },
  {
    title: 'Implementation Templates',
    subtitle: 'Ready-to-use AI project templates.',
    image: templatesImg,
  },
  {
    title: 'Research & Benchmarks',
    subtitle: 'Data-driven insights and comparisons.',
    image: researchImg,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative"
    >
      <div className="relative h-full rounded-2xl bg-white border border-enterprise-200/60 overflow-hidden transition-all duration-500 ease-out hover:border-enterprise-300/80 hover:shadow-xl hover:shadow-enterprise-900/5">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section */}
          <div className="relative sm:w-2/5 p-6 flex items-center justify-center">
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full max-w-[180px] h-auto object-contain"
            />
          </div>

          {/* Content Section */}
          <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col justify-center">
            {/* Title */}
            <h3 className="font-display text-xl sm:text-2xl font-bold text-enterprise-900 mb-3">
              {feature.title}
            </h3>

            {/* Subtitle */}
            <p className="text-enterprise-600 text-base leading-relaxed">
              {feature.subtitle}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ValueProposition() {
  return (
    <section id="value" className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30" />

      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative blurred shapes */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <Container className="relative">
        {/* Header */}
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-8 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/80"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Why Orbis360?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-enterprise-900 mb-6 tracking-tight"
          >
            The{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                AI Core
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200/60 via-purple-200/60 to-violet-200/60 rounded-full -z-0"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            {' '}of the Enterprise
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-enterprise-600 leading-relaxed"
          >
            A curated collection of tools, frameworks, and insights to accelerate your AI transformation journey.
          </motion.p>
        </AnimatedSection>

        {/* Features Grid - 2 columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>

      </Container>
    </section>
  )
}
