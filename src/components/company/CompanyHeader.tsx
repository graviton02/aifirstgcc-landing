"use client";

import { Star } from "@phosphor-icons/react";
import { CompanyLogo } from "@/components/directory/CompanyLogo";
import { ReachoutRequestButton } from "@/components/reachout/ReachoutRequestButton";
import type { Agent, Company } from "@/lib/types";

interface Props {
  company: Company & {
    founded_year?: number;
  };
  agents?: Array<Pick<Agent, "_id" | "agent_name" | "status">>;
  reviewSummary?: {
    overallRating: number | null;
    reviewCount: number;
  } | null;
}

export function CompanyHeader({ company, agents = [], reviewSummary }: Props) {
  const foundedYear = company.founded ?? company.founded_year;
  const primaryVerticals = company.primary_verticals ?? [];

  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo company={company as any} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">{company.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-enterprise-500">
            {company.headquarters && <span>{company.headquarters}</span>}
            {foundedYear ? <span>Founded {foundedYear}</span> : null}
          </div>
          {(reviewSummary?.reviewCount ?? 0) > 0 && reviewSummary?.overallRating ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-enterprise-600">
              <Star weight="fill" className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-enterprise-900">
                {reviewSummary.overallRating.toFixed(1)}
              </span>
              <span>
                ({reviewSummary.reviewCount} review
                {reviewSummary.reviewCount === 1 ? "" : "s"})
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {company.description && (
        <p className="text-enterprise-700 leading-relaxed mb-4">{company.description}</p>
      )}
      {primaryVerticals.length > 0 && (
        <div className="mb-4 space-y-3">
          {primaryVerticals.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-500">
                Primary Verticals
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {primaryVerticals.map((vertical) => (
                  <span
                    key={vertical}
                    className="rounded-full bg-enterprise-100 px-2.5 py-1 text-xs font-medium text-enterprise-700"
                  >
                    {vertical}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div className="flex items-center gap-3">
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Visit website
          </a>
        )}
        <ReachoutRequestButton
          company={company}
          agents={agents}
          requestSource="company_profile"
          managedLabel="Contact Company"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        />
      </div>
    </div>
  );
}
