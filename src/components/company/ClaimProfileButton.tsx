"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

interface Props {
  companySlug: string;
  claimStatus?: string;
}

export function ClaimProfileButton({ companySlug, claimStatus }: Props) {
  if (claimStatus === "claimed") return null;

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-medium text-enterprise-900">Is this your company?</p>
          <p className="text-sm text-enterprise-600 mt-1">
            Claim this profile to manage your company page and agent listings.
          </p>
          <Link
            href={`/claim/${companySlug}`}
            className="inline-block mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Claim This Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
