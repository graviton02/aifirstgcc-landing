"use client";

import { Loader2, Building2, Bot, Users, Shield } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminOverviewTab({ token }: { token: string }) {
  const stats = useQuery(api.admin.getDirectoryStats, { token });

  if (stats === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  const cards = [
    { label: "Total Agents", value: stats.totalAgents, icon: Bot, color: "text-blue-600 bg-blue-50" },
    { label: "Total Companies", value: stats.totalCompanies, icon: Building2, color: "text-purple-600 bg-purple-50" },
    { label: "Claimed %", value: `${stats.claimedPercent}%`, icon: Shield, color: "text-green-600 bg-green-50" },
    { label: "Total GCCs", value: stats.totalGCCs, icon: Users, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
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
  );
}
