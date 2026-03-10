import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "Thought Leadership | Orbys360",
  description: "Insights and analysis on AI-first Global Capability Centers.",
};

export default function ThoughtLeadershipPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Thought Leadership</h1>
        <p className="text-enterprise-600">Articles and insights — content migration in progress.</p>
      </main>
      <Footer />
    </>
  );
}
