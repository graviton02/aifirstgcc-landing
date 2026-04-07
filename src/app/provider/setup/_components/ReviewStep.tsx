"use client";

import { ArrowRight, Loader2, Pencil } from "lucide-react";
import { CompanyLogo } from "@/components/directory/CompanyLogo";
import type { AgentFormData } from "@/lib/agentSubmission";
import { SummaryItem } from "./shared";

interface ReviewStepProps {
  companyForm: {
    contact_email: string;
    company_name: string;
    website: string;
    description: string;
    headquarters: string;
    logo_storage_id: string;
    logo_url: string;
    logo_bg: "" | "dark";
    primary_verticals: string;
  };
  agentForm: AgentFormData;
  onEditCompany: () => void;
  onEditAgent: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: string;
}

export function ReviewStep({
  companyForm,
  agentForm,
  onEditCompany,
  onEditAgent,
  onSubmit,
  isSubmitting,
  submitError,
}: ReviewStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Company Summary Card */}
      <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <CompanyLogo
              company={{
                name: companyForm.company_name || "Your Company",
                logo_url: companyForm.logo_url || undefined,
                logo_bg: companyForm.logo_bg || undefined,
              }}
              size="md"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-enterprise-500">
                Company Details
              </p>
              <h3 className="mt-1 text-lg font-semibold text-enterprise-900">
                {companyForm.company_name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onEditCompany}
            className="inline-flex items-center gap-2 rounded-lg border border-enterprise-300 px-3 py-1.5 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Contact Email" value={companyForm.contact_email} />
          <SummaryItem label="Website" value={companyForm.website} />
          <SummaryItem label="Headquarters" value={companyForm.headquarters} />
          <SummaryItem
            label="Logo Background"
            value={companyForm.logo_bg === "dark" ? "Dark background" : "Standard background"}
          />
          <SummaryItem
            label="Primary Verticals"
            value={companyForm.primary_verticals}
            className="md:col-span-2"
          />
          <SummaryItem
            label="Description"
            value={companyForm.description}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Agent Summary Card */}
      <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-enterprise-500">
              First Agent
            </p>
            <h3 className="mt-1 text-lg font-semibold text-enterprise-900">
              {agentForm.agent_name || "Untitled Agent"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onEditAgent}
            className="inline-flex items-center gap-2 rounded-lg border border-enterprise-300 px-3 py-1.5 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Category" value={agentForm.category} />
          <SummaryItem label="Tagline" value={agentForm.tagline} />
          <SummaryItem
            label="Functional Categories"
            value={agentForm.functional_categories.join(", ")}
            className="md:col-span-2"
          />
          <SummaryItem
            label="Industry Categories"
            value={agentForm.industry_categories.join(", ")}
            className="md:col-span-2"
          />
          <SummaryItem
            label="Description"
            value={agentForm.description}
            className="md:col-span-2"
          />
          {agentForm.use_cases.length > 0 && agentForm.use_cases[0].title && (
            <SummaryItem
              label="Use Cases"
              value={agentForm.use_cases
                .filter((uc) => uc.title)
                .map((uc) => uc.title)
                .join(", ")}
              className="md:col-span-2"
            />
          )}
          {agentForm.integrations.length > 0 && (
            <SummaryItem
              label="Integrations"
              value={agentForm.integrations.join(", ")}
              className="md:col-span-2"
            />
          )}
          {agentForm.expected_outcomes.length > 0 && (
            <SummaryItem
              label="Expected Outcomes"
              value={agentForm.expected_outcomes.join(", ")}
              className="md:col-span-2"
            />
          )}
        </div>
      </div>

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-enterprise-500">
          Company approval creates your provider workspace. Agent review happens
          next.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit for Review
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
