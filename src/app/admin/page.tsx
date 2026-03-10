"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminClaimsTab } from "@/components/admin/AdminClaimsTab";
import { AdminCompanyEditsTab } from "@/components/admin/AdminCompanyEditsTab";
import { AdminAgentsTab } from "@/components/admin/AdminAgentsTab";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";

const TABS = ["Overview", "Claims", "Company Edits", "Agents"] as const;

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const login = useMutation(api.admin.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ password });
      setToken(result);
    } catch {
      setError("Invalid password");
    }
  };

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

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-enterprise-900 mb-6">Admin Dashboard</h1>
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
      {activeTab === "Overview" && <AdminOverviewTab token={token} />}
      {activeTab === "Claims" && <AdminClaimsTab token={token} />}
      {activeTab === "Company Edits" && <AdminCompanyEditsTab token={token} />}
      {activeTab === "Agents" && <AdminAgentsTab token={token} />}
    </main>
  );
}
