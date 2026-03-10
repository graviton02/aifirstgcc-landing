"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Bot } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AgentsTab({ companyId }: { companyId: string }) {
  const agents = useQuery(api.agents.getByCompany, { company_id: companyId as any });
  const submitAgent = useMutation(api.agents.submit);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    agent_name: "",
    description: "",
    category: "",
    tagline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent_name || !form.description || !form.category) return;
    setIsSubmitting(true);
    try {
      await submitAgent({
        company_id: companyId as any,
        agent_name: form.agent_name,
        description: form.description,
        category: form.category,
        tagline: form.tagline || undefined,
      });
      setForm({ agent_name: "", description: "", category: "", tagline: "" });
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (agents === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-enterprise-900">Your Agents</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Submit New Agent
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-enterprise-50 rounded-xl mb-6 space-y-4">
          <input type="text" placeholder="Agent name" value={form.agent_name}
            onChange={(e) => setForm({ ...form, agent_name: e.target.value })} required
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg" />
          <input type="text" placeholder="Tagline (optional)" value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg" />
          <input type="text" placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} required
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg" />
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg" />
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      )}

      {!agents.length ? (
        <div className="text-center py-12 text-enterprise-500">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No agents listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent: any) => (
            <div key={agent._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
              <Link href={agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`} className="hover:text-primary">
                <h4 className="font-semibold text-enterprise-900">{agent.agent_name}</h4>
              </Link>
              {agent.tagline && <p className="text-sm text-enterprise-600 mt-1">{agent.tagline}</p>}
              <span className="text-xs text-primary mt-2 inline-block">{agent.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
