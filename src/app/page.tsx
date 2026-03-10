import { Hero } from "@/components/sections/Hero";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { SevenMandates } from "@/components/sections/SevenMandates";
import { EnterprisesSection } from "@/components/sections/EnterprisesSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { EarlyMemberBenefits } from "@/components/sections/EarlyMemberBenefits";
import { InterestCapture } from "@/components/sections/InterestCapture";
import { SocialProof } from "@/components/sections/SocialProof";
import { WhySection } from "@/components/sections/WhySection";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* Task 3.4 will add AgentSearchSection here */}
      <ValueProposition />
      <SevenMandates />
      <EnterprisesSection />
      <ProvidersSection />
      <EarlyMemberBenefits />
      <InterestCapture />
      <SocialProof />
      <WhySection />
      <Footer />
    </>
  );
}
