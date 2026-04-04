import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { AIPulseListingClient } from "@/components/resource-pages/AIPulseListingClient";

export const metadata = {
  title: "AI Pulse — Daily AI Briefs | Orbys360",
  description:
    "Daily briefings on agentic AI and enterprise automation. Stay current on the latest developments shaping AI-first Global Capability Centers.",
};

export default function AIPulsePage() {
  return (
    <>
      <Navbar />
      <AIPulseListingClient />
      <Footer />
    </>
  );
}
