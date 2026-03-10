"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminClaimsTab({ token }: { token: string }) {
  const claims = useQuery(api.admin.getPendingClaims, { token });
  const approveClaim = useMutation(api.admin.approveClaim);
  const rejectClaim = useMutation(api.admin.rejectClaim);

  if (claims === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!claims.length) {
    return <p className="text-enterprise-500 py-8 text-center">No pending claims.</p>;
  }

  return (
    <div className="space-y-3">
      {claims.map((claim: any) => (
        <div key={claim._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-enterprise-900">{claim.full_name}</p>
              <p className="text-sm text-enterprise-600">{claim.company_email}</p>
              {claim.linkedin_url && <a href={claim.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">LinkedIn</a>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveClaim({ claim_id: claim._id, token })}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                <CheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => rejectClaim({ claim_id: claim._id, token })}
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
