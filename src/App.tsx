import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/shared/Navbar'
import { FloatingCTA } from '@/components/shared/FloatingCTA'
import { Hero } from '@/components/sections/Hero'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { OnboardingLayout } from '@/layouts/OnboardingLayout'
import { RequireProviderRole } from '@/auth/RequireProviderRole'
import { RequireGCCRole } from '@/auth/RequireGCCRole'
import { RequireProviderProfile } from '@/auth/RequireProviderProfile'

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

// Lazy load pages
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'))
const OrbytLanding = lazy(() => import('@/pages/marketing/OrbytLanding'))
const ProvidersPage = lazy(() => import('@/pages/marketing/ProvidersPage'))
const MarketplaceListing = lazy(() => import('@/pages/marketplace/MarketplaceListing'))
const AgentDetail = lazy(() => import('@/pages/marketplace/AgentDetail'))
const ThoughtLeadership = lazy(() => import('@/pages/content/ThoughtLeadership'))
const ThoughtLeadershipArticle = lazy(() => import('@/pages/content/ThoughtLeadershipArticle'))
const ToolsHub = lazy(() => import('@/pages/content/ToolsHub'))
const Benchmarks = lazy(() => import('@/pages/content/Benchmarks'))
const ProblemsListing = lazy(() => import('@/pages/content/ProblemsListing'))
const ProviderDetail = lazy(() => import('@/pages/marketing/ProviderDetail'))
const ProviderDashboard = lazy(() => import('@/pages/provider/ProviderDashboard'))
const ListAgent = lazy(() => import('@/pages/provider/ListAgent'))
const EditAgent = lazy(() => import('@/pages/provider/EditAgent'))
const CategorySelect = lazy(() => import('@/pages/provider/onboarding/CategorySelect'))
const BasicInfo = lazy(() => import('@/pages/provider/onboarding/BasicInfo'))
const DetailedForm = lazy(() => import('@/pages/provider/onboarding/DetailedForm'))
const GCCDashboard = lazy(() => import('@/pages/gcc/GCCDashboard'))
const SelfAssessment = lazy(() => import('@/pages/gcc/SelfAssessment'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))

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
    <Routes>
      {/* Landing page — standalone with its own Navbar */}
      <Route path="/" element={<><Navbar /><LandingPage /></>} />

      {/* Auth — minimal chrome, no Navbar */}
      <Route
        path="/auth"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        }
      />

      {/* Public pages — MarketingLayout (Navbar + Footer) */}
      <Route element={<MarketingLayout />}>
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
        <Route
          path="/orbyt"
          element={
            <Suspense fallback={<PageLoader />}>
              <OrbytLanding />
            </Suspense>
          }
        />
        <Route
          path="/marketplace"
          element={
            <Suspense fallback={<PageLoader />}>
              <MarketplaceListing />
            </Suspense>
          }
        />
        <Route
          path="/marketplace/agent/:agentId"
          element={
            <Suspense fallback={<PageLoader />}>
              <AgentDetail />
            </Suspense>
          }
        />
        <Route
          path="/providers"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProvidersPage />
            </Suspense>
          }
        />
        <Route
          path="/providers/:providerId"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProviderDetail />
            </Suspense>
          }
        />
        <Route
          path="/problems"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProblemsListing />
            </Suspense>
          }
        />
        <Route
          path="/thought-leadership"
          element={
            <Suspense fallback={<PageLoader />}>
              <ThoughtLeadership />
            </Suspense>
          }
        />
        <Route
          path="/thought-leadership/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <ThoughtLeadershipArticle />
            </Suspense>
          }
        />
        <Route
          path="/tools"
          element={
            <Suspense fallback={<PageLoader />}>
              <ToolsHub />
            </Suspense>
          }
        />
        <Route
          path="/benchmarks"
          element={
            <Suspense fallback={<PageLoader />}>
              <Benchmarks />
            </Suspense>
          }
        />
      </Route>

      {/* Provider onboarding — OnboardingLayout + RequireProviderRole */}
      <Route
        element={
          <RequireProviderRole>
            <OnboardingLayout />
          </RequireProviderRole>
        }
      >
        <Route
          path="/onboarding/category"
          element={
            <Suspense fallback={<PageLoader />}>
              <CategorySelect />
            </Suspense>
          }
        />
        <Route
          path="/onboarding/basics"
          element={
            <Suspense fallback={<PageLoader />}>
              <BasicInfo />
            </Suspense>
          }
        />
        <Route
          path="/onboarding/form"
          element={
            <Suspense fallback={<PageLoader />}>
              <DetailedForm />
            </Suspense>
          }
        />
      </Route>

      {/* Provider dashboard — AppLayout + RequireProviderRole */}
      <Route
        element={
          <RequireProviderRole>
            <AppLayout />
          </RequireProviderRole>
        }
      >
        <Route
          path="/provider"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProviderDashboard />
            </Suspense>
          }
        />
        <Route
          path="/list-your-agent"
          element={
            <Suspense fallback={<PageLoader />}>
              <RequireProviderProfile requireApproved>
                <ListAgent />
              </RequireProviderProfile>
            </Suspense>
          }
        />
        <Route
          path="/provider/agents/:agentId/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <RequireProviderProfile requireApproved>
                <EditAgent />
              </RequireProviderProfile>
            </Suspense>
          }
        />
      </Route>

      {/* GCC dashboard — AppLayout + RequireGCCRole */}
      <Route
        element={
          <RequireGCCRole>
            <AppLayout />
          </RequireGCCRole>
        }
      >
        <Route
          path="/gcc-dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <GCCDashboard />
            </Suspense>
          }
        />
        <Route
          path="/self-assessment"
          element={
            <Suspense fallback={<PageLoader />}>
              <SelfAssessment />
            </Suspense>
          }
        />
      </Route>

      {/* Admin — standalone, no Clerk auth */}
      <Route
        path="/o360"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default App
