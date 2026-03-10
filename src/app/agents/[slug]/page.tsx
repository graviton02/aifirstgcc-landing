import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { AgentHero } from "@/components/agent-detail/AgentHero";
import { GatedSection } from "@/components/agent-detail/GatedSection";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });
  if (!agent) return { title: "Agent Not Found" };
  return {
    title: `${agent.agent_name} — AI Agent | Orbys360`,
    description: agent.tagline || agent.description?.slice(0, 160),
  };
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const agent = await fetchQuery(api.agents.getBySlug, { slug });
  if (!agent) return <div>Agent not found</div>;

  const company = agent.company_id
    ? await fetchQuery(api.companies.getById, { id: agent.company_id })
    : null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <AgentHero agent={agent as any} company={company as any} />

        <GatedSection title="Use Cases" count={agent.use_cases?.length ?? 0}>
          <ul className="space-y-2">
            {agent.use_cases?.map((uc: any, i: number) => (
              <li key={i} className="p-3 bg-enterprise-50 rounded-lg">
                <strong>{uc.title}</strong>: {uc.description}
              </li>
            ))}
          </ul>
        </GatedSection>

        <GatedSection title="Integrations" count={agent.integrations?.length ?? 0}>
          <div className="flex flex-wrap gap-2">
            {agent.integrations?.map((int: string) => (
              <span key={int} className="px-3 py-1 bg-enterprise-100 rounded-full text-sm">{int}</span>
            ))}
          </div>
        </GatedSection>

        <GatedSection title="Expected Outcomes" count={agent.expected_outcomes?.length ?? 0}>
          <ul className="list-disc pl-5 space-y-1">
            {agent.expected_outcomes?.map((o: string, i: number) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </GatedSection>
      </main>
    </>
  );
}

export const revalidate = 3600;
