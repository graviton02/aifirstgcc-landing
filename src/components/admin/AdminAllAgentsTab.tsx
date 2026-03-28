"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AgentReviewDetails } from "./AgentReviewDetails";

export function AdminAllAgentsTab({ token }: { token: string }) {
  const agents = useQuery(api.admin.getAllAgentsCatalog, { token });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [company, setCompany] = useState("all");
  const [category, setCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (agents === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  const companyOptions = Array.from(
    new Set(agents.map((agent: any) => agent.company?.name).filter(Boolean))
  ) as string[];
  const categoryOptions = Array.from(
    new Set(agents.map((agent: any) => agent.category).filter(Boolean))
  ) as string[];

  const normalizedSearch = search.trim().toLowerCase();
  const filteredAgents = agents.filter((agent: any) => {
    if (status !== "all" && agent.status !== status) return false;
    if (company !== "all" && agent.company?.name !== company) return false;
    if (category !== "all" && agent.category !== category) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      agent.agent_name,
      agent.tagline,
      agent.description,
      agent.company?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-enterprise-200 bg-enterprise-50 p-4 md:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search agents or companies"
          className="rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All statuses</option>
        </select>
        <select
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All companies</option>
          {companyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {!filteredAgents.length ? (
        <p className="py-8 text-center text-enterprise-500">
          No agents match the current filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredAgents.map((agent: any) => {
            const expanded = expandedId === agent._id;

            return (
              <div
                key={agent._id}
                className="rounded-xl border border-enterprise-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-enterprise-900">
                        {agent.agent_name}
                      </p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {agent.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          agent.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-enterprise-100 text-enterprise-600"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    {agent.company?.name && (
                      <p className="mt-1 text-xs text-enterprise-500">
                        {agent.company.name}
                      </p>
                    )}
                    {agent.tagline && (
                      <p className="mt-1 text-sm text-enterprise-600">{agent.tagline}</p>
                    )}
                    <p className="mt-2 text-sm text-enterprise-700 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : agent._id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expanded ? "Hide details" : "Show details"}
                  </button>
                </div>

                {expanded && <AgentReviewDetails agent={agent} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
