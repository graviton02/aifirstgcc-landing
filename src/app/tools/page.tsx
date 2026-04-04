import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ToolsHubClient } from "@/components/resource-pages/ToolsHubClient";

export const metadata = {
  title: "AI Tools for GCCs | Orbys360",
  description:
    "Practical frameworks and templates for GCC leaders driving AI-first transformation. Self-assessment, business case development, and more.",
};

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <ToolsHubClient />
      <Footer />
    </>
  );
}
