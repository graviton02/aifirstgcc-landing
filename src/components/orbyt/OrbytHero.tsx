import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MeshGradient } from '@paper-design/shaders-react'
import { ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'

const FUNCTION_NAMES = [
  'Finance',
  'HR Operations',
  'IT Service Management',
  'Supply Chain',
  'Legal & Compliance',
  'Engineering',
]

export function OrbytHero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FUNCTION_NAMES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* MeshGradient Background — purple/violet tones */}
      <div className="absolute inset-0 z-0">
        <MeshGradient
          speed={0.5}
          scale={1.1}
          distortion={0.55}
          swirl={0.35}
          colors={['#7C3AED', '#4C1D95', '#8B5CF6', '#6D28D9']}
          className="w-full h-full"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-enterprise-950/40 via-enterprise-950/10 to-enterprise-950/70" />
      </div>

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Static decorative particles */}
      <div className="absolute top-1/4 left-[8%] w-2 h-2 bg-purple-300/50 rounded-full blur-[1px]" />
      <div className="absolute top-1/3 right-[12%] w-3 h-3 bg-violet-300/40 rounded-full blur-[2px]" />
      <div className="absolute bottom-1/4 left-[18%] w-1.5 h-1.5 bg-blue-200/50 rounded-full blur-[1px]" />
      <div className="absolute bottom-1/3 right-[22%] w-2 h-2 bg-purple-200/40 rounded-full blur-[1px]" />

      {/* Content */}
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
          >
            <Zap className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-white/90">Enterprise AI Agent Marketplace</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            The AI Agent Marketplace
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-blue-300">
              Built for Enterprise
            </span>
          </motion.h1>

          {/* Cycling function names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-6 h-12 flex items-center justify-center"
          >
            <span className="text-lg md:text-xl text-white/60 font-sans">
              Purpose-built agents for{' '}
            </span>
            <span className="relative inline-block ml-2 min-w-[220px] text-left">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-200"
                >
                  {FUNCTION_NAMES[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/75 mb-10 leading-relaxed"
          >
            Orbyt connects Global Capability Centers with vetted, production-ready AI agents.
            Browse by enterprise function, verify compliance, and deploy with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/marketplace">
              <Button
                size="lg"
                className="group min-w-[220px] bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl"
              >
                Explore the Marketplace
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup&role=provider">
              <Button
                size="lg"
                variant="secondary"
                className="group min-w-[220px] border border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
              >
                List Your Agent
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
