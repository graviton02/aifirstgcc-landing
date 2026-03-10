import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "Benchmarks | Orbys360",
  description: "AI agent benchmarks and performance comparisons.",
};

export default function BenchmarksPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Benchmarks</h1>
        <p className="text-enterprise-600">AI agent benchmarks — content migration in progress.</p>
      </main>
      <Footer />
    </>
  );
}
