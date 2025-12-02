import { motion } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* MeshGradient Background */}
      <div className="absolute inset-0 z-0">
        <MeshGradient
          speed={0.66}
          scale={1}
          distortion={0.68}
          swirl={0.29}
          colors={['#B3A4E8', '#241D9A', '#B36FFF', '#9E4FD2']}
          className="w-full h-full"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-enterprise-950/30 via-transparent to-enterprise-950/60" />
      </div>

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-1/4 left-[10%] w-2 h-2 bg-white/30 rounded-full blur-[1px]"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/3 right-[15%] w-3 h-3 bg-purple-300/40 rounded-full blur-[2px]"
        animate={{
          y: [0, -30, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-[20%] w-1.5 h-1.5 bg-blue-200/50 rounded-full blur-[1px]"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

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
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-white/90">Coming Soon</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            The Future of Global
            <br />
            <span className="text-gradient-light">Capability Centers</span>
            <br />
            Is <span className="relative inline-block">
              AI-First
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10 leading-relaxed"
          >
            A global knowledge hub shaping the next generation of GCCs—where strategy,
            operating models, and intelligent workflows come together to build
            AI-enabled enterprises.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="group min-w-[220px] bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Early Access List
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

      </Container>
    </section>
  )
}
