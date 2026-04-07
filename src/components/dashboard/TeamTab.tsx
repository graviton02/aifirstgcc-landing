"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Plus,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type TeamTabProps = {
  companyId: string;
  membershipRole: "owner" | "member";
};

export function TeamTab({ companyId, membershipRole }: TeamTabProps) {
  const members = useQuery(api.companyMembers.getMembers, {
    company_id: companyId as any,
  });
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
      setSuccess(
        "Invite sent. The teammate will appear as pending until they accept it.",
      );
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
    return <TeamSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-enterprise-900">Team Members</h3>
          <span className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs text-enterprise-500">
            {members.length}
          </span>
        </div>
        {canManageTeam && (
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowInvite((prev) => !prev);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {!canManageTeam && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-enterprise-100 px-4 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-enterprise-500" />
          <span className="text-sm text-enterprise-600">
            Only company owners can invite or remove team members.
          </span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {showInvite && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleInvite}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-enterprise-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-enterprise-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!members.length ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
            <Users className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
            Your team
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-enterprise-500">
            Invite colleagues to help manage your company profile and agents.
          </p>
          {canManageTeam && (
            <button
              onClick={() => setShowInvite(true)}
              className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Invite a Team Member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member: any, index: number) => {
            const initial = (member.email || member.user_id || "?")
              .charAt(0)
              .toUpperCase();
            const isOwner = member.role === "owner";

            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent-purple/20 text-sm font-semibold text-primary">
                      {initial}
                    </div>
                    {isOwner && (
                      <Star className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-enterprise-900">
                      {member.email || member.user_id}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isOwner
                            ? "bg-primary/10 text-primary"
                            : "bg-enterprise-100 text-enterprise-600"
                        }`}
                      >
                        {member.role}
                      </span>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {member.status === "pending" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>

                {canManageTeam && !isOwner && (
                  <button
                    onClick={() => handleRemove(member._id)}
                    disabled={isRemovingId === member._id}
                    className="rounded-lg p-2 text-enterprise-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    {isRemovingId === member._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-36 animate-pulse rounded bg-enterprise-200" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-enterprise-200" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-enterprise-200" />
            <div className="flex-1">
              <div className="h-4 w-48 rounded bg-enterprise-200" />
              <div className="mt-2 h-3 w-24 rounded bg-enterprise-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
