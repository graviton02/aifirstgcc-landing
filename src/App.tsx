import { Navbar } from '@/components/shared/Navbar'
import { FloatingCTA } from '@/components/shared/FloatingCTA'
import { Hero } from '@/components/sections/Hero'
import { ValueProposition } from '@/components/sections/ValueProposition'
import { SevenMandates } from '@/components/sections/SevenMandates'
import { EnterprisesSection } from '@/components/sections/EnterprisesSection'
import { ProvidersSection } from '@/components/sections/ProvidersSection'
import { EarlyMemberBenefits } from '@/components/sections/EarlyMemberBenefits'
import { InterestCapture } from '@/components/sections/InterestCapture'
import { SocialProof } from '@/components/sections/SocialProof'
import { WhySection } from '@/components/sections/WhySection'
import { Footer } from '@/components/sections/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Hero />
        <ValueProposition />
        <SevenMandates />
        <EnterprisesSection />
        <ProvidersSection />
        <EarlyMemberBenefits />
        <InterestCapture />
        <SocialProof />
        <WhySection />
        <Footer />
      </main>
      <FloatingCTA />
    </>
  )
}

export default App
