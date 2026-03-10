"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";

function CompareContent() {
  const searchParams = useSearchParams();
  const slugsParam = searchParams.get("agents") ?? "";
  const slugs = slugsParam.split(",").filter(Boolean);

  // Fetch all agents by slug in parallel
  const agents = slugs.map((slug) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery(api.agents.getBySlug, { slug })
  );

  const loaded = agents.every((a) => a !== undefined);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-enterprise-900 mb-6">Compare Agents</h1>

        {!loaded ? (
          <p className="text-enterprise-500">Loading agents...</p>
        ) : slugs.length < 2 ? (
          <p className="text-enterprise-500">Select at least 2 agents to compare.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-enterprise-50 border border-enterprise-200 font-medium text-enterprise-700">Feature</th>
                  {agents.map((agent, i) => (
                    <th key={i} className="p-3 bg-enterprise-50 border border-enterprise-200 font-semibold text-enterprise-900 min-w-[200px]">
                      {agent?.agent_name ?? "—"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["tagline", "category", "description"].map((field) => (
                  <tr key={field}>
                    <td className="p-3 border border-enterprise-200 font-medium text-enterprise-700 capitalize">{field}</td>
                    {agents.map((agent, i) => (
                      <td key={i} className="p-3 border border-enterprise-200 text-sm text-enterprise-600">
                        {(agent as any)?.[field] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-3 border border-enterprise-200 font-medium text-enterprise-700">Integrations</td>
                  {agents.map((agent, i) => (
                    <td key={i} className="p-3 border border-enterprise-200 text-sm text-enterprise-600">
                      {agent?.integrations?.join(", ") ?? "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
