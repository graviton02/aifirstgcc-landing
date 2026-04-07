import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { AIPulseDetailClient } from "@/components/resource-pages/AIPulseDetailClient";
import { dailyBriefs } from "@/data/aiPulseBriefs";
import { newsArticleJsonLd, breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return dailyBriefs.map((brief) => ({ slug: brief.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brief = dailyBriefs.find((b) => b.slug === slug);

  if (!brief) {
    return { title: "Brief Not Found | Orbys360" };
  }

  const headline = brief.editorHeadline ?? brief.topDevelopments[0].headline;
  const description = brief.topDevelopments
    .map((d) => d.headline)
    .join(". ")
    .slice(0, 160);
  const url = `${BASE_URL}/ai-pulse/${slug}`;

  return {
    title: `${headline} | Orbys360 AI Pulse`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: headline,
      description,
      url,
      type: "article",
      siteName: "Orbys360",
      publishedTime: brief.date,
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description,
    },
  };
}

export default async function AIPulseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const briefIndex = dailyBriefs.findIndex((b) => b.slug === slug);

  if (briefIndex === -1) {
    notFound();
  }

  const brief = dailyBriefs[briefIndex];
  const headline = brief.editorHeadline ?? brief.topDevelopments[0].headline;
  const description = brief.topDevelopments
    .map((d) => d.headline)
    .join(". ")
    .slice(0, 160);

  const prevBrief =
    briefIndex < dailyBriefs.length - 1 ? dailyBriefs[briefIndex + 1] : null;
  const nextBrief = briefIndex > 0 ? dailyBriefs[briefIndex - 1] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            newsArticleJsonLd({
              title: headline,
              description,
              url: `/ai-pulse/${brief.slug}`,
              datePublished: brief.date,
            }),
            breadcrumbJsonLd([
              { name: "Home", url: BASE_URL },
              { name: "AI Pulse", url: `${BASE_URL}/ai-pulse` },
              { name: headline, url: `${BASE_URL}/ai-pulse/${brief.slug}` },
            ]),
          ]),
        }}
      />
      <Navbar />
      <AIPulseDetailClient
        brief={brief}
        prevSlug={prevBrief?.slug ?? null}
        nextSlug={nextBrief?.slug ?? null}
      />
      <Footer />
    </>
  );
}
