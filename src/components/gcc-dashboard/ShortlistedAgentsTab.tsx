"use client";

import Link from "next/link";
import { Trash2, Loader2, Bot } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ShortlistedAgentsTab() {
  const shortlist = useQuery(api.shortlists.getMine);
  const agents = useQuery(
    api.agents.getByIds,
    shortlist ? { ids: shortlist.map((s: any) => s.agent_id) } : "skip"
  );
  const removeFromShortlist = useMutation(api.shortlists.remove);

  if (shortlist === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!shortlist.length) {
    return (
      <div className="text-center py-12 text-enterprise-500">
        <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No shortlisted agents yet.</p>
        <Link href="/directory" className="text-primary hover:underline text-sm mt-2 inline-block">
          Browse the directory
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(agents ?? []).map((agent: any) => (
        <div key={agent._id} className="p-4 bg-white border border-enterprise-200 rounded-xl flex items-start justify-between">
          <Link href={agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`} className="hover:text-primary">
            <h3 className="font-semibold text-enterprise-900">{agent.agent_name}</h3>
            {agent.tagline && <p className="text-sm text-enterprise-600 mt-1">{agent.tagline}</p>}
            <span className="text-xs text-primary mt-2 inline-block">{agent.category}</span>
          </Link>
          <button
            onClick={() => removeFromShortlist({ agent_id: agent._id })}
            className="p-2 text-enterprise-400 hover:text-red-500 transition-colors"
            title="Remove from shortlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
