import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ProviderDetailClient } from "@/components/resource-pages/ProviderDetailClient";
import { providerData } from "@/data/providerDirectoryData";
import { breadcrumbJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export function generateStaticParams() {
  return providerData.map((p) => ({ providerId: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { providerId } = await params;
  const provider = providerData.find((p) => p.id === providerId);

  if (!provider) {
    return { title: "Provider Not Found | Orbys360" };
  }

  const title = `${provider.name} - AI Provider | Orbys360`;
  const description = provider.tagline.slice(0, 160);
  const url = `${BASE_URL}/providers/${providerId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Orbys360",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ProviderDetailPage({ params }: PageProps) {
  const { providerId } = await params;
  const provider = providerData.find((p) => p.id === providerId);

  if (!provider) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", url: BASE_URL },
    { name: "Provider Ecosystem", url: `${BASE_URL}/providers` },
    { name: provider.name, url: `${BASE_URL}/providers/${providerId}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      <Navbar />
      <ProviderDetailClient provider={provider} />
      <Footer />
    </>
  );
}
