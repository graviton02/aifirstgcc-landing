"use client";

import {
  JOB_CATEGORIES,
  JOB_SENIORITY_LEVELS,
  JOB_TYPES,
  JOB_WORKPLACE_TYPES,
} from "@/jobs/config";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ChevronDown } from "lucide-react";

type JobFiltersProps = {
  category: string;
  workplaceType: string;
  jobType: string;
  seniority: string;
  onFilterChange: (next: {
    category?: string;
    workplaceType?: string;
    jobType?: string;
    seniority?: string;
  }) => void;
};

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const isActive = value !== "";

  return (
    <label className="block">
      <span className="mb-2 block font-display text-xs font-semibold uppercase tracking-[0.18em] text-enterprise-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none cursor-pointer rounded-2xl border bg-white px-4 py-3 pr-10 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            isActive
              ? "border-blue-400 bg-blue-50/50 ring-1 ring-blue-100"
              : "border-enterprise-200"
          }`}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-enterprise-400" />
      </div>
    </label>
  );
}

export function JobFilters({
  category,
  workplaceType,
  jobType,
  seniority,
  onFilterChange,
}: JobFiltersProps) {
  return (
    <AnimatedSection delay={0.1}>
      <section className="glass rounded-3xl border border-enterprise-200 p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Category"
            value={category}
            options={JOB_CATEGORIES}
            onChange={(value) => onFilterChange({ category: value })}
          />
          <Select
            label="Workplace"
            value={workplaceType}
            options={JOB_WORKPLACE_TYPES}
            onChange={(value) => onFilterChange({ workplaceType: value })}
          />
          <Select
            label="Job Type"
            value={jobType}
            options={JOB_TYPES}
            onChange={(value) => onFilterChange({ jobType: value })}
          />
          <Select
            label="Seniority"
            value={seniority}
            options={JOB_SENIORITY_LEVELS}
            onChange={(value) => onFilterChange({ seniority: value })}
          />
        </div>
      </section>
    </AnimatedSection>
  );
}
