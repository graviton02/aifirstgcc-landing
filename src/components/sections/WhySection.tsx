import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'

export function WhySection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-enterprise-900 via-purple-950 to-indigo-950" />

      {/* Animated gradient mesh */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <Container size="narrow" className="relative">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-300 bg-purple-500/20 rounded-full border border-purple-400/30">
              Our Mission
            </span>
            <h2 className="font-display text-display-sm sm:text-display-md text-white">
              Why We're Building
              <br />
              <span className="text-gradient-light">Orbis360</span>
            </h2>
          </div>

          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
              {/* Quote icon */}
              <div className="absolute -top-5 left-8 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <Quote className="w-5 h-5" />
              </div>

              {/* Quote text */}
              <blockquote className="relative">
                <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 italic">
                  "After working with global enterprises we've seen a clear shift:
                  <span className="text-purple-300 font-medium">
                    {' '}GCCs are no longer support centers—they are becoming the AI backbone of the enterprise.
                  </span>
                </p>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                  This platform is designed to accelerate that transformation, responsibly and at scale."
                </p>

                {/* Attribution */}
                <footer className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-purple-300/80 font-medium">— Founding Team</p>
                </footer>
              </blockquote>

              {/* Decorative corner accents */}
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-400/30 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-400/30 rounded-bl-xl" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-xl scale-105" />
          </motion.div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
