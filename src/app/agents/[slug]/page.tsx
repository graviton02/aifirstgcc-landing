import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/shared/Navbar";
import { AgentHero } from "@/components/agent-detail/AgentHero";
import { AgentDetailSections } from "@/components/agent-detail/AgentDetailSections";
import { AgentStatsPanel } from "@/components/agent-detail/AgentStatsPanel";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Footer } from "@/components/sections/Footer";
import { CompareTray } from "@/components/compare/CompareTray";
import { agentJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchQuery(api.agents.listAllSlugs, {});
    return slugs.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });

  if (!agent) {
    return { title: "Agent Not Found | Orbys360" };
  }

  const company = agent.company_id
    ? await fetchQuery(api.companies.getById, { id: agent.company_id })
    : null;

  const title = `${agent.agent_name}${company ? ` by ${company.name}` : ""} | Orbys360`;
  const description = agent.tagline || agent.description.slice(0, 160);
  const url = `${BASE_URL}/agents/${slug}`;

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

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });

  if (!agent) {
    notFound();
  }

  const company = agent.company_id
    ? await fetchQuery(api.companies.getById, { id: agent.company_id })
    : null;

  const breadcrumbItems = [
    { name: "Home", url: BASE_URL },
    { name: "Directory", url: `${BASE_URL}/directory` },
    ...(agent.category ? [{ name: agent.category, url: `${BASE_URL}/categories/${agent.category.toLowerCase().replace(/[&\s]+/g, "-").replace(/[^a-z0-9-]/g, "")}` }] : []),
    { name: agent.agent_name, url: `${BASE_URL}/agents/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(agentJsonLd(
            agent as any,
            company ? { name: company.name, slug: company.slug, website: company.website } : undefined
          )),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      <Navbar />
      <main className="min-h-[100dvh] bg-white relative">
        <div
          className="absolute inset-x-0 top-0 bg-enterprise-50/30 pointer-events-none"
          style={{ height: "clamp(500px, 60vh, 700px)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 text-sm text-enterprise-400 hover:text-enterprise-600 transition-colors"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              Back to directory
            </Link>
            <span className="text-enterprise-200">|</span>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Directory", href: "/directory" },
                ...(agent.category ? [{ label: agent.category, href: `/categories/${agent.category.toLowerCase().replace(/[&\s]+/g, "-").replace(/[^a-z0-9-]/g, "")}` }] : []),
                { label: agent.agent_name },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start pb-16">
            <div className="space-y-14 min-w-0">
              <AgentHero agent={agent as any} company={company as any} />
              <AgentDetailSections agent={agent as any} />
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <AgentStatsPanel agent={agent as any} company={company as any} />
            </div>
          </div>
        </div>
        <CompareTray />
      </main>
      <Footer />
    </>
  );
}

export const revalidate = 3600;
