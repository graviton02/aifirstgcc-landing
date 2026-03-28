"use client";

import type { LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
}

export function DashboardSidebar({ navItems, activeKey, onNavigate }: DashboardSidebarProps) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-enterprise-600 hover:bg-enterprise-100 hover:text-enterprise-900"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
