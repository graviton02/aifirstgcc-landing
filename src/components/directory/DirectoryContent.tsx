"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { AgentGrid } from "./AgentGrid";

export function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    functional_category: "",
    industry_category: "",
    infrastructure_category: "",
  });

  const agents = useQuery(api.agents.list, {
    search: search || undefined,
    functional_category: filters.functional_category || undefined,
    industry_category: filters.industry_category || undefined,
    infrastructure_category: filters.infrastructure_category || undefined,
    limit: 50,
  });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-enterprise-900 mb-2">Agent Directory</h1>
          <p className="text-enterprise-600">
            Discover AI agents across industries and functions.
            {agents && ` ${agents.count} agents found.`}
          </p>
        </div>

        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} onSubmit={() => {}} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar filters={filters} onChange={setFilters} />
          <div className="flex-1">
            <AgentGrid agents={agents?.data} isLoading={agents === undefined} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
