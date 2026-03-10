"use client";

import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminAgentsTab({ token }: { token: string }) {
  const pending = useQuery(api.admin.getPendingAgents, { token });
  const approve = useMutation(api.admin.approveAgent);
  const reject = useMutation(api.admin.rejectAgent);
  const requestChanges = useMutation(api.admin.requestChangesAgent);

  if (pending === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!pending.length) {
    return <p className="text-enterprise-500 py-8 text-center">No pending agent submissions.</p>;
  }

  return (
    <div className="space-y-3">
      {pending.map((agent: any) => (
        <div key={agent._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-enterprise-900">{agent.agent_name}</p>
              {agent.tagline && <p className="text-sm text-enterprise-600">{agent.tagline}</p>}
              <span className="text-xs text-primary mt-1 inline-block">{agent.category}</span>
              <p className="text-sm text-enterprise-700 mt-2 line-clamp-2">{agent.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve({ submission_id: agent._id, token })}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                <CheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => requestChanges({ submission_id: agent._id, token, feedback: "Please revise." })}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Request Changes">
                <AlertCircle className="w-5 h-5" />
              </button>
              <button onClick={() => reject({ submission_id: agent._id, token })}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
