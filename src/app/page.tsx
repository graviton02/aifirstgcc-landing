import { NewHero } from "@/components/sections/NewHero";
import { KnowledgeHub } from "@/components/sections/KnowledgeHub";
import { FeaturedResearch } from "@/components/sections/FeaturedResearch";
import { Challenges } from "@/components/sections/Challenges";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ForProviders } from "@/components/sections/ForProviders";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <NewHero />
      <KnowledgeHub />
      <FeaturedResearch />
      <Challenges />
      <HowItWorks />
      <ForProviders />
      <Footer />
    </>
  );
}
