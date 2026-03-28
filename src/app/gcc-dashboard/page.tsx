"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { useUserRole } from "@/auth/useUserRole";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShortlistedAgentsTab } from "@/components/gcc-dashboard/ShortlistedAgentsTab";
import { CurrentRequestsTab } from "@/components/gcc-dashboard/CurrentRequestsTab";

const DEFAULT_TAB = "shortlisted-agents" as const;
const TABS = ["shortlisted-agents", "current-requests"] as const;
type GccTab = (typeof TABS)[number];

const NAV_ITEMS = [
  { key: "shortlisted-agents", label: "Shortlisted Agents", icon: Star },
  { key: "current-requests", label: "Current Requests", icon: MessageCircle },
];

export default function GCCDashboardPage() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<GccTab>(() => {
    const requestedTab = searchParams.get("tab");
    return TABS.includes(requestedTab as GccTab)
      ? (requestedTab as GccTab)
      : DEFAULT_TAB;
  }, [searchParams]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
  }, [authLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "provider") router.replace("/dashboard");
    if (!role) router.replace("/onboarding");
  }, [role, isLoaded, router]);

  const handleNavigate = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!isLoaded || role !== "gcc") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  return (
    <DashboardShell
      title="GCC Dashboard"
      navItems={NAV_ITEMS}
      activeKey={activeTab}
      onNavigate={handleNavigate}
    >
      {activeTab === "shortlisted-agents" && <ShortlistedAgentsTab />}
      {activeTab === "current-requests" && <CurrentRequestsTab />}
    </DashboardShell>
  );
}
