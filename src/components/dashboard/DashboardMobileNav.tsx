"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItem } from "./DashboardSidebar";

interface DashboardMobileNavProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  stickyTop?: string;
}

export function DashboardMobileNav({ navItems, activeKey, onNavigate, stickyTop = "top-16" }: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItem = navItems.find((item) => item.key === activeKey);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={containerRef} className={`sticky ${stickyTop} z-20 bg-white border-b border-enterprise-200 md:hidden`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-enterprise-900"
      >
        <span className="flex items-center gap-2">
          {activeItem && <activeItem.icon className="w-4 h-4" />}
          {activeItem?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-enterprise-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-black/20 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 bg-white border-b border-enterprise-200 shadow-md z-20"
            >
              {navItems.map((item) => {
                const isActive = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-enterprise-600 hover:bg-enterprise-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
