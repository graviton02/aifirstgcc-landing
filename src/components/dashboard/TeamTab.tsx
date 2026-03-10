"use client";

import { useState } from "react";
import { Loader2, Users, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function TeamTab({ companyId }: { companyId: string }) {
  const members = useQuery(api.companyMembers.getMembers, { company_id: companyId as any });
  const inviteMember = useMutation(api.companyMembers.inviteMember);
  const removeMember = useMutation(api.companyMembers.removeMember);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsInviting(true);
    try {
      await inviteMember({ company_id: companyId as any, email });
      setEmail("");
      setShowInvite(false);
    } finally {
      setIsInviting(false);
    }
  };

  if (members === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-enterprise-900">Team Members</h3>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="p-4 bg-enterprise-50 rounded-xl mb-6 flex gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 border border-enterprise-300 rounded-lg"
          />
          <button type="submit" disabled={isInviting}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {isInviting ? "Inviting..." : "Send Invite"}
          </button>
        </form>
      )}

      {!members.length ? (
        <div className="text-center py-12 text-enterprise-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No team members yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member: any) => (
            <div key={member._id} className="p-4 bg-white border border-enterprise-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-enterprise-900">{member.email || member.user_id}</p>
                <span className={`text-xs font-medium ${member.role === "owner" ? "text-primary" : "text-enterprise-500"}`}>
                  {member.role}
                </span>
              </div>
              {member.role !== "owner" && (
                <button
                  onClick={() => removeMember({ member_id: member._id })}
                  className="p-2 text-enterprise-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
