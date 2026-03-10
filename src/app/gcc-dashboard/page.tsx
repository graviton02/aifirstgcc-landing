"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { ShortlistedAgentsTab } from "@/components/gcc-dashboard/ShortlistedAgentsTab";
import { CurrentRequestsTab } from "@/components/gcc-dashboard/CurrentRequestsTab";
import { ProblemHubTab } from "@/components/gcc-dashboard/ProblemHubTab";

const TABS = ["Shortlisted Agents", "Current Requests", "Problem Hub"] as const;

export default function GCCDashboardPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Shortlisted Agents");

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold text-enterprise-900 mb-6">GCC Dashboard</h1>
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
        {activeTab === "Shortlisted Agents" && <ShortlistedAgentsTab />}
        {activeTab === "Current Requests" && <CurrentRequestsTab />}
        {activeTab === "Problem Hub" && <ProblemHubTab />}
      </main>
    </>
  );
}
