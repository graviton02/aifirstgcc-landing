"use client";

import Link from "next/link";
import { CheckCircle, Shield } from "lucide-react";

interface Props {
  companySlug: string;
  claimStatus?: string;
}

export function ClaimProfileButton({ companySlug, claimStatus }: Props) {
  if (claimStatus === "claimed") {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="font-medium text-enterprise-900">Verified Company</p>
        </div>
      </div>
    );
  }

  if (claimStatus === "approved") {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-enterprise-900">
              This company profile has been claimed
            </p>
            <p className="text-sm text-enterprise-500 mt-0.5">
              The owner is setting up their account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (claimStatus === "pending") {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-enterprise-900">
              A claim is being reviewed for this company
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-enterprise-200/60 bg-white p-4">
      <p className="text-sm text-enterprise-700">
        Is this your company?{" "}
        <Link
          href={`/claim/${companySlug}`}
          className="font-medium text-primary hover:underline"
        >
          Claim &amp; customize your profile
        </Link>
      </p>
      <p className="text-xs italic text-enterprise-400 mt-1">
        This profile was created using publicly available information.
      </p>
    </div>
  );
}
