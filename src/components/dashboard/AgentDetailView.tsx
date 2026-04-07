"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Edit, Clock, CheckCircle } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { AgentForm } from "./AgentForm";

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-sm text-enterprise-400">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-2.5 py-1 bg-enterprise-100 text-enterprise-700 rounded-full text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-enterprise-500 mb-2">{title}</h4>
      {children}
    </div>
  );
}

export function AgentDetailView({
  agent,
  companyId,
  onBack,
  pendingEdits,
}: {
  agent: any;
  companyId: string;
  onBack: () => void;
  pendingEdits: any[];
}) {
  const [editing, setEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const hasPending = pendingEdits.some(
    (e: any) => e.agent_id === agent._id && e.status === "pending"
  );

  const categoryColor = CATEGORY_COLORS[agent.category] ?? "bg-enterprise-400";

  if (editing) {
    return (
      <div>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </button>
        <div className="p-4 bg-enterprise-50 rounded-xl">
          <h3 className="font-semibold text-enterprise-900 mb-4">
            Edit {agent.agent_name}
          </h3>
          <AgentForm
            mode="edit"
            initialData={agent}
            companyId={companyId}
            agentId={agent._id}
            onSuccess={() => {
              setEditing(false);
              setEditSuccess(true);
              setTimeout(() => setEditSuccess(false), 3000);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        <div className="flex items-center gap-2">
          {agent.slug && (
            <Link
              href={`/agents/${agent.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-primary/20 text-primary rounded-lg hover:bg-primary/5"
            >
              <ArrowUpRight className="w-4 h-4" />
              View in Directory
            </Link>
          )}
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-enterprise-300 rounded-lg hover:bg-enterprise-50"
          >
            <Edit className="w-4 h-4" />
            Edit Agent
          </button>
        </div>
      </div>

      {hasPending && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            This agent has edits pending admin review.
          </span>
        </div>
      )}

      {editSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">Edit submitted for admin review.</span>
        </div>
      )}

      <div className="p-6 bg-white border border-enterprise-200 rounded-xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-enterprise-900">
              {agent.agent_name}
            </h3>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryColor}`}
            />
            <span className="text-sm text-enterprise-600">{agent.category}</span>
          </div>
          {agent.tagline && (
            <p className="text-enterprise-600">{agent.tagline}</p>
          )}
        </div>

        {/* Description */}
        <Section title="Description">
          <p className="text-enterprise-700 text-sm whitespace-pre-wrap">
            {agent.description}
          </p>
        </Section>

        {/* Classification */}
        {(agent.functional_categories?.length ||
          agent.industry_categories?.length ||
          agent.infrastructure_categories?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agent.functional_categories?.length > 0 && (
              <Section title="Functional Categories">
                <Chips items={agent.functional_categories} />
              </Section>
            )}
            {agent.industry_categories?.length > 0 && (
              <Section title="Industry Categories">
                <Chips items={agent.industry_categories} />
              </Section>
            )}
            {agent.infrastructure_categories?.length > 0 && (
              <Section title="Infrastructure Categories">
                <Chips items={agent.infrastructure_categories} />
              </Section>
            )}
          </div>
        )}

        {/* Use Cases */}
        {agent.use_cases?.length > 0 && (
          <Section title="Use Cases">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agent.use_cases.map(
                (uc: { title: string; description: string }, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-enterprise-50 rounded-lg border border-enterprise-100"
                  >
                    <p className="font-medium text-enterprise-900 text-sm">
                      {uc.title}
                    </p>
                    <p className="text-enterprise-600 text-sm mt-1">
                      {uc.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </Section>
        )}

        {/* Integrations */}
        {agent.integrations?.length > 0 && (
          <Section title="Integrations">
            <Chips items={agent.integrations} />
          </Section>
        )}

        {/* Expected Outcomes */}
        {agent.expected_outcomes?.length > 0 && (
          <Section title="Expected Outcomes">
            <Chips items={agent.expected_outcomes} />
          </Section>
        )}

        {/* Links */}
        {(agent.source_url || agent.demo_url) && (
          <Section title="Links">
            <div className="flex flex-wrap gap-3">
              {agent.source_url && (
                <a
                  href={agent.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Source URL
                </a>
              )}
              {agent.demo_url && (
                <a
                  href={agent.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Demo URL
                </a>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
