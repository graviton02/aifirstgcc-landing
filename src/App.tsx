import { lazy, Suspense } from 'react'
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

// Minimal loading placeholder
function SectionLoader() {
  return <div className="min-h-[200px]" />
}

function App() {
  return (
    <>
      <Navbar />
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

export default App
