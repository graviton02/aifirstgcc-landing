"use client";

import { Loader2, Bot, Trash2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";

export default function ShortlistPage() {
  const shortlist = useQuery(api.shortlists.getMine);
  const agents = useQuery(
    api.agents.getByIds,
    shortlist ? { ids: shortlist.map((s: any) => s.agent_id) } : "skip"
  );
  const removeFromShortlist = useMutation(api.shortlists.remove);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-enterprise-900 mb-6">Your Shortlist</h1>

        {shortlist === undefined ? (
          <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : !shortlist.length ? (
          <div className="text-center py-16 text-enterprise-500">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Your shortlist is empty.</p>
            <Link href="/directory" className="text-primary hover:underline mt-2 inline-block">Browse the directory</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(agents ?? []).map((agent: any) => (
              <div key={agent._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <Link href={agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`} className="hover:text-primary">
                    <h3 className="font-semibold text-enterprise-900">{agent.agent_name}</h3>
                    {agent.tagline && <p className="text-sm text-enterprise-600 mt-1 line-clamp-2">{agent.tagline}</p>}
                  </Link>
                  <button
                    onClick={() => removeFromShortlist({ agent_id: agent._id })}
                    className="p-2 text-enterprise-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-primary mt-2 inline-block">{agent.category}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
