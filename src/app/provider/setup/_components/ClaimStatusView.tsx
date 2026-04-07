"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { StatusCard } from "./shared";

interface ClaimStatusViewProps {
  claimRequest: {
    status: string;
    company_name: string;
    admin_notes?: string;
    magic_link_token?: string;
  } | null | undefined;
}

export function ClaimStatusView({ claimRequest }: ClaimStatusViewProps) {
  if (!claimRequest) {
    return (
      <StatusCard
        icon={ShieldCheck}
        title="No claim submitted yet"
        tone="neutral"
        body="Browse the directory to find your company. Once you submit a claim, this page will track the review and activation status."
        action={
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Browse Directory
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  if (claimRequest.status === "pending") {
    return (
      <StatusCard
        icon={Loader2}
        title={`Claim under review for ${claimRequest.company_name}`}
        tone="pending"
        body="Admin has your claim and the company listing stays reserved while it is being reviewed."
      />
    );
  }

  if (claimRequest.status === "approved") {
    return (
      <StatusCard
        icon={CheckCircle2}
        title={`Claim approved for ${claimRequest.company_name}`}
        tone="success"
        body="Finish activation to convert the approved claim into an active provider dashboard."
        action={
          claimRequest.magic_link_token ? (
            <Link
              href={`/claim/activate?token=${encodeURIComponent(claimRequest.magic_link_token)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Finish Activation
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />
    );
  }

  // rejected
  return (
    <StatusCard
      icon={Building2}
      title={`Claim rejected for ${claimRequest.company_name}`}
      tone="danger"
      body={
        claimRequest.admin_notes ||
        "Admin rejected this claim. You can try a different listing or contact support with more proof of ownership."
      }
      action={
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 rounded-lg border border-enterprise-300 px-4 py-2.5 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
        >
          Browse Directory Again
        </Link>
      }
    />
  );
}
