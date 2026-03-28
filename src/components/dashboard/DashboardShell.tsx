"use client";

import { Navbar } from "@/components/shared/Navbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { NavItem } from "./DashboardSidebar";

interface DashboardShellProps {
  title: string;
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  hideNavbar?: boolean;
  headerActions?: React.ReactNode;
}

export function DashboardShell({
  title,
  navItems,
  activeKey,
  onNavigate,
  children,
  hideNavbar,
  headerActions,
}: DashboardShellProps) {
  const topOffset = hideNavbar ? "pt-0" : "pt-16 md:pt-20";
  const sidebarTop = hideNavbar ? "md:top-0" : "md:top-20";
  const mobileStickyTop = hideNavbar ? "top-0" : "top-16";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={`min-h-screen ${topOffset}`}>
        {/* Sidebar — fixed, desktop only */}
        <aside className={`hidden md:fixed ${sidebarTop} md:bottom-0 md:left-0 md:flex md:w-64 md:flex-col bg-white border-r border-enterprise-200 z-30 overflow-y-auto`}>
          <DashboardSidebar navItems={navItems} activeKey={activeKey} onNavigate={onNavigate} />
        </aside>

        {/* Main content — offset for sidebar on desktop */}
        <main className="md:ml-64">
          <DashboardMobileNav navItems={navItems} activeKey={activeKey} onNavigate={onNavigate} stickyTop={mobileStickyTop} />
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-enterprise-900">{title}</h1>
              {headerActions}
            </div>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
