"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, Linkedin, Newspaper, Search, LayoutDashboard, BookOpen, Wrench, Building2, Lightbulb, ChevronDown } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useUserRole } from '@/auth/useUserRole'
import { Container } from './Container'

const APP_ROUTES = ['/provider', '/gcc-dashboard', '/onboarding', '/admin', '/auth']

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { role } = useUserRole()

  const isLandingPage = pathname === '/'
  const isAppPage = APP_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  const hasScrolledBg = isScrolled || (!isLandingPage)
  const isResourcesPage = ['/ai-pulse', '/thought-leadership', '/tools', '/providers', '/problems'].some(r => pathname.startsWith(r))

  const resourcesItems = [
    { href: '/ai-pulse', label: 'AI Pulse', icon: Newspaper },
    { href: '/thought-leadership', label: 'Thought Leadership', icon: BookOpen },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/providers', label: 'Provider Ecosystem', icon: Building2 },
    { href: '/problems', label: 'Problem Statements', icon: Lightbulb },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // On app pages (dashboard, onboarding, admin, auth), don't render Navbar
  if (isAppPage) return null

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false)
    if (isLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
  }

  const dashboardPath = role === 'gcc' ? '/gcc-dashboard' : '/provider'

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          hasScrolledBg
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-purple-500/5 border-b border-enterprise-200/50'
            : 'bg-transparent'
        }`}
      >
        <Container size="wide">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src="/aifirstgcclogo.svg"
                  alt="AI-First GCC logo"
                  className={`h-10 w-auto md:h-12 transition-all duration-500 ${
                    hasScrolledBg ? '' : 'brightness-0 invert'
                  }`}
                />
                <div className="ml-3 flex flex-col">
                  <span
                    className={`text-xl md:text-2xl font-display font-bold tracking-tight transition-colors duration-500 leading-none ${
                      hasScrolledBg ? 'text-enterprise-900' : 'text-white'
                    }`}
                  >
                    Orbys360
                  </span>
                  <span
                    className={`text-[10px] md:text-xs font-medium tracking-wide transition-colors duration-500 ${
                      hasScrolledBg ? 'text-enterprise-600' : 'text-white/70'
                    }`}
                  >
                    The AI-First GCC Platform
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink isScrolled={hasScrolledBg} onClick={() => scrollToSection('value')}>
                Why Orbys360
              </NavLink>
              <NavLink isScrolled={hasScrolledBg} onClick={() => scrollToSection('enterprises')}>
                For Enterprises
              </NavLink>
              <NavLink isScrolled={hasScrolledBg} onClick={() => scrollToSection('providers')}>
                For Partners
              </NavLink>
              <NavLink isScrolled={hasScrolledBg} onClick={() => scrollToSection('benefits')}>
                Benefits
              </NavLink>
              <Link
                href="/directory"
                className={`relative text-sm font-medium transition-colors duration-300 group flex items-center gap-1.5 ${
                  hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                } ${pathname.startsWith('/directory') ? 'text-purple-600' : ''}`}
              >
                <Search className="w-4 h-4" />
                Directory
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${pathname.startsWith('/directory') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              {/* Resources dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  className={`relative text-sm font-medium transition-colors duration-300 group flex items-center gap-1 ${
                    hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                  } ${isResourcesPage ? 'text-purple-600' : ''}`}
                >
                  Resources
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${isResourcesPage ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </button>
                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-enterprise-200 shadow-xl overflow-hidden"
                    >
                      <div className="py-1.5">
                        {resourcesItems.map((item) => {
                          const isActive = pathname.startsWith(item.href)
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsResourcesOpen(false)}
                              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                isActive
                                  ? 'text-purple-600 bg-purple-50'
                                  : 'text-enterprise-700 hover:bg-enterprise-50 hover:text-enterprise-900'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="https://www.linkedin.com/company/orbys360/"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  hasScrolledBg
                    ? 'text-enterprise-600 hover:text-enterprise-900 hover:bg-enterprise-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              {/* Auth-aware CTA */}
              {!isAuthLoaded ? (
                // Prevent flash — render nothing while Clerk loads
                <div className="w-24" />
              ) : isSignedIn ? (
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    href={dashboardPath}
                    className={`text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                      hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                      },
                    }}
                  />
                </div>
              ) : (
                <Link href="/sign-up" className="ml-2">
                  <Button size="sm">
                    <Sparkles className="w-4 h-4" />
                    Join Now
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                hasScrolledBg
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
                    Why Orbys360
                  </MobileNavLink>
                  <MobileNavLink onClick={() => scrollToSection('enterprises')}>
                    For Enterprises
                  </MobileNavLink>
                  <MobileNavLink onClick={() => scrollToSection('providers')}>
                    For Partners
                  </MobileNavLink>
                  <MobileNavLink onClick={() => scrollToSection('benefits')}>
                    Benefits
                  </MobileNavLink>
                  <Link
                    href="/directory"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 font-medium rounded-lg hover:bg-enterprise-50 transition-colors ${
                      pathname.startsWith('/directory') ? 'text-purple-600 bg-purple-50' : 'text-enterprise-700'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    Directory
                  </Link>

                  {/* Mobile Resources section */}
                  <div>
                    <button
                      onClick={() => setIsMobileResourcesOpen(!isMobileResourcesOpen)}
                      className={`flex items-center justify-between w-full px-4 py-3 font-medium rounded-lg hover:bg-enterprise-50 transition-colors ${
                        isResourcesPage ? 'text-purple-600' : 'text-enterprise-700'
                      }`}
                    >
                      <span>Resources</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileResourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileResourcesOpen && (
                      <div className="ml-4 space-y-0.5">
                        {resourcesItems.map((item) => {
                          const isActive = pathname.startsWith(item.href)
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => { setIsMobileMenuOpen(false); setIsMobileResourcesOpen(false) }}
                              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                isActive ? 'text-purple-600 bg-purple-50' : 'text-enterprise-600 hover:bg-enterprise-50 hover:text-enterprise-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <a
                    href="https://www.linkedin.com/company/orbys360/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 text-enterprise-700 font-medium rounded-lg hover:bg-enterprise-50 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    Follow on LinkedIn
                  </a>

                  {/* Auth-aware mobile CTA */}
                  {isAuthLoaded && (
                    <div className="pt-2">
                      {isSignedIn ? (
                        <div className="flex items-center justify-between px-4 py-3">
                          <Link
                            href={dashboardPath}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-enterprise-700 font-medium"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Link>
                          <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox: 'w-8 h-8',
                              },
                            }}
                          />
                        </div>
                      ) : (
                        <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">
                            <Sparkles className="w-4 h-4" />
                            Join Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
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
