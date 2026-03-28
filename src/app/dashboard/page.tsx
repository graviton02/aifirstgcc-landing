"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Bot, Users, Loader2, MessagesSquare } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { AgentsTab } from "@/components/dashboard/AgentsTab";
import { LeadsTab } from "@/components/dashboard/LeadsTab";
import { TeamTab } from "@/components/dashboard/TeamTab";

const DEFAULT_TAB = "profile" as const;
const TABS = ["profile", "agents", "leads", "team"] as const;
type ProviderTab = (typeof TABS)[number];

const NAV_ITEMS = [
  { key: "profile", label: "Profile", icon: Building2 },
  { key: "agents", label: "Agents", icon: Bot },
  { key: "leads", label: "Leads", icon: MessagesSquare },
  { key: "team", label: "Team", icon: Users },
];

export default function ProviderDashboardPage() {
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const { role, isLoaded } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<ProviderTab>(() => {
    const requestedTab = searchParams.get("tab");
    return TABS.includes(requestedTab as ProviderTab)
      ? (requestedTab as ProviderTab)
      : DEFAULT_TAB;
  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    if (!role) router.replace("/onboarding");
    if (role === "provider" && myCompany === null) router.replace("/provider/setup");
  }, [role, isLoaded, myCompany, router]);

  const handleNavigate = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!isLoaded || role !== "provider" || myCompany === undefined || myCompany === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  return (
    <DashboardShell
      title="Provider Dashboard"
      navItems={NAV_ITEMS}
      activeKey={activeTab}
      onNavigate={handleNavigate}
    >
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "agents" && <AgentsTab companyId={myCompany._id} />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "team" && (
        <TeamTab
          companyId={myCompany._id}
          membershipRole={myCompany.membership_role}
        />
      )}
    </DashboardShell>
  );
}
