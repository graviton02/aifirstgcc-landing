"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface SidebarBrand {
  name: string;
  logoUrl?: string;
  logoBg?: string;
  fallbackInitial: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  brand?: SidebarBrand;
  theme?: "light" | "dark";
}

export function DashboardSidebar({
  navItems,
  activeKey,
  onNavigate,
  brand,
  theme = "light",
}: DashboardSidebarProps) {
  const [imgError, setImgError] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setImgError(false);
  }, [brand?.logoUrl]);

  const wrapperClasses = isDark
    ? "flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-950"
    : "flex h-full flex-col bg-white";

  const headerClasses = isDark
    ? "border-b border-white/10 px-5 py-5"
    : "border-b border-enterprise-200 px-5 py-5";

  const brandTextClasses = isDark
    ? "truncate text-sm font-semibold text-white"
    : "truncate text-sm font-semibold text-enterprise-900";

  return (
    <div className={wrapperClasses}>
      {brand && (
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            {brand.logoUrl && !imgError ? (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border ${
                  isDark
                    ? brand.logoBg === "dark"
                      ? "border-white/10 bg-slate-800"
                      : "border-white/10 bg-white"
                    : brand.logoBg === "dark"
                      ? "border-enterprise-800 bg-enterprise-900"
                      : "border-enterprise-100 bg-white"
                }`}
              >
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full w-full object-contain p-0.5"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  isDark
                    ? "bg-gradient-to-br from-primary to-accent-purple text-white"
                    : "bg-enterprise-900 text-white"
                }`}
              >
                {brand.fallbackInitial}
              </div>
            )}
            <span className={brandTextClasses}>{brand.name}</span>
          </div>
        </div>
      )}

      <nav className={`flex flex-col gap-1 ${isDark ? "mt-1 p-3" : "p-4"}`}>
        {navItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;

          const buttonClasses = isDark
            ? isActive
              ? "flex w-full items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-200"
              : "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-slate-200"
            : isActive
              ? "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-primary transition-colors duration-200 bg-primary/10"
              : "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-enterprise-600 transition-colors duration-200 hover:bg-enterprise-100 hover:text-enterprise-900";

          const badgeClasses = isDark
            ? "min-w-[20px] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white"
            : "rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700";

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={buttonClasses}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className={badgeClasses}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
