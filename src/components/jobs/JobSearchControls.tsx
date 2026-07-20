"use client";

import { Search } from "lucide-react";
import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from "@/jobs/config";

export type JobSearchControlsProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
};

/**
 * Search box + category chips, shared by the two /jobs hero variants so the
 * page stays browsable whichever hero is showing.
 */
export function JobSearchControls({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: JobSearchControlsProps) {
  return (
    <>
      <div className="mt-8 max-w-2xl">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-enterprise-200 bg-white px-4 py-3 shadow-card transition-all duration-400 ease-smooth focus-within:border-blue-400 focus-within:shadow-card-hover">
          <Search className="h-4 w-4 text-enterprise-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search jobs, companies, skills, or locations"
            className="w-full bg-transparent text-sm text-enterprise-900 outline-none placeholder:text-enterprise-400"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {JOB_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange?.(category === cat ? "" : cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-300 ${
              category === cat
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-enterprise-200 bg-white/80 text-enterprise-600 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
          >
            {JOB_CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>
    </>
  );
}
