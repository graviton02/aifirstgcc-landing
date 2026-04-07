"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Funnel } from "@phosphor-icons/react";
import {
  FUNCTIONAL_CATEGORIES,
  INFRASTRUCTURE_CATEGORIES,
  INDUSTRY_CATEGORIES,
} from "@/lib/categories";
import type { Filters } from "./FilterSidebar";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  agentCounts: Record<string, number>;
  activeCount: number;
  activeTab: string | null;
}

export function MobileFilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  agentCounts,
  activeCount,
  activeTab,
}: MobileFilterDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-enterprise-100 shrink-0">
              <div className="flex items-center gap-2">
                <Funnel weight="bold" className="w-4 h-4 text-enterprise-500" />
                <span className="font-display text-sm font-semibold text-enterprise-900">
                  Filters
                </span>
                {activeCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-white rounded-full tabular-nums">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-enterprise-100 transition-colors"
              >
                <X weight="bold" className="w-5 h-5 text-enterprise-500" />
              </button>
            </div>

            {/* Scrollable filter groups */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {activeTab ? (
                <MobileFilterGroupNote
                  label="Function"
                  note={`Filtered by tab: ${activeTab}`}
                />
              ) : (
                <MobileFilterGroup
                  label="Function"
                  items={[...FUNCTIONAL_CATEGORIES]}
                  selected={filters.functional}
                  onToggle={(v) => toggleFilter("functional", v)}
                  counts={agentCounts}
                />
              )}
              <MobileFilterGroup
                label="Industry"
                items={[...INDUSTRY_CATEGORIES]}
                selected={filters.industry}
                onToggle={(v) => toggleFilter("industry", v)}
                counts={agentCounts}
              />
              <MobileFilterGroup
                label="Infrastructure"
                items={[...INFRASTRUCTURE_CATEGORIES]}
                selected={filters.infrastructure}
                onToggle={(v) => toggleFilter("infrastructure", v)}
                counts={agentCounts}
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-enterprise-100 shrink-0">
              <button
                onClick={clearAll}
                className="flex-1 py-2.5 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 transition-colors"
              >
                Show results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileFilterGroupNote({
  label,
  note,
}: {
  label: string;
  note: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-enterprise-500 uppercase tracking-widest mb-2">
        {label}
      </h3>
      <div className="rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-600">
        {note}
      </div>
    </div>
  );
}

function MobileFilterGroup({
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
  return (
    <div>
      <h3 className="text-xs font-semibold text-enterprise-500 uppercase tracking-widest mb-2">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const count = counts[item] ?? 0;
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isSelected
                  ? "bg-enterprise-900 text-white"
                  : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
              }`}
            >
              {item}
              <span
                className={`ml-1.5 text-[10px] tabular-nums ${isSelected ? "text-white/70" : "text-enterprise-400"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
