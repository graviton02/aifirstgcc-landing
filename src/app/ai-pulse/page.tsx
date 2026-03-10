import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "AI Pulse — Daily Briefs | Orbys360",
  description: "Stay updated with daily AI developments, trends, and insights for GCC leaders.",
};

export default function AIPulsePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">AI Pulse</h1>
        <p className="text-enterprise-600 mb-8">
          Daily briefs on AI developments shaping the future of Global Capability Centers.
        </p>
        <p className="text-enterprise-500">Content coming soon.</p>
      </main>
      <Footer />
    </>
  );
}
