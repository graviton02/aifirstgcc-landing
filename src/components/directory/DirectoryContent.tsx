"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  MagnifyingGlass,
  Funnel,
  Robot,
  Buildings,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import type { Agent, Company } from "@/lib/types";
import { AgentCard } from "./AgentCard";
import { FilterSidebar, type Filters } from "./FilterSidebar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CompareTray } from "@/components/compare/CompareTray";

const PAGE_SIZE = 20;

export default function DirectoryContent() {
  const agents = useQuery(api.agents.listAll) as Agent[] | undefined;
  const companies = useQuery(api.companies.listAll) as Company[] | undefined;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    functional: [],
    industry: [],
    infrastructure: [],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const companyMap = useMemo(() => {
    if (!companies) return new Map<string, Company>();
    return new Map(companies.map((c) => [c._id, c]));
  }, [companies]);

  // Compute per-category agent counts (unfiltered, for sidebar badges)
  const agentCounts = useMemo(() => {
    if (!agents) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    for (const a of agents) {
      for (const cat of a.functional_categories ?? []) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
      for (const cat of a.industry_categories ?? []) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
      for (const cat of a.infrastructure_categories ?? []) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
    return counts;
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    let result = [...agents];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.agent_name.toLowerCase().includes(q) ||
          (a.tagline || "").toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (companyMap.get(a.company_id!)?.name || "").toLowerCase().includes(q)
      );
    }

    // Multi-select filters (OR within group, AND between groups)
    if (filters.functional.length > 0) {
      result = result.filter((a) =>
        (a.functional_categories ?? []).some((c) =>
          filters.functional.includes(c)
        )
      );
    }
    if (filters.industry.length > 0) {
      result = result.filter((a) =>
        (a.industry_categories ?? []).some((c) =>
          filters.industry.includes(c)
        )
      );
    }
    if (filters.infrastructure.length > 0) {
      result = result.filter((a) =>
        (a.infrastructure_categories ?? []).some((c) =>
          filters.infrastructure.includes(c)
        )
      );
    }

    return result;
  }, [agents, search, filters, companyMap]);

  const activeFilterCount =
    filters.functional.length +
    filters.industry.length +
    filters.infrastructure.length;

  const hasAnyFilter = activeFilterCount > 0;
  const isLoading = agents === undefined || companies === undefined;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedAgents = filteredAgents.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid area
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Collect all active filter values for the results header pills
  const activeFilterPills = [
    ...filters.functional.map((v) => ({ group: "functional" as const, value: v })),
    ...filters.industry.map((v) => ({ group: "industry" as const, value: v })),
    ...filters.infrastructure.map((v) => ({ group: "infrastructure" as const, value: v })),
  ];

  const removeFilter = (group: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].filter((v) => v !== value),
    }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-enterprise-50/50">
        {/* Hero */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                  <Robot
                    weight="duotone"
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-sm font-medium text-primary tracking-wide uppercase">
                    Agent Directory
                  </span>
                </div>
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-enterprise-950 tracking-tighter leading-none mb-6">
                Find the right
                <br />
                AI agent
              </h1>
              <p className="text-xl md:text-2xl text-enterprise-500 leading-relaxed max-w-[52ch] mx-auto">
                Browse {agents?.length ?? "..."} curated AI agents across{" "}
                {companies?.length ?? "..."} companies. Filter by function,
                industry, or search by name.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex items-center justify-center gap-8 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="flex items-center gap-2">
                <Robot
                  weight="fill"
                  className="w-5 h-5 text-enterprise-400"
                />
                <span className="text-base text-enterprise-600">
                  <span className="font-semibold text-enterprise-900 tabular-nums">
                    {agents?.length ?? "..."}
                  </span>{" "}
                  agents
                </span>
              </div>
              <div className="w-px h-5 bg-enterprise-200" />
              <div className="flex items-center gap-2">
                <Buildings
                  weight="fill"
                  className="w-5 h-5 text-enterprise-400"
                />
                <span className="text-base text-enterprise-600">
                  <span className="font-semibold text-enterprise-900 tabular-nums">
                    {companies?.length ?? "..."}
                  </span>{" "}
                  companies
                </span>
              </div>
              <div className="w-px h-5 bg-enterprise-200" />
              <span className="text-base text-enterprise-400">
                All curated
              </span>
            </motion.div>

            {/* Full-width search bar */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="relative">
                <MagnifyingGlass
                  weight="bold"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-enterprise-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by agent name, company, or function..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border border-enterprise-200/80 text-enterprise-900 text-sm placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border-color,box-shadow] duration-300"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-enterprise-400 hover:text-enterprise-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sidebar + Grid layout */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Sidebar — hidden on mobile */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  agentCounts={agentCounts}
                />
              </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {/* Results header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest">
                  {hasAnyFilter || search ? "Filtered results" : "All agents"}
                </span>
                <div className="h-px flex-1 bg-enterprise-200/60" />
                <span className="text-xs text-enterprise-400 tabular-nums">
                  {filteredAgents.length > PAGE_SIZE
                    ? `${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filteredAgents.length)} of `
                    : ""}
                  {filteredAgents.length}
                  {hasAnyFilter || search
                    ? ` of ${agents?.length ?? "..."}`
                    : ""}{" "}
                  results
                </span>
              </div>

              {/* Active filter pills */}
              {activeFilterPills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {activeFilterPills.map(({ group, value }) => (
                    <button
                      key={`${group}-${value}`}
                      onClick={() => removeFilter(group, value)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      {value}
                      <X weight="bold" className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      handleFilterChange({
                        functional: [],
                        industry: [],
                        infrastructure: [],
                      })
                    }
                    className="text-xs text-enterprise-400 hover:text-enterprise-600 transition-colors ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Agent grid */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredAgents.length === 0 ? (
                <EmptyState search={search} hasFilters={hasAnyFilter} />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pagedAgents.map((agent, i) => (
                      <AgentCard
                        key={agent._id}
                        agent={agent}
                        company={
                          companyMap.get(agent.company_id!) as
                            | Company
                            | undefined
                        }
                        index={i}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Mobile filter button — visible < lg */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-enterprise-900 text-white text-sm font-medium shadow-lg hover:bg-enterprise-800 active:scale-[0.97] transition-[transform,background-color] duration-200"
          >
            <Funnel weight="bold" className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-enterprise-900 rounded-full tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <MobileFilterDrawer
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          agentCounts={agentCounts}
          activeCount={activeFilterCount}
        />
        <CompareTray />
      </main>
      <Footer />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-7 rounded-2xl bg-white border border-enterprise-200/60 animate-pulse"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-lg bg-enterprise-100" />
            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-36 bg-enterprise-100 rounded" />
              <div className="h-4 w-24 bg-enterprise-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-enterprise-100 rounded mb-2" />
          <div className="h-4 w-3/4 bg-enterprise-100 rounded mb-6" />
          <div className="h-4 w-28 bg-enterprise-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Build page numbers with ellipsis
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-enterprise-500 hover:bg-enterprise-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <CaretLeft weight="bold" className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm text-enterprise-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-enterprise-900 text-white"
                : "text-enterprise-600 hover:bg-enterprise-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-enterprise-500 hover:bg-enterprise-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <CaretRight weight="bold" className="w-4 h-4" />
      </button>
    </nav>
  );
}

function EmptyState({
  search,
  hasFilters,
}: {
  search: string;
  hasFilters: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-enterprise-100 flex items-center justify-center mb-6">
        <MagnifyingGlass
          weight="duotone"
          className="w-7 h-7 text-enterprise-400"
        />
      </div>
      <h3 className="font-display text-lg font-semibold text-enterprise-900 mb-2">
        No agents found
      </h3>
      <p className="text-sm text-enterprise-500 max-w-[40ch]">
        {search
          ? `No results for "${search}"${hasFilters ? " with the current filters" : ""}. Try a different search term.`
          : "No agents match the selected filters. Try removing some filters."}
      </p>
    </motion.div>
  );
}
