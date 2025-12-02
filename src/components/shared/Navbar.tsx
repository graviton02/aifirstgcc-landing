import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from './Container'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-purple-500/5 border-b border-enterprise-200/50'
            : 'bg-transparent'
        }`}
      >
        <Container size="wide">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Logo mark */}
              <div className="relative w-9 h-9 md:w-10 md:h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-violet-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
                  <span className="font-display font-bold text-white text-sm md:text-base">AI</span>
                </div>
              </div>
              {/* Logo text */}
              <div className="flex flex-col">
                <span className={`font-display font-bold text-base md:text-lg leading-none transition-colors duration-300 ${
                  isScrolled ? 'text-enterprise-900' : 'text-white'
                }`}>
                  AI-First
                </span>
                <span className={`font-display font-semibold text-xs md:text-sm leading-none transition-colors duration-300 ${
                  isScrolled ? 'text-purple-600' : 'text-purple-300'
                }`}>
                  GCC
                </span>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink isScrolled={isScrolled} onClick={() => scrollToSection('value')}>
                Why AI-First
              </NavLink>
              <NavLink isScrolled={isScrolled} onClick={() => scrollToSection('mandates')}>
                7 Mandates
              </NavLink>
              <NavLink isScrolled={isScrolled} onClick={() => scrollToSection('benefits')}>
                Benefits
              </NavLink>
              <Button
                size="sm"
                onClick={() => scrollToSection('signup')}
                className="ml-2"
              >
                <Sparkles className="w-4 h-4" />
                Join Waitlist
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-enterprise-900 hover:bg-enterprise-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </Container>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-b border-enterprise-200 shadow-xl">
              <Container>
                <div className="py-4 space-y-2">
                  <MobileNavLink onClick={() => scrollToSection('value')}>
                    Why AI-First
                  </MobileNavLink>
                  <MobileNavLink onClick={() => scrollToSection('mandates')}>
                    7 Mandates
                  </MobileNavLink>
                  <MobileNavLink onClick={() => scrollToSection('benefits')}>
                    Benefits
                  </MobileNavLink>
                  <div className="pt-2">
                    <Button
                      onClick={() => scrollToSection('signup')}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4" />
                      Join Waitlist
                    </Button>
                  </div>
                </div>
              </Container>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({
  children,
  isScrolled,
  onClick,
}: {
  children: React.ReactNode
  isScrolled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors duration-300 group ${
        isScrolled ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
      }`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300`} />
    </button>
  )
}

function MobileNavLink({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 text-enterprise-700 font-medium rounded-lg hover:bg-enterprise-50 transition-colors"
    >
      {children}
    </button>
  )
}
