"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function CurrentRequestsTab() {
  const requests = useQuery(api.gcc.getMyContactRequests);

  if (requests === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!requests.length) {
    return (
      <div className="text-center py-12 text-enterprise-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No contact requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req: any) => (
        <div key={req._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-enterprise-900">{req.agent_name || "Agent"}</p>
              <p className="text-sm text-enterprise-500 mt-1">{req.message || "Contact request sent"}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              req.status === "approved" ? "bg-green-100 text-green-700" :
              req.status === "rejected" ? "bg-red-100 text-red-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {req.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
