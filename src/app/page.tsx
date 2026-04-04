import { NewHero } from "@/components/sections/NewHero";
import { SearchAndFeatures } from "@/components/sections/SearchAndFeatures";
import { Challenges } from "@/components/sections/Challenges";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProofDark } from "@/components/sections/SocialProofDark";
import { ForProviders } from "@/components/sections/ForProviders";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <NewHero />
      <SearchAndFeatures />
      <Challenges />
      <HowItWorks />
      <SocialProofDark />
      <ForProviders />
      <Footer />
    </>
  );
}
