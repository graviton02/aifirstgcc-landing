import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "Orbyt — AI Agent Marketplace | Orbys360",
  description: "Explore the Orbyt marketplace for AI agents that transform business operations.",
};

export default function OrbytPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Orbyt</h1>
        <p className="text-enterprise-600">AI Agent Marketplace — content migration in progress.</p>
      </main>
      <Footer />
    </>
  );
}
