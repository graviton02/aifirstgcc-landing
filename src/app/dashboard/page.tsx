"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { Navbar } from "@/components/shared/Navbar";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { AgentsTab } from "@/components/dashboard/AgentsTab";
import { TeamTab } from "@/components/dashboard/TeamTab";

const TABS = ["Profile", "Agents", "Team"] as const;

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Profile");
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const { role, isLoaded } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    if (!role) router.replace("/onboarding");
    if (role === "provider" && myCompany === null) router.replace("/provider/setup");
  }, [role, isLoaded, myCompany, router]);

  if (!isLoaded || role !== "provider" || myCompany === undefined || myCompany === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-enterprise-900 mb-6">Provider Dashboard</h1>

        <div className="flex gap-4 border-b border-enterprise-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-enterprise-500 hover:text-enterprise-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Profile" && <ProfileTab />}
        {activeTab === "Agents" && <AgentsTab companyId={myCompany._id} />}
        {activeTab === "Team" && <TeamTab companyId={myCompany._id} />}
      </main>
    </>
  );
}
