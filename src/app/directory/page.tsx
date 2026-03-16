import { Suspense } from "react";
import type { Metadata } from "next";
import DirectoryContent from "@/components/directory/DirectoryContent";
import { directoryJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export const metadata: Metadata = {
  title: "AI Agent Directory | Orbys360",
  description:
    "Browse verified AI agents across industries and functions. Filter, compare, and find the right AI agent for your enterprise.",
  alternates: { canonical: `${BASE_URL}/directory` },
  openGraph: {
    title: "AI Agent Directory | Orbys360",
    description: "Browse verified AI agents across industries and functions.",
    url: `${BASE_URL}/directory`,
    type: "website",
    siteName: "Orbys360",
  },
  twitter: {
    card: "summary",
    title: "AI Agent Directory | Orbys360",
    description: "Browse verified AI agents across industries and functions.",
  },
};

export default function DirectoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directoryJsonLd()) }}
      />
      <Suspense>
        <DirectoryContent />
      </Suspense>
    </>
  );
}
