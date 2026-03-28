"use client";

import { useRouter } from "next/navigation";
import { X, ArrowRight, Scales } from "@phosphor-icons/react";
import { useCompare } from "@/hooks/useCompare";
import { motion, AnimatePresence } from "framer-motion";

export function CompareTray() {
  const { slugs, names, remove, clear, count } = useCompare();
  const router = useRouter();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="bg-enterprise-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] px-5 py-4">
            <div className="flex items-center gap-4">
              {/* Left: icon + count */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Scales weight="duotone" className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-white/80">
                  {count}/4
                </span>
              </div>

              {/* Center: agent pills — 2x2 grid */}
              <div className="grid grid-cols-2 gap-1.5 flex-1 min-w-0">
                {slugs.map((slug) => (
                  <motion.span
                    key={slug}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-white/10 rounded-lg text-xs text-white/90"
                  >
                    <span className="truncate">
                      {names[slug] || slug}
                    </span>
                    <button
                      onClick={() => remove(slug)}
                      className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors shrink-0"
                    >
                      <X weight="bold" className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={clear}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
                >
                  Clear
                </button>
                {count >= 2 && (
                  <button
                    onClick={() => router.push(`/compare?agents=${slugs.join(",")}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Compare
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
