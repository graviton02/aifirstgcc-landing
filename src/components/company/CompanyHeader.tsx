"use client";

import { CompanyLogo } from "@/components/directory/CompanyLogo";
import { ReachoutRequestButton } from "@/components/reachout/ReachoutRequestButton";
import type { Agent, Company } from "@/lib/types";

interface Props {
  company: Company & {
    founded_year?: number;
  };
  agents?: Array<Pick<Agent, "_id" | "agent_name" | "status">>;
}

export function CompanyHeader({ company, agents = [] }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo company={company as any} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">{company.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-enterprise-500">
            {company.headquarters && <span>{company.headquarters}</span>}
            {(company.founded ?? company.founded_year) && (
              <span>Founded {company.founded ?? company.founded_year}</span>
            )}
          </div>
        </div>
      </div>
      {company.description && (
        <p className="text-enterprise-700 leading-relaxed mb-4">{company.description}</p>
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
