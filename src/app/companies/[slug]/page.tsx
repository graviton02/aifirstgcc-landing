import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { ClaimProfileButton } from "@/components/company/ClaimProfileButton";
import { AgentCard } from "@/components/directory/AgentCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Footer } from "@/components/sections/Footer";
import { companyJsonLd, breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

interface Props { params: Promise<{ slug: string }> }

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchQuery(api.companies.listAllSlugs, {});
    return slugs.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const companyName = humanizeSlug(slug);
  const title = `${companyName} | Company Profile | Orbys360`;
  const description = `View ${companyName} on Orbys360 and explore the company's AI solutions and presence in the directory.`;
  const url = `${BASE_URL}/companies/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Orbys360" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const company = await fetchQuery(api.companies.getBySlug, { slug });
  if (!company) {
    notFound();
  }

  const [agents, reviewSummary] = await Promise.all([
    fetchQuery(api.agents.getByCompany, { company_id: company._id }),
    fetchQuery(api.reviews.getCompanyPublicSummary, { company_id: company._id }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(companyJsonLd(company as any, reviewSummary ?? undefined)),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([
        { name: "Home", url: BASE_URL },
        { name: "Directory", url: `${BASE_URL}/directory` },
        { name: company.name, url: `${BASE_URL}/companies/${slug}` },
      ])) }} />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Directory", href: "/directory" },
            { label: company.name },
          ]}
        />
        <div className="mt-6">
          <CompanyHeader
            company={company as any}
            agents={agents as any}
            reviewSummary={reviewSummary}
          />
        </div>
        <div className="mt-3">
          <ClaimProfileButton companySlug={slug} claimStatus={company.claim_status} />
        </div>

        {agents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-enterprise-900 mb-4">
              Agents by {company.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent: any) => (
                <AgentCard key={agent._id} agent={agent} company={company as any} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export const revalidate = 3600;
