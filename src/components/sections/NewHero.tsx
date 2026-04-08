"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Button } from '@/components/ui/button'

export function NewHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#cbbcf7_0%,_#8d6cff_22%,_#241d9a_48%,_#120b4a_72%,_#05030f_100%)]" />
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
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            The AI Knowledge Hub
            <br />
            <span className="text-gradient-light italic">for Global Capability Centers</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-lg mx-auto text-lg md:text-xl text-white/60 mb-10 leading-relaxed"
          >
            Agents, frameworks, playbooks, and research — everything your GCC needs to navigate the AI transformation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/directory">
              <Button size="lg" className="shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all font-semibold text-white">
                Explore Agent Marketplace
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="#knowledge-hub">
              <Button
                size="lg"
                variant="ghost"
                className="border border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 bg-transparent"
              >
                Browse Knowledge Hub
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
