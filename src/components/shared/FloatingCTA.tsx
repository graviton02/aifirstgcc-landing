import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Zap } from 'lucide-react'

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling past hero
      setIsVisible(window.scrollY > 600)
      // Show scroll to top after significant scroll
      setShowScrollTop(window.scrollY > 2000)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
        >
          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                onClick={scrollToTop}
                className="w-12 h-12 rounded-full bg-white shadow-lg shadow-enterprise-900/10 border border-enterprise-200 flex items-center justify-center text-enterprise-600 hover:text-enterprise-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Main CTA button */}
          <motion.button
            onClick={scrollToSignup}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            {/* Static glow ring - reduced from animated for performance */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-50" />

            {/* Button */}
            <div className="relative flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow duration-300">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Join Waitlist</span>

              {/* Pulse dot */}
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
