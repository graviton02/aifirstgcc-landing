"use client";

import { useQuery } from "convex/react";
import {
  Building2,
  Loader2,
  Mail,
  User2,
  BriefcaseBusiness,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";

export function ProfileTab() {
  const profile = useQuery(api.gccProfiles.getProfile);

  if (profile === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
        <h3 className="text-lg font-semibold text-enterprise-900">Profile unavailable</h3>
        <p className="mt-2 text-sm text-enterprise-600">
          Your GCC profile could not be loaded. Complete onboarding again if this persists.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-enterprise-900">Your GCC Profile</h3>
        <p className="mt-1 text-sm text-enterprise-600">
          This profile is shared with providers when you connect with them.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField
          icon={<User2 className="h-4 w-4 text-enterprise-400" />}
          label="Name"
          value={profile.name}
        />
        <ProfileField
          icon={<Mail className="h-4 w-4 text-enterprise-400" />}
          label="Work Email"
          value={profile.email}
        />
        <ProfileField
          icon={<Building2 className="h-4 w-4 text-enterprise-400" />}
          label="Organization"
          value={profile.organization}
        />
        <ProfileField
          icon={<BriefcaseBusiness className="h-4 w-4 text-enterprise-400" />}
          label="Industry"
          value={profile.industry}
        />
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-enterprise-50/60 px-4 py-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium text-enterprise-900">{value}</p>
    </div>
  );
}
