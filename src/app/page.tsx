import { NewHero } from "@/components/sections/NewHero";
import { SearchAndFeatures } from "@/components/sections/SearchAndFeatures";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProofDark } from "@/components/sections/SocialProofDark";
import { ForProviders } from "@/components/sections/ForProviders";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <NewHero />
      <SearchAndFeatures />
      <ProblemSection />
      <HowItWorks />
      <SocialProofDark />
      <ForProviders />
      <FinalCTA />
      <Footer />
    </>
  );
}
