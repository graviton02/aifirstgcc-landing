"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Scales,
  ArrowLeft,
  X,
  Briefcase,
  Tag,
  Lightbulb,
  Plugs,
  Target,
  Buildings,
  Globe,
  CaretRight,
} from "@phosphor-icons/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CompanyLogo } from "@/components/directory/CompanyLogo";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { useCompare } from "@/hooks/useCompare";
import type { Agent, Company } from "@/lib/types";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { slugs, remove } = useCompare();
  const seeded = useRef(false);

  // On mount, seed the store from URL params (if store is empty but URL has agents)
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const urlSlugs = (searchParams.get("agents") ?? "").split(",").filter(Boolean);
    if (urlSlugs.length > 0 && slugs.length === 0) {
      // Store is empty but URL has agents — this shouldn't normally happen
      // since the user navigated here via the tray, but handle it gracefully
    }
  }, [searchParams, slugs.length]);

  // Keep URL in sync with store state
  useEffect(() => {
    const currentUrl = slugs.length > 0 ? `/compare?agents=${slugs.join(",")}` : "/compare";
    const currentParam = searchParams.get("agents") ?? "";
    const currentSlugsFromUrl = currentParam.split(",").filter(Boolean);
    if (currentSlugsFromUrl.join(",") !== slugs.join(",")) {
      router.replace(currentUrl, { scroll: false });
    }
  }, [slugs, searchParams, router]);

  // Fetch agents
  const agent0 = useQuery(api.agents.getBySlug, slugs[0] ? { slug: slugs[0] } : "skip");
  const agent1 = useQuery(api.agents.getBySlug, slugs[1] ? { slug: slugs[1] } : "skip");
  const agent2 = useQuery(api.agents.getBySlug, slugs[2] ? { slug: slugs[2] } : "skip");
  const agent3 = useQuery(api.agents.getBySlug, slugs[3] ? { slug: slugs[3] } : "skip");

  const agentResults = [agent0, agent1, agent2, agent3].slice(0, slugs.length);
  const agents = agentResults.filter((a): a is NonNullable<typeof a> => a !== undefined && a !== null) as Agent[];
  const loading = agentResults.some((a) => a === undefined) && slugs.length > 0;

  // Fetch all companies for lookup
  const allCompanies = useQuery(api.companies.listAll) as Company[] | undefined;
  const companyMap = useMemo(() => {
    if (!allCompanies) return new Map<string, Company>();
    return new Map(allCompanies.map((c) => [c._id, c]));
  }, [allCompanies]);

  const colCount = agents.length;
  // Grid: label column + agent columns + optional empty column
  const showAddSlot = colCount < 4 && colCount >= 2;

  if (slugs.length < 2 && !loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-[80dvh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-enterprise-100 flex items-center justify-center mx-auto mb-6">
              <Scales weight="duotone" className="w-8 h-8 text-enterprise-400" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-enterprise-950 mb-3">
              Select agents to compare
            </h1>
            <p className="text-enterprise-500 mb-6">
              Add at least 2 agents from the directory to compare them side by side.
            </p>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-enterprise-900 text-white rounded-xl text-sm font-medium hover:bg-enterprise-800 transition-colors"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              Browse Directory
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-enterprise-50/50">
        {/* Header */}
        <section className="pt-28 md:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/directory"
                className="inline-flex items-center gap-1.5 text-sm text-enterprise-500 hover:text-enterprise-700 transition-colors mb-6"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                Back to directory
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scales weight="duotone" className="w-5 h-5 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-enterprise-950 tracking-tight">
                  Compare Agents
                </h1>
              </div>
              <p className="text-enterprise-500 mt-2">
                Side-by-side comparison of {colCount} agent{colCount !== 1 ? "s" : ""}
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: slugs.length }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-enterprise-200/60 p-6 animate-pulse">
                    <div className="w-12 h-12 bg-enterprise-100 rounded-xl mb-4" />
                    <div className="h-5 w-32 bg-enterprise-100 rounded mb-2" />
                    <div className="h-4 w-24 bg-enterprise-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Agent Header Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className={`grid gap-3 mb-1 ${gridCols(colCount, showAddSlot)}`}
                >
                  {/* Label spacer */}
                  <div />

                  {agents.map((agent, i) => {
                    const company = companyMap.get(agent.company_id!);
                    const dotColor = CATEGORY_COLORS[agent.category] || "bg-enterprise-400";
                    return (
                      <motion.div
                        key={agent._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                        className="relative bg-white rounded-2xl border border-enterprise-200/60 p-5"
                      >
                        <button
                          onClick={() => remove(agent.slug ?? agent._id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-enterprise-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from comparison"
                        >
                          <X weight="bold" className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-start gap-3 mb-3">
                          <CompanyLogo company={company} size="sm" />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/agents/${agent.slug ?? agent._id}`}
                              className="font-display text-lg font-semibold text-enterprise-950 tracking-tight hover:text-primary transition-colors line-clamp-1"
                            >
                              {agent.agent_name}
                            </Link>
                            <p className="text-sm text-enterprise-400 mt-0.5">
                              {company?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          <span className="text-xs text-enterprise-500">
                            {agent.category}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Add agent slot */}
                  {showAddSlot && (
                    <Link
                      href="/directory"
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-enterprise-200/80 p-5 text-enterprise-400 hover:border-primary/30 hover:text-primary transition-colors min-h-[120px]"
                    >
                      <Scales weight="duotone" className="w-6 h-6" />
                      <span className="text-xs font-medium">Add agent</span>
                    </Link>
                  )}
                </motion.div>

                {/* Comparison Rows */}
                <div className="space-y-px">
                  <CompareRow
                    label="Tagline"
                    icon={<Tag weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => a.tagline || "—"}
                    index={0}
                  />
                  <CompareRow
                    label="Description"
                    icon={<Lightbulb weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <span className="line-clamp-4">{a.description}</span>
                    )}
                    index={1}
                  />
                  <CompareRow
                    label="Categories"
                    icon={<Briefcase weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <div className="flex flex-wrap gap-1.5">
                        {(a.functional_categories ?? []).map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-md">
                            {c}
                          </span>
                        ))}
                        {(a.functional_categories ?? []).length === 0 && <span className="text-enterprise-300">—</span>}
                      </div>
                    )}
                    index={2}
                  />
                  <CompareRow
                    label="Industries"
                    icon={<Buildings weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <div className="flex flex-wrap gap-1.5">
                        {(a.industry_categories ?? []).map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-enterprise-100 text-enterprise-600 text-xs rounded-md">
                            {c}
                          </span>
                        ))}
                        {(a.industry_categories ?? []).length === 0 && <span className="text-enterprise-300">—</span>}
                      </div>
                    )}
                    index={3}
                  />
                  <CompareRow
                    label="Use Cases"
                    icon={<Target weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <div className="space-y-2">
                        {(a.use_cases ?? []).map((uc, i) => (
                          <div key={i}>
                            <p className="text-sm font-medium text-enterprise-700">{uc.title}</p>
                            <p className="text-xs text-enterprise-400 mt-0.5">{uc.description}</p>
                          </div>
                        ))}
                        {(a.use_cases ?? []).length === 0 && <span className="text-enterprise-300">—</span>}
                      </div>
                    )}
                    index={4}
                  />
                  <CompareRow
                    label="Integrations"
                    icon={<Plugs weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <div className="flex flex-wrap gap-1.5">
                        {(a.integrations ?? []).slice(0, 6).map((int) => (
                          <span key={int} className="px-2 py-0.5 bg-enterprise-50 border border-enterprise-200/60 text-enterprise-600 text-xs rounded-md">
                            {int}
                          </span>
                        ))}
                        {(a.integrations ?? []).length > 6 && (
                          <span className="px-2 py-0.5 text-enterprise-400 text-xs">
                            +{a.integrations!.length - 6}
                          </span>
                        )}
                        {(a.integrations ?? []).length === 0 && <span className="text-enterprise-300">—</span>}
                      </div>
                    )}
                    index={5}
                  />
                  <CompareRow
                    label="Outcomes"
                    icon={<Globe weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <ul className="space-y-1">
                        {(a.expected_outcomes ?? []).slice(0, 4).map((o, i) => (
                          <li key={i} className="text-xs text-enterprise-600 flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-enterprise-300 mt-1.5 shrink-0" />
                            <span className="line-clamp-2">{o}</span>
                          </li>
                        ))}
                        {(a.expected_outcomes ?? []).length === 0 && <span className="text-enterprise-300 text-xs">—</span>}
                      </ul>
                    )}
                    index={6}
                  />
                  <CompareRow
                    label="Functions"
                    icon={<Briefcase weight="duotone" className="w-4 h-4" />}
                    agents={agents}
                    colCount={colCount}
                    showAddSlot={showAddSlot}
                    render={(a) => (
                      <div className="flex flex-wrap gap-1.5">
                        {(a.business_functions ?? []).map((f) => (
                          <span key={f} className="px-2 py-0.5 bg-enterprise-50 text-enterprise-500 text-xs rounded-md">
                            {f}
                          </span>
                        ))}
                        {(a.business_functions ?? []).length === 0 && <span className="text-enterprise-300">—</span>}
                      </div>
                    )}
                    index={7}
                  />
                </div>

                {/* View full detail links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`grid gap-3 mt-4 ${gridCols(colCount, showAddSlot)}`}
                >
                  <div />
                  {agents.map((agent) => (
                    <Link
                      key={agent._id}
                      href={`/agents/${agent.slug ?? agent._id}`}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-enterprise-200/60 text-sm font-medium text-enterprise-600 hover:text-primary hover:border-primary/20 transition-colors"
                    >
                      View full profile
                      <CaretRight weight="bold" className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                  {showAddSlot && <div />}
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function CompareRow({
  label,
  icon,
  agents,
  colCount,
  showAddSlot,
  render,
  index,
}: {
  label: string;
  icon: React.ReactNode;
  agents: Agent[];
  colCount: number;
  showAddSlot: boolean;
  render: (agent: Agent) => React.ReactNode;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
      className={`grid gap-3 ${gridCols(colCount, showAddSlot)} ${
        isEven ? "bg-white" : "bg-enterprise-50/60"
      } rounded-xl`}
    >
      {/* Label */}
      <div className="flex items-start gap-2 p-4 text-enterprise-500">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Values */}
      {agents.map((agent) => (
        <div
          key={agent._id}
          className="p-4 text-sm text-enterprise-600 leading-relaxed"
        >
          {render(agent)}
        </div>
      ))}

      {showAddSlot && <div />}
    </motion.div>
  );
}

function gridCols(count: number, hasAddSlot: boolean): string {
  const total = count + 1 + (hasAddSlot ? 1 : 0);
  // First column (label) is narrower
  switch (total) {
    case 3:
      return "grid-cols-[160px_1fr_1fr]";
    case 4:
      return "grid-cols-[160px_1fr_1fr_1fr]";
    case 5:
      return "grid-cols-[160px_1fr_1fr_1fr_1fr]";
    default:
      return "grid-cols-[160px_1fr_1fr]";
  }
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
