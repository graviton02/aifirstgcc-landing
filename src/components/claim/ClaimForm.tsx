"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isFreeEmailProvider } from "@/lib/email-validation";

interface Props {
  companySlug: string;
}

export function ClaimForm({ companySlug }: Props) {
  const router = useRouter();
  const company = useQuery(api.companies.getBySlug, { slug: companySlug });
  const submitClaim = useMutation(api.claims.submitClaim);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    company_email: "",
    linkedin_url: "",
  });

  const validateEmail = (email: string) => {
    if (isFreeEmailProvider(email)) {
      setEmailError("Please use a corporate email address, not a free email provider.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !validateEmail(form.company_email)) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitClaim({
        company_id: company._id,
        full_name: form.full_name,
        company_email: form.company_email,
        linkedin_url: form.linkedin_url || undefined,
      });
      router.push(`/companies/${companySlug}?claimed=pending`);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) {
    return <div className="text-center py-8 text-enterprise-500">Loading company...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-enterprise-900">Claim {company.name}</h1>
      <p className="text-enterprise-600">
        Verify your affiliation with {company.name} to manage this profile.
      </p>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-enterprise-700 mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="company_email" className="block text-sm font-medium text-enterprise-700 mb-1">
          Company Email
        </label>
        <input
          id="company_email"
          type="email"
          required
          value={form.company_email}
          onChange={(e) => {
            setForm({ ...form, company_email: e.target.value });
            if (emailError) validateEmail(e.target.value);
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            emailError ? "border-red-400" : "border-enterprise-300"
          }`}
        />
        {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
      </div>

      <div>
        <label htmlFor="linkedin_url" className="block text-sm font-medium text-enterprise-700 mb-1">
          LinkedIn URL <span className="text-enterprise-400">(optional)</span>
        </label>
        <input
          id="linkedin_url"
          type="url"
          value={form.linkedin_url}
          onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/your-profile"
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !!emailError}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Claim"}
      </button>
    </form>
  );
}
