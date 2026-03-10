import { OrbytHero } from '@/components/orbyt/OrbytHero'
import { WhatIsOrbyt } from '@/components/orbyt/WhatIsOrbyt'
import { HowItWorks } from '@/components/orbyt/HowItWorks'
import { WhyChooseOrbyt } from '@/components/orbyt/WhyChooseOrbyt'
import { CategoriesSection } from '@/components/orbyt/CategoriesSection'
import { SecuritySection } from '@/components/orbyt/SecuritySection'

export default function OrbytLanding() {
  return (
    <div className="overflow-hidden">
      <OrbytHero />
      <WhatIsOrbyt />
      <HowItWorks />
      <WhyChooseOrbyt />
      <CategoriesSection />
      <SecuritySection />
    </div>
  )
}
