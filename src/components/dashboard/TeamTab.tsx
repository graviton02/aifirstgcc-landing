"use client";

import { useState } from "react";
import { Loader2, Users, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type TeamTabProps = {
  companyId: string;
  membershipRole: "owner" | "member";
};

export function TeamTab({ companyId, membershipRole }: TeamTabProps) {
  const members = useQuery(api.companyMembers.getMembers, { company_id: companyId as any });
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageTeam = membershipRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !canManageTeam) return;

    setIsInviting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/provider-team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "We couldn't send that invite.");
      }

      setEmail("");
      setShowInvite(false);
      setSuccess("Invite sent. The teammate will appear as pending until they accept it.");
    } catch (err: any) {
      setError(err?.message || "We couldn't send that invite.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!canManageTeam) return;

    setIsRemovingId(memberId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/provider-team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "We couldn't remove that team member.");
      }

      setSuccess("Team member removed.");
    } catch (err: any) {
      setError(err?.message || "We couldn't remove that team member.");
    } finally {
      setIsRemovingId(null);
    }
  };

  if (members === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-enterprise-900">Team Members</h3>
        {canManageTeam && (
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowInvite(!showInvite);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            Invite
          </button>
        )}
      </div>

      {!canManageTeam && (
        <div className="mb-6 rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-600">
          Only company owners can invite or remove team members.
        </div>
      )}

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

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
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
                <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                  <span className={member.role === "owner" ? "text-primary" : "text-enterprise-500"}>
                    {member.role}
                  </span>
                  <span className={member.status === "active" ? "text-green-600" : "text-amber-600"}>
                    {member.status}
                  </span>
                </div>
              </div>
              {canManageTeam && member.role !== "owner" && (
                <button
                  onClick={() => handleRemove(member._id)}
                  disabled={isRemovingId === member._id}
                  className="p-2 text-enterprise-400 hover:text-red-500 transition-colors"
                >
                  {isRemovingId === member._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
