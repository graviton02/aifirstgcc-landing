import { Suspense } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ProvidersPageClient } from "@/components/resource-pages/ProvidersPageClient";

export const metadata = {
  title: "AI Provider Ecosystem | Orbys360",
  description:
    "Explore the curated network of technology service providers, AI specialists, and consulting firms driving AI-first GCC transformation.",
  alternates: {
    canonical: "/providers",
  },
};

export default function ProvidersPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <ProvidersPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
