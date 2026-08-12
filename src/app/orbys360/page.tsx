import type { Metadata } from "next";
import { NewHero } from "@/components/sections/NewHero";
import { KnowledgeHub } from "@/components/sections/KnowledgeHub";
import { FeaturedResearch } from "@/components/sections/FeaturedResearch";
import { Challenges } from "@/components/sections/Challenges";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ForProviders } from "@/components/sections/ForProviders";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Orbys360 | AI Knowledge Base for GCCs",
  description:
    "Research, frameworks, playbooks and AI intelligence for global capability center leaders.",
};

export default function Orbys360HomePage() {
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
