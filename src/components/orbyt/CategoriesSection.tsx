import { motion } from 'framer-motion'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

const ROW_1 = [
  'Finance & Accounting',
  'Human Resources',
  'IT Service Management',
  'Supply Chain',
  'Legal & Compliance',
  'Customer Experience',
]

const ROW_2 = [
  'Engineering',
  'Data & Analytics',
  'Risk & Compliance',
  'Procurement',
  'Marketing',
  'Operations',
]

const ROW_3 = [
  'Sales',
  'Research & Development',
  'Quality Assurance',
  'Facilities Management',
]

function MarqueeRow({
  items,
  direction = 'left',
  duration = 30,
}: {
  items: string[]
  direction?: 'left' | 'right'
  duration?: number
}) {
  // Duplicate items enough times to fill the viewport and create seamless loop
  const duplicated = [...items, ...items, ...items, ...items]

  return (
    <div className="relative overflow-hidden py-2">
      {/* Fade masks on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-enterprise-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-enterprise-50 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-3 whitespace-nowrap"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            duration,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {duplicated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-enterprise-200 bg-white text-sm font-medium text-enterprise-700 whitespace-nowrap transition-colors hover:border-accent-purple/40 hover:text-accent-purple"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function CategoriesSection() {
  return (
    <section className="py-20 md:py-28 bg-enterprise-50">
      <Container size="wide">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-accent-purple mb-3">
            Enterprise Functions
          </span>
          <h2 className="font-display text-display-md text-enterprise-900 mb-4">
            Agents for every function
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-enterprise-600">
            Browse AI agents mapped to 16+ enterprise functions. Every category, every workflow, covered.
          </p>
        </AnimatedSection>
      </Container>

      {/* Full-width marquee rows */}
      <div className="space-y-3">
        <MarqueeRow items={ROW_1} direction="left" duration={35} />
        <MarqueeRow items={ROW_2} direction="right" duration={30} />
        <MarqueeRow items={ROW_3} direction="left" duration={25} />
      </div>
    </section>
  )
}
