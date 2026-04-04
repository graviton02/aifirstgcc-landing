import { Hero } from "@/components/sections/Hero";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { SevenMandates } from "@/components/sections/SevenMandates";
import { EnterprisesSection } from "@/components/sections/EnterprisesSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { EarlyMemberBenefits } from "@/components/sections/EarlyMemberBenefits";
import { SocialProof } from "@/components/sections/SocialProof";
import { WhySection } from "@/components/sections/WhySection";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Orbys360",
  description:
    "Orbys360 is the AI-first GCC advisory platform — shaping the next generation of Global Capability Centers with strategy, frameworks, and intelligent workflows.",
  alternates: { canonical: "https://www.orbys360.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ValueProposition />
      <SevenMandates />
      <EnterprisesSection />
      <ProvidersSection />
      <EarlyMemberBenefits />
      <SocialProof />
      <WhySection />
      <Footer />
    </>
  );
}
