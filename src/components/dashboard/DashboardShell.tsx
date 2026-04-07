"use client";

import { Navbar } from "@/components/shared/Navbar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { DashboardSidebar } from "./DashboardSidebar";
import type { NavItem, SidebarBrand } from "./DashboardSidebar";

interface DashboardShellProps {
  title: string;
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  hideNavbar?: boolean;
  headerActions?: React.ReactNode;
  brand?: SidebarBrand;
  sidebarTheme?: "light" | "dark";
}

export function DashboardShell({
  title,
  navItems,
  activeKey,
  onNavigate,
  children,
  hideNavbar,
  headerActions,
  brand,
  sidebarTheme = "light",
}: DashboardShellProps) {
  const topOffset = hideNavbar ? "pt-0" : "pt-16 md:pt-20";
  const sidebarTop = hideNavbar ? "md:top-0" : "md:top-20";
  const mobileStickyTop = hideNavbar ? "top-0" : "top-16";
  const isDarkSidebar = sidebarTheme === "dark";

  const shellBg = isDarkSidebar ? "bg-enterprise-50" : "";
  const asideChrome = isDarkSidebar
    ? "overflow-y-auto shadow-xl"
    : "overflow-y-auto border-r border-enterprise-200";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={`min-h-screen ${shellBg} ${topOffset}`}>
        <aside
          className={`hidden md:fixed ${sidebarTop} md:bottom-0 md:left-0 md:flex md:w-64 md:flex-col z-30 ${asideChrome}`}
        >
          <DashboardSidebar
            navItems={navItems}
            activeKey={activeKey}
            onNavigate={onNavigate}
            brand={brand}
            theme={sidebarTheme}
          />
        </aside>

        <main className="md:ml-64">
          <DashboardMobileNav
            navItems={navItems}
            activeKey={activeKey}
            onNavigate={onNavigate}
            stickyTop={mobileStickyTop}
            brandName={brand?.name}
          />
          <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
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
