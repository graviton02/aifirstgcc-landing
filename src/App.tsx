import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/shared/Navbar'
import { FloatingCTA } from '@/components/shared/FloatingCTA'
import { Hero } from '@/components/sections/Hero'

// Lazy load below-fold sections for better initial load performance
const ValueProposition = lazy(() => import('@/components/sections/ValueProposition').then(m => ({ default: m.ValueProposition })))
const SevenMandates = lazy(() => import('@/components/sections/SevenMandates').then(m => ({ default: m.SevenMandates })))
const EnterprisesSection = lazy(() => import('@/components/sections/EnterprisesSection').then(m => ({ default: m.EnterprisesSection })))
const ProvidersSection = lazy(() => import('@/components/sections/ProvidersSection').then(m => ({ default: m.ProvidersSection })))
const EarlyMemberBenefits = lazy(() => import('@/components/sections/EarlyMemberBenefits').then(m => ({ default: m.EarlyMemberBenefits })))
const InterestCapture = lazy(() => import('@/components/sections/InterestCapture').then(m => ({ default: m.InterestCapture })))
const SocialProof = lazy(() => import('@/components/sections/SocialProof').then(m => ({ default: m.SocialProof })))
const WhySection = lazy(() => import('@/components/sections/WhySection').then(m => ({ default: m.WhySection })))
const Footer = lazy(() => import('@/components/sections/Footer').then(m => ({ default: m.Footer })))

// Lazy load AI Pulse pages
const AIPulseListing = lazy(() => import('@/components/pages/AIPulseListing').then(m => ({ default: m.AIPulseListing })))
const AIPulseDetail = lazy(() => import('@/components/pages/AIPulseDetail').then(m => ({ default: m.AIPulseDetail })))

// Minimal loading placeholder
function SectionLoader() {
  return <div className="min-h-[200px]" />
}

// Full page loader for route transitions
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function LandingPage() {
  return (
    <>
      <main className="overflow-hidden">
        <Hero />
        <Suspense fallback={<SectionLoader />}>
          <ValueProposition />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SevenMandates />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <EnterprisesSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ProvidersSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <EarlyMemberBenefits />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <InterestCapture />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SocialProof />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WhySection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </main>
      <FloatingCTA />
    </>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/ai-pulse"
          element={
            <Suspense fallback={<PageLoader />}>
              <AIPulseListing />
            </Suspense>
          }
        />
        <Route
          path="/ai-pulse/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <AIPulseDetail />
            </Suspense>
          }
        />
      </Routes>
    </>
  )
}

export default App
