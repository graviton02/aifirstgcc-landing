"use client";

import { ArrowRight } from "lucide-react";
import { CompanyLogo } from "@/components/directory/CompanyLogo";
import { FormField } from "./shared";

interface CompanyInfoStepProps {
  formRef: React.Ref<HTMLFormElement>;
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
  setCompanyForm: React.Dispatch<
    React.SetStateAction<CompanyInfoStepProps["companyForm"]>
  >;
  onLogoFileChange: (file: File | null) => void;
  onContinue: () => void;
  validationError?: string;
  rejectionNotice?: string | null;
}

const inputClassName =
  "w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";

export function CompanyInfoStep({
  formRef,
  companyForm,
  setCompanyForm,
  onLogoFileChange,
  onContinue,
  validationError,
  rejectionNotice,
}: CompanyInfoStepProps) {
  const updateField = (
    field: keyof CompanyInfoStepProps["companyForm"],
    value: string,
  ) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
      {rejectionNotice && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {rejectionNotice}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
        className="grid gap-5 md:grid-cols-2"
      >
        <FormField label="Contact Email">
          <input
            type="email"
            required
            value={companyForm.contact_email}
            onChange={(e) => updateField("contact_email", e.target.value)}
            className={inputClassName}
            placeholder="you@company.com"
          />
        </FormField>

        <FormField label="Company Name">
          <input
            type="text"
            required
            value={companyForm.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
            className={inputClassName}
            placeholder="Acme AI Labs"
          />
        </FormField>

        <FormField label="Website">
          <input
            type="url"
            required
            value={companyForm.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={inputClassName}
            placeholder="https://acme.ai"
          />
        </FormField>

        <FormField label="Headquarters">
          <input
            type="text"
            required
            value={companyForm.headquarters}
            onChange={(e) => updateField("headquarters", e.target.value)}
            className={inputClassName}
            placeholder="Bengaluru, India"
          />
        </FormField>

        <FormField label="Company Logo">
          <input
            id="company-logo-upload"
            type="file"
            accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
            required={!companyForm.logo_url && !companyForm.logo_storage_id}
            onChange={(e) => onLogoFileChange(e.target.files?.[0] ?? null)}
            className={inputClassName}
          />
          <p className="mt-1 text-xs text-enterprise-500">
            Required. Upload an SVG, PNG, WEBP, or JPG file up to 5 MB.
          </p>
        </FormField>

        <FormField label="Logo Background Treatment">
          <label className="flex min-h-[42px] items-center gap-2 rounded-lg border border-enterprise-300 px-3 py-2 text-sm text-enterprise-700">
            <input
              type="checkbox"
              checked={companyForm.logo_bg === "dark"}
              onChange={(e) =>
                updateField("logo_bg", e.target.checked ? "dark" : "")
              }
              className="h-4 w-4 rounded border-enterprise-300 text-primary focus:ring-primary/30"
            />
            Use a dark background behind the logo
          </label>
        </FormField>

        <div className="md:col-span-2 rounded-xl border border-enterprise-200 bg-enterprise-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-enterprise-500">
            Logo Preview
          </p>
          <div className="mt-3 flex items-center gap-3">
            <CompanyLogo
              company={{
                name: companyForm.company_name || "Your Company",
                logo_url: companyForm.logo_url || undefined,
                logo_bg: companyForm.logo_bg || undefined,
              }}
              size="lg"
            />
            <p className="text-sm text-enterprise-600">
              {companyForm.logo_url
                ? "This preview will appear across your public profile and provider workspace after approval."
                : "Upload a company logo to preview how it will appear across the platform."}
            </p>
          </div>
        </div>

        <FormField label="Primary Verticals" className="md:col-span-2">
          <input
            type="text"
            required
            value={companyForm.primary_verticals}
            onChange={(e) => updateField("primary_verticals", e.target.value)}
            className={inputClassName}
            placeholder="Banking, Healthcare, Retail"
          />
          <p className="mt-1 text-xs text-enterprise-500">
            Separate multiple verticals with commas.
          </p>
        </FormField>

        <FormField label="Company Description" className="md:col-span-2">
          <textarea
            required
            rows={5}
            minLength={20}
            value={companyForm.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={inputClassName}
            placeholder="What does your company build, and which GCC problems do you solve?"
          />
        </FormField>

        {validationError ? (
          <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {validationError}
          </div>
        ) : null}

        <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-enterprise-500">
            Admin approval creates the live company profile and your owner
            membership.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
