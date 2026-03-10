"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AdminCompanyEditsTab({ token }: { token: string }) {
  const edits = useQuery(api.admin.getPendingCompanyEdits, { token });
  const approveEdit = useMutation(api.admin.approveCompanyEdit);
  const rejectEdit = useMutation(api.admin.rejectCompanyEdit);

  if (edits === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!edits.length) {
    return <p className="text-enterprise-500 py-8 text-center">No pending company edits.</p>;
  }

  return (
    <div className="space-y-3">
      {edits.map((edit: any) => (
        <div key={edit._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-enterprise-900">Company Edit</p>
              <pre className="text-xs bg-enterprise-50 p-2 rounded mt-2 max-w-lg overflow-auto">
                {JSON.stringify(edit.changes, null, 2)}
              </pre>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveEdit({ edit_id: edit._id, token })}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                <CheckCircle className="w-5 h-5" />
              </button>
              <button onClick={() => rejectEdit({ edit_id: edit._id, token })}
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
