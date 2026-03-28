"use client";

import { useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";
import {
  FUNCTIONAL_CATEGORIES,
  INDUSTRY_CATEGORIES,
} from "@/lib/categories";

export interface Filters {
  functional: string[];
  industry: string[];
  infrastructure: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  agentCounts: Record<string, number>;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  agentCounts,
}: FilterSidebarProps) {
  const hasAnyFilter =
    filters.functional.length > 0 ||
    filters.industry.length > 0;

  const clearAll = () =>
    onFilterChange({ functional: [], industry: [], infrastructure: [] });

  const toggleFilter = (group: keyof Filters, value: string) => {
    const current = filters[group];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [group]: next });
  };

  return (
    <nav className="space-y-1">
      {hasAnyFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mb-4 px-1"
        >
          <X weight="bold" className="w-3 h-3" />
          Clear all filters
        </button>
      )}

      <FilterGroup
        label="Function"
        items={[...FUNCTIONAL_CATEGORIES]}
        selected={filters.functional}
        onToggle={(v) => toggleFilter("functional", v)}
        counts={agentCounts}
      />
      <FilterGroup
        label="Industry"
        items={[...INDUSTRY_CATEGORIES]}
        selected={filters.industry}
        onToggle={(v) => toggleFilter("industry", v)}
        counts={agentCounts}
      />
    </nav>
  );
}

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
  counts,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  counts: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-enterprise-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-1 py-2 text-xs font-semibold text-enterprise-500 uppercase tracking-widest hover:text-enterprise-700 transition-colors"
      >
        {label}
        <CaretDown
          weight="bold"
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
        />
      </button>
      {expanded && (
        <div className="space-y-0.5 mt-1">
          {items.map((item) => {
            const count = counts[item] ?? 0;
            const isSelected = selected.includes(item);
            return (
              <label
                key={item}
                className={`flex items-center gap-2.5 px-1 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "text-enterprise-900 bg-primary/5"
                    : "text-enterprise-600 hover:bg-enterprise-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(item)}
                  className="w-3.5 h-3.5 rounded border-enterprise-300 text-primary focus:ring-primary/20 shrink-0"
                />
                <span className="truncate flex-1">{item}</span>
                <span className="text-[10px] text-enterprise-400 tabular-nums shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
