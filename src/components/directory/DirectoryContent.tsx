"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { track } from "@vercel/analytics";
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
  ArrowUpRight,
  Sparkle,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import type { AgentDirectoryCard } from "@/lib/types";
import { AgentCard } from "./AgentCard";
import { FilterSidebar, type Filters } from "./FilterSidebar";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import {
  FUNCTIONAL_CATEGORIES,
  INDUSTRY_CATEGORIES,
  INFRASTRUCTURE_CATEGORIES,
  categoryFromSlug,
  slugifyCategory,
} from "@/lib/categories";

const PAGE_SIZE = 20;
const SUGGESTION_LIMIT = 3;
const FUNCTIONAL_CATEGORY_SET = new Set<string>(FUNCTIONAL_CATEGORIES);
const INDUSTRY_CATEGORY_SET = new Set<string>(INDUSTRY_CATEGORIES);
const INFRASTRUCTURE_CATEGORY_SET = new Set<string>(INFRASTRUCTURE_CATEGORIES);

const MobileFilterDrawer = dynamic(
  () => import("./MobileFilterDrawer").then((mod) => mod.MobileFilterDrawer),
  { ssr: false }
);

const CompareTray = dynamic(
  () => import("@/components/compare/CompareTray").then((mod) => mod.CompareTray),
  { ssr: false }
);

type DirectorySearchResult = {
  data: AgentDirectoryCard[];
  count: number;
  totalAgents: number;
  companyCount: number;
  categoryCounts: Record<string, number>;
  suggestions: {
    agents: Array<{
      _id: string;
      slug?: string;
      agent_name: string;
      company_name: string;
    }>;
    companies: string[];
    categories: string[];
  };
};

type DirectorySuggestions = DirectorySearchResult["suggestions"];

type EmptyStateAssist = {
  didYouMean: string[];
  filters: string[];
};

const SEARCH_ASSIST_ALIASES = [
  { pattern: /\bcx\b/i, category: "Customer Experience" },
  { pattern: /\bhr\b|\bhuman resources\b/i, category: "HR & Workforce" },
  { pattern: /\bit ops\b/i, category: "IT Operations" },
  { pattern: /\bgenai\b|\bgenerative ai\b/i, category: "Data & Analytics" },
  { pattern: /\br&d\b|\bresearch and development\b/i, category: "Engineering & DevOps" },
  { pattern: /\bfinops\b|\bfinance operations\b/i, category: "Finance & Accounting" },
];

export default function DirectoryContent() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") ?? "";
  const searchParamString = searchParams.toString();
  const [searchInput, setSearchInput] = useState(searchParamValue);
  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const [filters, setFilters] = useState<Filters>({
    functional: [],
    industry: [],
    infrastructure: [],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeTab = useMemo(() => {
    const requestedTab = searchParams.get("tab");
    if (!requestedTab) return null;

    const category = categoryFromSlug(requestedTab);
    return category && FUNCTIONAL_CATEGORY_SET.has(category) ? category : null;
  }, [searchParams]);

  const directoryQueryArgs = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      tab: activeTab ?? undefined,
      functional:
        !activeTab && filters.functional.length > 0
          ? filters.functional
          : undefined,
      industry: filters.industry.length > 0 ? filters.industry : undefined,
      infrastructure:
        filters.infrastructure.length > 0 ? filters.infrastructure : undefined,
      page: currentPage,
      pageSize: PAGE_SIZE,
      suggestionLimit: SUGGESTION_LIMIT,
    }),
    [activeTab, currentPage, debouncedSearch, filters]
  );

  const directoryResult = useQuery(
    api.agents.directoryPage,
    directoryQueryArgs
  ) as DirectorySearchResult | undefined;
  const shortlistEntries = useQuery(
    api.shortlists.getMine,
    isSignedIn ? {} : "skip"
  );
  const suggestions = directoryResult?.suggestions;
  const shortlistedAgentIds = useMemo(
    () => new Set((shortlistEntries ?? []).map((entry) => String(entry.agent_id))),
    [shortlistEntries]
  );

  const resultAgents = directoryResult?.data ?? [];
  const agentCounts = directoryResult?.categoryCounts ?? {};
  const totalAgents = directoryResult?.totalAgents ?? 0;
  const totalResults = directoryResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const startIndex = totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = totalResults === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalResults);

  const activeFilterCount =
    filters.functional.length +
    filters.industry.length +
    filters.infrastructure.length;
  const hasAnyFilter = activeTab !== null || activeFilterCount > 0;
  const isLoading =
    directoryResult === undefined || (isSignedIn && shortlistEntries === undefined);

  const activeFilterPills = [
    ...filters.functional.map((value) => ({
      group: "functional" as const,
      value,
    })),
    ...filters.industry.map((value) => ({ group: "industry" as const, value })),
    ...filters.infrastructure.map((value) => ({
      group: "infrastructure" as const,
      value,
    })),
  ];

  const emptyStateAssist = useMemo(
    () => buildEmptyStateAssist(searchInput, suggestions),
    [searchInput, suggestions]
  );
  const previousArgsRef = useRef<string | null>(null);
  const pendingEventRef = useRef<null | {
    kind: "search" | "filter" | "pagination" | "load";
    startedAt: number;
    searchLength: number;
    activeFilters: number;
    page: number;
  }>(null);
  const hasTrackedInitialLoadRef = useRef(false);

  useEffect(() => {
    const nextKey = JSON.stringify(directoryQueryArgs);

    if (previousArgsRef.current === null) {
      previousArgsRef.current = nextKey;
      pendingEventRef.current = {
        kind: "load",
        startedAt: performance.now(),
        searchLength: debouncedSearch.length,
        activeFilters: activeFilterCount,
        page: currentPage,
      };
      return;
    }

    if (previousArgsRef.current === nextKey) {
      return;
    }

    const previousArgs = JSON.parse(previousArgsRef.current) as typeof directoryQueryArgs;
    const kind =
      previousArgs.page !== currentPage
        ? "pagination"
        : previousArgs.search !== directoryQueryArgs.search
          ? "search"
          : "filter";

    pendingEventRef.current = {
      kind,
      startedAt: performance.now(),
      searchLength: debouncedSearch.length,
      activeFilters: activeFilterCount,
      page: currentPage,
    };
    previousArgsRef.current = nextKey;
  }, [
    activeFilterCount,
    currentPage,
    debouncedSearch.length,
    directoryQueryArgs,
  ]);

  useEffect(() => {
    if (!directoryResult || !pendingEventRef.current) {
      return;
    }

    const pendingEvent = pendingEventRef.current;
    const latency = Math.round(performance.now() - pendingEvent.startedAt);

    if (pendingEvent.kind === "load" && hasTrackedInitialLoadRef.current) {
      pendingEventRef.current = null;
      return;
    }

    if (pendingEvent.kind === "load") {
      track("directory_load", {
        latency_ms: latency,
        total_results: directoryResult.count,
      });
      hasTrackedInitialLoadRef.current = true;
    }

    if (pendingEvent.kind === "search") {
      track("directory_search", {
        latency_ms: latency,
        query_length: pendingEvent.searchLength,
        total_results: directoryResult.count,
        page: pendingEvent.page,
      });
    }

    if (pendingEvent.kind === "filter") {
      track("directory_filter_apply", {
        latency_ms: latency,
        active_filters: pendingEvent.activeFilters,
        total_results: directoryResult.count,
        page: pendingEvent.page,
      });
    }

    if (pendingEvent.kind === "pagination") {
      track("directory_page_change", {
        latency_ms: latency,
        page: pendingEvent.page,
        total_results: directoryResult.count,
      });
    }

    if (directoryResult.count === 0) {
      track("directory_empty_state", {
        query_length: pendingEvent.searchLength,
        active_filters: pendingEvent.activeFilters,
      });
    }

    pendingEventRef.current = null;
  }, [directoryResult]);

  useEffect(() => {
    setSearchInput((current) =>
      current === searchParamValue ? current : searchParamValue
    );
  }, [searchParamValue]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch === currentSearch) return;

    const params = new URLSearchParams(searchParamString);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl);
  }, [debouncedSearch, pathname, router, searchParamString, searchParams]);

  useEffect(() => {
    if (!activeTab) return;

    setFilters((prev) =>
      prev.functional.length > 0 ? { ...prev, functional: [] } : prev
    );
    setCurrentPage((page) => (page === 1 ? page : 1));
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) return;

    tabRefs.current[slugifyCategory(activeTab)]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (nextFilters: Filters) => {
    setFilters(activeTab ? { ...nextFilters, functional: [] } : nextFilters);
    setCurrentPage(1);
  };

  const handleTabChange = (nextTab: string | null) => {
    setFilters((prev) =>
      prev.functional.length > 0 ? { ...prev, functional: [] } : prev
    );
    setCurrentPage(1);

    const params = new URLSearchParams(searchParamString);
    if (nextTab) {
      params.set("tab", slugifyCategory(nextTab));
    } else {
      params.delete("tab");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl);
  };

  const handleSearchSelection = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleCategorySearchSelection = (category: string) => {
    handleSearchSelection(category);
  };

  const handleEmptyStateFilterSelection = (category: string) => {
    setSearchInput("");
    setCurrentPage(1);

    if (FUNCTIONAL_CATEGORY_SET.has(category)) {
      handleTabChange(category);
      return;
    }

    if (INDUSTRY_CATEGORY_SET.has(category)) {
      handleFilterChange({
        ...filters,
        industry: filters.industry.includes(category)
          ? filters.industry
          : [...filters.industry, category],
      });
      return;
    }

    if (INFRASTRUCTURE_CATEGORY_SET.has(category)) {
      handleFilterChange({
        ...filters,
        infrastructure: filters.infrastructure.includes(category)
          ? filters.infrastructure
          : [...filters.infrastructure, category],
      });
    }
  };

  const removeFilter = (group: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].filter((entry) => entry !== value),
    }));
    setCurrentPage(1);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-enterprise-50/50">
        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                  <Robot weight="duotone" className="w-5 h-5 text-primary" />
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
                Browse {directoryResult?.totalAgents ?? "..."} curated AI agents across{" "}
                {directoryResult?.companyCount ?? "..."} companies. Search by name, company,
                use case, function, industry, or infrastructure.
              </p>
            </motion.div>

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
                <Robot weight="fill" className="w-5 h-5 text-enterprise-400" />
                <span className="text-base text-enterprise-600">
                  <span className="font-semibold text-enterprise-900 tabular-nums">
                    {directoryResult?.totalAgents ?? "..."}
                  </span>{" "}
                  agents
                </span>
              </div>
              <div className="w-px h-5 bg-enterprise-200" />
              <div className="flex items-center gap-2">
                <Buildings weight="fill" className="w-5 h-5 text-enterprise-400" />
                <span className="text-base text-enterprise-600">
                  <span className="font-semibold text-enterprise-900 tabular-nums">
                    {directoryResult?.companyCount ?? "..."}
                  </span>{" "}
                  companies
                </span>
              </div>
              <div className="w-px h-5 bg-enterprise-200" />
              <span className="text-base text-enterprise-400">
                {debouncedSearch ? "Ranked by search relevance" : "All curated"}
              </span>
            </motion.div>

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
                  value={searchInput}
                  onChange={(event) => handleSearchInput(event.target.value)}
                  placeholder="Search by agent, company, use case, function, or infrastructure..."
                  className="w-full h-12 pl-12 pr-20 rounded-xl bg-white border border-enterprise-200/80 text-enterprise-900 text-sm placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border-color,box-shadow] duration-300"
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchInput("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-enterprise-400 hover:text-enterprise-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {searchInput.trim().length > 0 && suggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSearchSelect={handleSearchSelection}
                  onCategorySelect={handleCategorySearchSelection}
                />
              )}
            </motion.div>

            <motion.div
              className="mt-4 -mx-4 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                role="tablist"
                aria-label="Functional categories"
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
              >
                <CategoryTab
                  label="All"
                  count={totalAgents}
                  isActive={activeTab === null}
                  onClick={() => handleTabChange(null)}
                />
                {FUNCTIONAL_CATEGORIES.map((category) => {
                  const slug = slugifyCategory(category);

                  return (
                    <CategoryTab
                      key={category}
                      ref={(node) => {
                        tabRefs.current[slug] = node;
                      }}
                      label={category}
                      count={agentCounts[category]}
                      isActive={activeTab === category}
                      onClick={() => handleTabChange(category)}
                    />
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto flex gap-8">
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  agentCounts={agentCounts}
                  activeTab={activeTab}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest">
                  {hasAnyFilter || debouncedSearch ? "Filtered results" : "All agents"}
                </span>
                <div className="h-px flex-1 bg-enterprise-200/60" />
                <span className="text-xs text-enterprise-400 tabular-nums">
                  {totalResults > PAGE_SIZE ? `${startIndex}–${endIndex} of ` : ""}
                  {totalResults}
                  {hasAnyFilter || debouncedSearch
                    ? ` of ${directoryResult?.totalAgents ?? "..."}`
                    : ""}{" "}
                  results
                </span>
              </div>

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

              {isLoading ? (
                <LoadingSkeleton />
              ) : totalResults === 0 ? (
                <EmptyState
                  search={searchInput}
                  hasFilters={hasAnyFilter}
                  assist={emptyStateAssist}
                  activeFilters={activeFilterPills.map((pill) => pill.value)}
                  onSearchSelect={handleSearchSelection}
                  onFilterSelect={handleEmptyStateFilterSelection}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resultAgents.map((agent, index) => (
                      <AgentCard
                        key={agent._id}
                        agent={agent}
                        index={index}
                        isShortlisted={shortlistedAgentIds.has(agent._id)}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>

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
          onFilterChange={handleFilterChange}
          agentCounts={agentCounts}
          activeCount={activeFilterCount}
          activeTab={activeTab}
        />
        <CompareTray />
      </main>
      <Footer />
    </>
  );
}

function SearchSuggestions({
  suggestions,
  onSearchSelect,
  onCategorySelect,
}: {
  suggestions: DirectorySuggestions;
  onSearchSelect: (value: string) => void;
  onCategorySelect: (value: string) => void;
}) {
  const hasSuggestions =
    suggestions.agents.length > 0 ||
    suggestions.companies.length > 0 ||
    suggestions.categories.length > 0;

  if (!hasSuggestions) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-enterprise-200 bg-white text-left shadow-sm overflow-hidden">
      {suggestions.agents.length > 0 && (
        <SuggestionSection
          icon={<Sparkle weight="fill" className="w-3.5 h-3.5" />}
          label="Top agent matches"
        >
          {suggestions.agents.map((agent) => (
            <Link
              key={agent._id}
              href={agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`}
              prefetch={false}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-enterprise-700 hover:bg-enterprise-50 transition-colors"
            >
              <span className="font-medium text-enterprise-900">{agent.agent_name}</span>
              <span className="text-enterprise-400 truncate">{agent.company_name}</span>
            </Link>
          ))}
        </SuggestionSection>
      )}

      {suggestions.companies.length > 0 && (
        <SuggestionSection
          icon={<Buildings weight="fill" className="w-3.5 h-3.5" />}
          label="Company suggestions"
        >
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {suggestions.companies.map((company) => (
              <button
                key={company}
                onClick={() => onSearchSelect(company)}
                className="inline-flex items-center gap-1.5 rounded-full border border-enterprise-200 px-3 py-1.5 text-xs font-medium text-enterprise-600 hover:border-enterprise-300 hover:bg-enterprise-50 transition-colors"
              >
                <ArrowUpRight weight="bold" className="w-3 h-3" />
                {company}
              </button>
            ))}
          </div>
        </SuggestionSection>
      )}

      {suggestions.categories.length > 0 && (
        <SuggestionSection
          icon={<SlidersHorizontal weight="bold" className="w-3.5 h-3.5" />}
          label="Popular category matches"
        >
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {suggestions.categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className="inline-flex items-center rounded-full border border-enterprise-200 px-3 py-1.5 text-xs font-medium text-enterprise-600 hover:border-enterprise-300 hover:bg-enterprise-50 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </SuggestionSection>
      )}
    </div>
  );
}

function SuggestionSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-enterprise-100 first:border-t-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 text-[11px] font-semibold uppercase tracking-widest text-enterprise-400">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

const CategoryTab = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
  }
>(function CategoryTab({ label, count, isActive, onClick }, ref) {
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`snap-start shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? "bg-enterprise-900 text-white border border-enterprise-900"
          : "bg-white text-enterprise-600 border border-enterprise-200 hover:border-enterprise-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums ${
          isActive
            ? "bg-white/15 text-white"
            : "bg-enterprise-100 text-enterprise-500"
        }`}
      >
        {count ?? "..."}
      </span>
    </button>
  );
});

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
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
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 6) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    let start: number;
    let end: number;

    if (currentPage <= 3) {
      start = 1;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages;
    } else {
      start = currentPage - 1;
      end = currentPage + 2;
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

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

      {getPages().map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
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
  assist,
  activeFilters,
  onSearchSelect,
  onFilterSelect,
}: {
  search: string;
  hasFilters: boolean;
  assist: EmptyStateAssist;
  activeFilters: string[];
  onSearchSelect: (value: string) => void;
  onFilterSelect: (value: string) => void;
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
          ? `No results for "${search}"${hasFilters ? " with the current filters" : ""}. Try a broader search or a category-based filter.`
          : "No agents match the selected filters. Try removing some filters."}
      </p>

      {assist.didYouMean.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-enterprise-400">
            Did you mean
          </span>
          {assist.didYouMean.map((value) => (
            <button
              key={value}
              onClick={() => onSearchSelect(value)}
              className="rounded-full border border-enterprise-200 bg-white px-3 py-1.5 text-xs font-medium text-enterprise-600 hover:border-enterprise-300 hover:bg-enterprise-50 transition-colors"
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {assist.filters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-enterprise-400">
            Try these filters
          </span>
          {assist.filters.map((value) => (
            <button
              key={value}
              onClick={() => onFilterSelect(value)}
              className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {hasFilters && activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-enterprise-400">
            Active filters
          </span>
          {activeFilters.map((value) => (
            <span
              key={value}
              className="rounded-full border border-enterprise-200 bg-enterprise-50 px-3 py-1.5 text-xs font-medium text-enterprise-500"
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
}

function buildEmptyStateAssist(
  search: string,
  suggestions?: DirectorySuggestions
): EmptyStateAssist {
  const didYouMean = new Set<string>();
  const filters = new Set<string>();
  const normalizedSearch = normalizeSearch(search);

  for (const agent of suggestions?.agents ?? []) {
    didYouMean.add(agent.agent_name);
  }

  for (const company of suggestions?.companies ?? []) {
    didYouMean.add(company);
  }

  for (const category of suggestions?.categories ?? []) {
    filters.add(category);
  }

  if (normalizedSearch) {
    for (const category of [
      ...FUNCTIONAL_CATEGORIES,
      ...INDUSTRY_CATEGORIES,
      ...INFRASTRUCTURE_CATEGORIES,
    ]) {
      const normalizedCategory = normalizeSearch(category);
      if (
        normalizedCategory.includes(normalizedSearch) ||
        normalizedSearch.includes(normalizedCategory)
      ) {
        filters.add(category);
      }
    }
  }

  for (const assist of SEARCH_ASSIST_ALIASES) {
    if (assist.pattern.test(search)) {
      filters.add(assist.category);
    }
  }

  return {
    didYouMean: [...didYouMean].slice(0, 3),
    filters: [...filters].slice(0, 4),
  };
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
