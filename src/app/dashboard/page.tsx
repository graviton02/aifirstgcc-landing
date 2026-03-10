"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { AgentsTab } from "@/components/dashboard/AgentsTab";
import { TeamTab } from "@/components/dashboard/TeamTab";

const TABS = ["Profile", "Agents", "Team"] as const;

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Profile");
  const myCompany = useQuery(api.companyMembers.getMyCompany);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-enterprise-900 mb-6">Provider Dashboard</h1>
        <div className="flex gap-4 border-b border-enterprise-200 mb-6">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-enterprise-500 hover:text-enterprise-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {myCompany === undefined ? (
          <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <>
            {activeTab === "Profile" && <ProfileTab />}
            {activeTab === "Agents" && myCompany && <AgentsTab companyId={myCompany._id} />}
            {activeTab === "Team" && myCompany && <TeamTab companyId={myCompany._id} />}
          </>
        )}
      </main>
    </>
  );
}
