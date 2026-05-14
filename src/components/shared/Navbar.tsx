"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles, Newspaper, Search, BookOpen, Wrench, Building2, Brain, ChevronDown, BriefcaseBusiness } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from './Container'

const HIDDEN_ROUTES = ['/onboarding', '/admin', '/auth']
const AUTH_NAV_ROUTES = [
  '/agents',
  '/categories',
  '/claim',
  '/companies',
  '/compare',
  '/dashboard',
  '/directory',
  '/gcc-dashboard',
  '/jobs',
  '/provider/setup',
  '/shortlist',
]

const NavbarAuthControls = dynamic(
  () => import('./NavbarAuthControls').then((mod) => mod.NavbarAuthControls),
  { ssr: false }
)

function shouldLoadAuthControls(pathname: string) {
  return AUTH_NAV_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false)
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === '/' || pathname === '/about'
  const isHiddenRoute = HIDDEN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  const hasScrolledBg = isScrolled || (!isLandingPage)
  const isResourcesPage = ['/ai-pulse', '/thought-leadership', '/tools', '/providers', '/thoughtbook'].some(r => pathname.startsWith(r))
  const isJobsPage = pathname.startsWith('/jobs')
  const loadAuthControls = shouldLoadAuthControls(pathname)

  const aboutItems = [
    { href: '/about', label: 'About Orbys360' },
    { href: '/about#value', label: 'Why Orbys360' },
    { href: '/about#enterprises', label: 'For Enterprises' },
    { href: '/about#providers', label: 'For Partners' },
    { href: '/about#benefits', label: 'Benefits' },
  ]

  const resourcesItems = [
    { href: '/ai-pulse', label: 'AI Pulse', icon: Newspaper },
    { href: '/thought-leadership', label: 'Thought Leadership', icon: BookOpen },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/providers', label: 'Provider Ecosystem', icon: Building2 },
    { href: '/thoughtbook', label: 'AI Agent Thoughtbook', icon: Brain },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Standalone flows manage their own layout and should not show the shared navbar.
  if (isHiddenRoute) return null

  return (
    <>
      <header
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
              <div className="flex items-center group">
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
                    AI Knowledge Hub for GCCs
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/directory"
                className={`relative text-sm font-medium transition-colors duration-300 group flex items-center gap-1.5 ${
                  hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                } ${pathname.startsWith('/directory') ? 'text-purple-600' : ''}`}
              >
                <Search className="w-4 h-4" />
                Agent Directory
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${pathname.startsWith('/directory') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              <Link
                href="/jobs"
                className={`relative text-sm font-medium transition-colors duration-300 group flex items-center gap-1.5 ${
                  hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                } ${isJobsPage ? 'text-purple-600' : ''}`}
              >
                <BriefcaseBusiness className="w-4 h-4" />
                Job Board
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${isJobsPage ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              {/* About Us dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsAboutOpen(true)}
                onMouseLeave={() => setIsAboutOpen(false)}
              >
                <button
                  onClick={() => setIsAboutOpen(!isAboutOpen)}
                  className={`relative text-sm font-medium transition-colors duration-300 group flex items-center gap-1 ${
                    hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  About Us
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </button>
                {isAboutOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-enterprise-200 shadow-xl overflow-hidden">
                    <div className="py-1.5">
                      {aboutItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsAboutOpen(false)}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-enterprise-700 hover:bg-enterprise-50 hover:text-enterprise-900 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                {isResourcesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-enterprise-200 shadow-xl overflow-hidden">
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
                  </div>
                )}
              </div>

              {loadAuthControls ? (
                <NavbarAuthControls
                  variant="desktop"
                  pathname={pathname}
                  hasScrolledBg={hasScrolledBg}
                />
              ) : isJobsPage ? (
                <StaticSignInLink pathname={pathname} hasScrolledBg={hasScrolledBg} />
              ) : (
                <StaticJoinLink />
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {loadAuthControls && (
                <NavbarAuthControls
                  variant="mobile-notification"
                  pathname={pathname}
                  hasScrolledBg={hasScrolledBg}
                />
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  hasScrolledBg
                    ? 'text-enterprise-900 hover:bg-enterprise-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 md:hidden">
          <div className="bg-white/95 backdrop-blur-xl border-b border-enterprise-200 shadow-xl">
            <Container>
              <div className="py-4 space-y-2">
                  <Link
                    href="/directory"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 font-medium rounded-lg hover:bg-enterprise-50 transition-colors ${
                      pathname.startsWith('/directory') ? 'text-purple-600 bg-purple-50' : 'text-enterprise-700'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    Agent Directory
                  </Link>

                  <Link
                    href="/jobs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 font-medium rounded-lg hover:bg-enterprise-50 transition-colors ${
                      isJobsPage ? 'text-purple-600 bg-purple-50' : 'text-enterprise-700'
                    }`}
                  >
                    <BriefcaseBusiness className="w-5 h-5" />
                    Job Board
                  </Link>

                  {/* Mobile About Us section */}
                  <div>
                    <button
                      onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 font-medium rounded-lg hover:bg-enterprise-50 transition-colors text-enterprise-700"
                    >
                      <span>About Us</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileAboutOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileAboutOpen && (
                      <div className="ml-4 space-y-0.5">
                        {aboutItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { setIsMobileMenuOpen(false); setIsMobileAboutOpen(false) }}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-enterprise-600 hover:bg-enterprise-50 hover:text-enterprise-700 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

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

                  <div className="pt-2">
                    {loadAuthControls ? (
                      <NavbarAuthControls
                        variant="mobile"
                        pathname={pathname}
                        hasScrolledBg={hasScrolledBg}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                      />
                    ) : isJobsPage ? (
                      <StaticSignInLink
                        pathname={pathname}
                        hasScrolledBg={true}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                        mobile
                      />
                    ) : (
                      <StaticJoinLink onNavigate={() => setIsMobileMenuOpen(false)} mobile />
                    )}
                  </div>
              </div>
            </Container>
          </div>
        </div>
      )}
    </>
  )
}

function StaticJoinLink({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void
  mobile?: boolean
}) {
  return (
    <Link href="/sign-up" onClick={onNavigate} className={mobile ? undefined : "ml-2"}>
      <Button size={mobile ? undefined : "sm"} className={mobile ? "w-full" : undefined}>
        <Sparkles className="w-4 h-4" />
        Join Now
      </Button>
    </Link>
  )
}

function StaticSignInLink({
  pathname,
  hasScrolledBg,
  onNavigate,
  mobile = false,
}: {
  pathname: string
  hasScrolledBg: boolean
  onNavigate?: () => void
  mobile?: boolean
}) {
  return (
    <Link
      href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
      onClick={onNavigate}
      className={
        mobile
          ? "block w-full px-4 py-3 text-center text-sm font-medium text-enterprise-700 rounded-lg hover:bg-enterprise-50"
          : `ml-2 text-sm font-medium transition-colors duration-300 ${
              hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
            }`
      }
    >
      Sign in
    </Link>
  )
}
