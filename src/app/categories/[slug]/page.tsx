import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import { ALL_CATEGORIES, slugifyCategory, categoryFromSlug } from "@/lib/categories";
import { Navbar } from "@/components/shared/Navbar";
import { AgentCard } from "@/components/directory/AgentCard";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({ slug: slugifyCategory(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category} AI Agents | Orbys360`,
    description: `Discover AI agents in ${category}. Compare features, capabilities, and find the best fit for your organization.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return <div>Category not found</div>;

  const result = await fetchQuery(api.agents.list, { category, limit: 50 });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-2">{category}</h1>
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
    </>
  );
}

export const revalidate = 3600;
