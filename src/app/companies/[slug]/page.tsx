import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { ClaimProfileButton } from "@/components/company/ClaimProfileButton";
import { AgentCard } from "@/components/directory/AgentCard";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await fetchQuery(api.companies.getBySlug, { slug });
  if (!company) return { title: "Company Not Found" };
  return {
    title: `${company.name} — Company Profile | Orbys360`,
    description: company.description?.slice(0, 160) || `View ${company.name} on Orbys360`,
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const company = await fetchQuery(api.companies.getBySlug, { slug });
  if (!company) return <div>Company not found</div>;

  const agents = await fetchQuery(api.agents.getByCompany, { company_id: company._id });

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <CompanyHeader company={company as any} />
        <ClaimProfileButton companySlug={slug} claimStatus={company.claim_status} />

        {agents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-enterprise-900 mb-4">
              Agents by {company.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent: any) => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export const revalidate = 3600;
