"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MeshGradient } from '@paper-design/shaders-react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'

export function NewHero() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-enterprise-950/30 via-transparent to-enterprise-950/60" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative dots */}
      <div className="absolute top-1/4 left-[10%] w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
      <div className="absolute top-1/3 right-[15%] w-3 h-3 bg-purple-300/50 rounded-full blur-[2px]" />
      <div className="absolute bottom-1/3 left-[20%] w-1.5 h-1.5 bg-blue-200/60 rounded-full blur-[1px]" />

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
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/80 tracking-wide">500+ AI Agents Listed</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            Find the Right AI Agent
            <br />
            <span className="text-gradient-light italic">for Your Enterprise</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-white/60 mb-10 leading-relaxed"
          >
            The curated directory of AI agents built for Global Capability Centers. Search, compare, and connect with verified providers.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/directory">
              <Button
                size="lg"
                className="group min-w-[220px] bg-white text-enterprise-950 hover:bg-white/90 shadow-lg hover:shadow-xl"
              >
                Explore the Directory
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="secondary"
                className="group min-w-[180px] border border-white/20 bg-transparent text-white/75 hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
