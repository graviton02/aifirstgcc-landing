"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminClaimsTab } from "@/components/admin/AdminClaimsTab";
import { AdminCompanySubmissionsTab } from "@/components/admin/AdminCompanySubmissionsTab";
import { AdminCompanyEditsTab } from "@/components/admin/AdminCompanyEditsTab";
import { AdminAgentsTab } from "@/components/admin/AdminAgentsTab";
import { AdminAllAgentsTab } from "@/components/admin/AdminAllAgentsTab";
import { AdminAgentEditsTab } from "@/components/admin/AdminAgentEditsTab";
import { AdminContactRequestsTab } from "@/components/admin/AdminContactRequestsTab";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getErrorMessage } from "@/lib/report-error";
import {
  LogOut,
  Loader2,
  LayoutDashboard,
  FileCheck,
  Building,
  PenSquare,
  Bot,
  List,
  FilePenLine,
  Mail,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardSidebar";

const TABS = [
  "Overview",
  "Claims",
  "New Companies",
  "Company Edits",
  "Agents",
  "All Agents",
  "Agent Edits",
  "Contact Requests",
] as const;

type Tab = (typeof TABS)[number];

const ICON_MAP: Record<Tab, NavItem["icon"]> = {
  Overview: LayoutDashboard,
  Claims: FileCheck,
  "New Companies": Building,
  "Company Edits": PenSquare,
  Agents: Bot,
  "All Agents": List,
  "Agent Edits": FilePenLine,
  "Contact Requests": Mail,
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");

  // Read session from sessionStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_token");
    if (stored) setToken(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (token) {
      sessionStorage.setItem("admin_token", token);
    } else {
      sessionStorage.removeItem("admin_token");
    }
  }, [token, hydrated]);

  const login = useAction(api.admin.login);
  const logout = useMutation(api.admin.logout);
  const stats = useQuery(api.admin.getDirectoryStats, token ? { token } : "skip");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ password });
      setToken(result.session_token);
    } catch (error) {
      setError(getErrorMessage(error, "Invalid password"));
    }
  };

  const handleLogout = async () => {
    await logout({ token });
    setToken("");
    setPassword("");
  };

  // Show nothing until hydrated to avoid login form flash
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-enterprise-900 mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg mb-4"
          />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-medium">
            Login
          </button>
        </form>
      </div>
    );
  }

  const pendingCounts: Record<string, number> = {
    Claims: stats?.pendingClaims ?? 0,
    "New Companies": stats?.pendingCompanySubmissions ?? 0,
    "Company Edits": stats?.pendingCompanyEdits ?? 0,
    Agents: stats?.pendingAgentSubmissions ?? 0,
    "Agent Edits": stats?.pendingAgentEdits ?? 0,
    "Contact Requests": stats?.pendingContactRequests ?? 0,
  };

  const navItems: NavItem[] = TABS.map((tab) => ({
    key: tab,
    label: tab,
    icon: ICON_MAP[tab],
    badge: pendingCounts[tab],
  }));

  return (
    <DashboardShell
      title="Admin Dashboard"
      navItems={navItems}
      activeKey={activeTab}
      onNavigate={(key) => setActiveTab(key as Tab)}
      hideNavbar
      headerActions={
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-enterprise-600 hover:text-enterprise-900 hover:bg-enterprise-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      }
    >
      {activeTab === "Overview" && <AdminOverviewTab token={token} onTabChange={(t) => setActiveTab(t as Tab)} />}
      {activeTab === "Claims" && <AdminClaimsTab token={token} />}
      {activeTab === "New Companies" && <AdminCompanySubmissionsTab token={token} />}
      {activeTab === "Company Edits" && <AdminCompanyEditsTab token={token} />}
      {activeTab === "Agents" && <AdminAgentsTab token={token} />}
      {activeTab === "All Agents" && <AdminAllAgentsTab token={token} />}
      {activeTab === "Agent Edits" && <AdminAgentEditsTab token={token} />}
      {activeTab === "Contact Requests" && <AdminContactRequestsTab token={token} />}
    </DashboardShell>
  );
}
