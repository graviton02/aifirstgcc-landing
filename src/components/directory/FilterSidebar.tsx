"use client";

import { FUNCTIONAL_CATEGORIES, INDUSTRY_CATEGORIES, INFRASTRUCTURE_CATEGORIES } from "@/lib/categories";

interface Filters {
  functional_category: string;
  industry_category: string;
  infrastructure_category: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

function FilterGroup({ label, options, value, onSelect }: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-enterprise-800 mb-2">{label}</h3>
      <div className="space-y-1">
        <button
          onClick={() => onSelect("")}
          className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
            !value ? "bg-primary/10 text-primary font-medium" : "text-enterprise-600 hover:bg-enterprise-50"
          }`}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt === value ? "" : opt)}
            className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
              value === opt ? "bg-primary/10 text-primary font-medium" : "text-enterprise-600 hover:bg-enterprise-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <FilterGroup
        label="Function"
        options={FUNCTIONAL_CATEGORIES}
        value={filters.functional_category}
        onSelect={(v) => onChange({ ...filters, functional_category: v })}
      />
      <FilterGroup
        label="Industry"
        options={INDUSTRY_CATEGORIES}
        value={filters.industry_category}
        onSelect={(v) => onChange({ ...filters, industry_category: v })}
      />
      <FilterGroup
        label="Infrastructure"
        options={INFRASTRUCTURE_CATEGORIES}
        value={filters.infrastructure_category}
        onSelect={(v) => onChange({ ...filters, infrastructure_category: v })}
      />
    </aside>
  );
}
