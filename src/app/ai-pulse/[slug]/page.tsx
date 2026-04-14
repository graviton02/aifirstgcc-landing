import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { AIPulseDetailClient } from "@/components/resource-pages/AIPulseDetailClient";
import { dailyBriefs as staticBriefs } from "@/data/aiPulseBriefs";
import { newsArticleJsonLd, breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getAllBriefSlugs(): Promise<string[]> {
  let convexSlugs: string[] = [];
  try {
    const results = await fetchQuery(api.aiPulse.listAllSlugs, {});
    convexSlugs = results.map((s: { slug: string }) => s.slug);
  } catch {
    // Convex unavailable during build
  }
  const staticSlugs = staticBriefs.map((b) => b.slug);
  const allSlugs = [...new Set([...convexSlugs, ...staticSlugs])];
  allSlugs.sort((a, b) => b.localeCompare(a));
  return allSlugs;
}

async function getBrief(slug: string) {
  try {
    const convexBrief = await fetchQuery(api.aiPulse.getBriefBySlug, { slug });
    if (convexBrief) return convexBrief;
  } catch {
    // Convex unavailable; fall through
  }
  return staticBriefs.find((b) => b.slug === slug) ?? null;
}

export async function generateStaticParams() {
  const slugs = await getAllBriefSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brief = await getBrief(slug);

  if (!brief) {
    return { title: "Brief Not Found | Orbys360" };
  }

  const headline = brief.editorHeadline ?? brief.topDevelopments[0].headline;
  const description = brief.topDevelopments
    .map((d: any) => d.headline)
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
  const brief = await getBrief(slug);

  if (!brief) {
    notFound();
  }

  const allSlugs = await getAllBriefSlugs();
  const slugIndex = allSlugs.indexOf(slug);
  const prevSlug = slugIndex < allSlugs.length - 1 ? allSlugs[slugIndex + 1] : null;
  const nextSlug = slugIndex > 0 ? allSlugs[slugIndex - 1] : null;

  const headline = brief.editorHeadline ?? brief.topDevelopments[0].headline;
  const description = brief.topDevelopments
    .map((d: any) => d.headline)
    .join(". ")
    .slice(0, 160);

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
        brief={brief as any}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
      />
      <Footer />
    </>
  );
}
