"use client";

import { Loader2, Building2, Bot, Users, Shield, FileText, Edit3, MessageSquare, Store } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminOverviewTab({
  token,
  onTabChange,
}: {
  token: string;
  onTabChange?: (tab: string) => void;
}) {
  const stats = useQuery(api.admin.getDirectoryStats, { token });

  if (stats === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Agents", value: stats.totalAgents, icon: Bot, color: "text-blue-600 bg-blue-50" },
    { label: "Total Companies", value: stats.totalCompanies, icon: Building2, color: "text-purple-600 bg-purple-50" },
    { label: "Claimed %", value: `${stats.claimedPercentage}%`, icon: Shield, color: "text-green-600 bg-green-50" },
    { label: "Total GCCs", value: stats.totalGCCs, icon: Users, color: "text-amber-600 bg-amber-50" },
  ];

  const pendingCards = [
    { label: "Claims", count: stats.pendingClaims, icon: Shield, tab: "Claims", color: "text-green-600 bg-green-50" },
    { label: "New Companies", count: stats.pendingCompanySubmissions, icon: Store, tab: "New Companies", color: "text-teal-600 bg-teal-50" },
    { label: "Company Edits", count: stats.pendingCompanyEdits, icon: Edit3, tab: "Company Edits", color: "text-purple-600 bg-purple-50" },
    { label: "Agents", count: stats.pendingAgentSubmissions, icon: Bot, tab: "Agents", color: "text-blue-600 bg-blue-50" },
    { label: "Agent Edits", count: stats.pendingAgentEdits, icon: FileText, tab: "Agent Edits", color: "text-indigo-600 bg-indigo-50" },
    { label: "Contact Requests", count: stats.pendingContactRequests, icon: MessageSquare, tab: "Contact Requests", color: "text-rose-600 bg-rose-50" },
  ];

  const totalPending = pendingCards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-6 bg-white border border-enterprise-200 rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-enterprise-900">{card.value}</p>
              <p className="text-sm text-enterprise-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending actions */}
      <div>
        <h2 className="text-lg font-semibold text-enterprise-900 mb-1 flex items-center gap-2">
          Pending Actions
          {totalPending > 0 && (
            <span className="text-sm font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {totalPending}
            </span>
          )}
        </h2>
        <p className="text-sm text-enterprise-500 mb-3">Click a card to jump to that section.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => onTabChange?.(card.tab)}
                className="p-4 bg-white border border-enterprise-200 rounded-xl text-left hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-enterprise-700">{card.label}</span>
                  </div>
                  {card.count > 0 ? (
                    <span className="text-lg font-bold text-amber-600">{card.count}</span>
                  ) : (
                    <span className="text-lg font-bold text-enterprise-300">0</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
