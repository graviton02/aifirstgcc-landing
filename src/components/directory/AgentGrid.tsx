"use client";

import { AgentCard } from "./AgentCard";

interface Agent {
  _id: string;
  slug?: string;
  agent_name: string;
  tagline?: string;
  description?: string;
  category: string;
  functional_categories?: string[];
  logo_url?: string;
}

interface Props {
  agents: Agent[] | undefined;
  isLoading: boolean;
}

export function AgentGrid({ agents, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-enterprise-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-16 text-enterprise-500">
        <p className="text-lg">No agents found matching your criteria.</p>
        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent._id} agent={agent} />
      ))}
    </div>
  );
}
