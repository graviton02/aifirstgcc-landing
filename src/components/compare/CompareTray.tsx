"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { motion, AnimatePresence } from "framer-motion";

export function CompareTray() {
  const { slugs, remove, clear, count } = useCompare();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-enterprise-200 shadow-xl p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-enterprise-700">
              {count} agent{count !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              {slugs.map((slug) => (
                <span key={slug} className="flex items-center gap-1 px-2 py-1 bg-enterprise-100 rounded-full text-xs text-enterprise-700">
                  {slug}
                  <button onClick={() => remove(slug)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={clear} className="text-sm text-enterprise-500 hover:text-enterprise-700">
              Clear
            </button>
            {count >= 2 && (
              <Link
                href={`/compare?agents=${slugs.join(",")}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
              >
                Compare
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
