import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES, slugifyCategory, categoryFromSlug } from "@/lib/categories";
import { Navbar } from "@/components/shared/Navbar";
import { AgentCard } from "@/components/directory/AgentCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Footer } from "@/components/sections/Footer";
import { categoryJsonLd, breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({ slug: slugifyCategory(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Category Not Found" };

  const title = `${category} AI Agents | Orbys360`;
  const description = `Discover AI agents in ${category}. Compare features, capabilities, and find the best fit for your organization.`;
  const url = `${BASE_URL}/categories/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Orbys360" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) {
    notFound();
  }

  const result = await fetchQuery(api.agents.list, { category, limit: 50 });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(categoryJsonLd(category, result.count)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([
        { name: "Home", url: BASE_URL },
        { name: "Directory", url: `${BASE_URL}/directory` },
        { name: category, url: `${BASE_URL}/categories/${slug}` },
      ])) }} />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Directory", href: "/directory" },
            { label: category },
          ]}
        />
        <h1 className="text-3xl font-bold text-enterprise-900 mb-2 mt-6">{category}</h1>
        <p className="text-enterprise-600 mb-8">
          {result.count} AI agents in {category}
        </p>

        {result.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.data.map((agent: any) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-enterprise-500">
            No agents found in this category yet.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}

export const revalidate = 3600;
