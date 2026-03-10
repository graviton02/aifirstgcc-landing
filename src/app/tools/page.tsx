import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata = {
  title: "Tools Hub | Orbys360",
  description: "AI tools and resources for GCC leaders.",
};

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Tools Hub</h1>
        <p className="text-enterprise-600">AI tools and resources — content migration in progress.</p>
      </main>
      <Footer />
    </>
  );
}
