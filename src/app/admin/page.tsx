"use client";

import { useEffect, useState } from "react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminClaimsTab } from "@/components/admin/AdminClaimsTab";
import { AdminCompanySubmissionsTab } from "@/components/admin/AdminCompanySubmissionsTab";
import { AdminCompanyEditsTab } from "@/components/admin/AdminCompanyEditsTab";
import { AdminAgentsTab } from "@/components/admin/AdminAgentsTab";
import { AdminAllAgentsTab } from "@/components/admin/AdminAllAgentsTab";
import { AdminAgentEditsTab } from "@/components/admin/AdminAgentEditsTab";
import { AdminContactRequestsTab } from "@/components/admin/AdminContactRequestsTab";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminReviewsTab } from "@/components/admin/AdminReviewsTab";
import { AdminJobsTab } from "@/components/admin/AdminJobsTab";
import { AdminAdvisorsTab } from "@/components/admin/AdminAdvisorsTab";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
  Star,
  BriefcaseBusiness,
  UserCheck,
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
  "Jobs",
  "Advisors",
  "Reviews",
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
  Jobs: BriefcaseBusiness,
  Advisors: UserCheck,
  Reviews: Star,
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const viewerAccess = useQuery(api.admin.getViewerAccess, isSignedIn ? {} : "skip");
  const stats = useQuery(
    api.admin.getDirectoryStats,
    viewerAccess?.isAdmin ? {} : "skip"
  );

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=%2Fadmin");
    }
  }, [authLoaded, isSignedIn, router]);

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  if (
    !authLoaded ||
    (isSignedIn && viewerAccess === undefined) ||
    (viewerAccess?.isAdmin && stats === undefined)
  ) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  if (!viewerAccess?.isAdmin) {
    return (
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h1 className="text-xl font-bold text-enterprise-900">Admin Access Required</h1>
          <p className="mt-3 text-sm text-enterprise-600">
            This Clerk account is signed in, but it is not allowlisted for the admin workspace.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="rounded-lg border border-enterprise-200 px-4 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
            >
              Back to site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Sign out
            </button>
          </div>
        </div>
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
    Jobs: stats?.pendingJobs ?? 0,
    Advisors: stats?.pendingAdvisorSubmissions ?? 0,
    Reviews:
      (stats?.pendingReviews ?? 0) + (stats?.pendingReviewResponses ?? 0),
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
      {activeTab === "Overview" && <AdminOverviewTab onTabChange={(t) => setActiveTab(t as Tab)} />}
      {activeTab === "Claims" && <AdminClaimsTab />}
      {activeTab === "New Companies" && <AdminCompanySubmissionsTab />}
      {activeTab === "Company Edits" && <AdminCompanyEditsTab />}
      {activeTab === "Agents" && <AdminAgentsTab />}
      {activeTab === "All Agents" && <AdminAllAgentsTab />}
      {activeTab === "Agent Edits" && <AdminAgentEditsTab />}
      {activeTab === "Contact Requests" && <AdminContactRequestsTab />}
      {activeTab === "Jobs" && <AdminJobsTab />}
      {activeTab === "Advisors" && <AdminAdvisorsTab />}
      {activeTab === "Reviews" && <AdminReviewsTab />}
    </DashboardShell>
  );
}
