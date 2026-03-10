import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "Provider Ecosystem | Orbys360",
  description: "Explore AI solution providers in the Orbys360 ecosystem.",
};

export default function ProvidersPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Provider Ecosystem</h1>
        <p className="text-enterprise-600 mb-8">
          Explore AI solution providers building the future of enterprise AI.
        </p>
        <Link href="/directory" className="text-primary hover:underline">
          Browse the full agent directory
        </Link>
      </main>
      <Footer />
    </>
  );
}
