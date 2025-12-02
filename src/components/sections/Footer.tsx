import { motion } from 'framer-motion'
import { Container } from '@/components/shared/Container'

export function Footer() {
  return (
    <footer className="py-12 bg-enterprise-950 relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          {/* Logo/Brand */}
          <div className="mb-6">
            <span className="font-display text-xl font-bold text-white">
              AI-First <span className="text-gradient-light">GCC</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-white/70 text-sm max-w-md mx-auto mb-8">
            A global knowledge initiative to shape the future of Global Capability Centers.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px w-8 bg-enterprise-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
            <div className="h-px w-8 bg-enterprise-700" />
          </div>

          {/* Copyright */}
          <div className="space-y-2">
            <p className="text-white/60 text-sm">
              © 2026 AI-First GCC. All rights reserved.
            </p>
            <p className="text-white/50 text-xs">
              Launching soon.
            </p>
          </div>
        </motion.div>
      </Container>
    </footer>
  )
}
