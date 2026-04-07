"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isFreeEmailProvider } from "@/lib/email-validation";
import { isValidLinkedInProfileUrl } from "@/lib/linkedin-validation";
import { getErrorMessage } from "@/lib/report-error";
import { CheckCircle, Send } from "lucide-react";
import Link from "next/link";

interface Props {
  companySlug: string;
}

export function ClaimForm({ companySlug }: Props) {
  const company = useQuery(api.companies.getBySlug, { slug: companySlug });
  const submitClaim = useMutation(api.claims.submitClaim);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [linkedinError, setLinkedinError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    claimant_name: "",
    claimant_email: "",
    claimant_linkedin: "",
  });

  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Please enter your full name (at least 2 characters).");
      return false;
    }
    if (trimmed.includes("@")) {
      setNameError("Please enter your name, not an email address.");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateEmail = (email: string) => {
    const trimmed = email.trim();
    // Only validate if user has typed something with an @ sign
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("");
      return true; // Let HTML required handle empty
    }
    if (isFreeEmailProvider(trimmed)) {
      setEmailError("Please use a corporate email address, not a free email provider.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateLinkedIn = (linkedin: string) => {
    const trimmed = linkedin.trim();
    if (!trimmed) {
      setLinkedinError("Please enter your LinkedIn profile URL.");
      return false;
    }
    if (!isValidLinkedInProfileUrl(trimmed)) {
      setLinkedinError(
        "Enter a valid LinkedIn profile URL ending in /in/... or /pub/...."
      );
      return false;
    }
    setLinkedinError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !company ||
      !validateName(form.claimant_name) ||
      !validateEmail(form.claimant_email) ||
      !validateLinkedIn(form.claimant_linkedin)
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitClaim({
        company_id: company._id,
        claimant_name: form.claimant_name,
        claimant_email: form.claimant_email,
        claimant_linkedin: form.claimant_linkedin,
      });
      setSuccess(true);
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, "Failed to submit claim. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // useQuery returns undefined while loading, null if not found
  if (company === undefined) {
    return <div className="text-center py-8 text-enterprise-500">Loading company...</div>;
  }

  if (company === null) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-enterprise-900 mb-2">Company Not Found</h2>
        <p className="text-enterprise-600 mb-4">
          The company you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/directory"
          className="text-primary hover:underline text-sm"
        >
          Browse the Directory
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-enterprise-900 mb-2">Claim Submitted</h2>
        <p className="text-enterprise-600 mb-6">
          We&apos;ll review your claim for <span className="font-medium">{company.name}</span> and
          send you a link to access your dashboard at{" "}
          <span className="font-medium">{form.claimant_email}</span>.
        </p>
        <Link
          href={`/companies/${companySlug}`}
          className="inline-block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-center"
        >
          Back to {company.name}
        </Link>
        <Link
          href="/directory"
          className="inline-block text-sm text-primary hover:underline mt-3"
        >
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-enterprise-900">Claim {company.name}</h1>
        <p className="text-enterprise-600 mt-1">
          Verify your affiliation with {company.name} to manage this profile.
        </p>
      </div>

      <div>
        <label htmlFor="claimant_name" className="block text-sm font-medium text-enterprise-700 mb-1">
          Full Name
        </label>
        <input
          id="claimant_name"
          type="text"
          required
          value={form.claimant_name}
          onChange={(e) => {
            setForm({ ...form, claimant_name: e.target.value });
            if (nameError) validateName(e.target.value);
          }}
          onBlur={(e) => validateName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            nameError ? "border-red-400" : "border-enterprise-300"
          }`}
          placeholder="Your full name"
        />
        {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-enterprise-700 mb-1">
          Company
        </label>
        <input
          id="company_name"
          type="text"
          readOnly
          value={company.name}
          className="w-full px-3 py-2 border border-enterprise-200 rounded-lg bg-enterprise-50 text-enterprise-600 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="claimant_email" className="block text-sm font-medium text-enterprise-700 mb-1">
          Corporate Email
        </label>
        <input
          id="claimant_email"
          type="email"
          required
          value={form.claimant_email}
          onChange={(e) => {
            setForm({ ...form, claimant_email: e.target.value });
            // Validate in real-time once user types an @ or if there's an existing error
            if (emailError || e.target.value.includes("@")) {
              validateEmail(e.target.value);
            }
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            emailError ? "border-red-400" : "border-enterprise-300"
          }`}
          placeholder="you@company.com"
        />
        {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
      </div>

      <div>
        <label htmlFor="claimant_linkedin" className="block text-sm font-medium text-enterprise-700 mb-1">
          LinkedIn Profile
        </label>
        <input
          id="claimant_linkedin"
          type="url"
          required
          value={form.claimant_linkedin}
          onChange={(e) => {
            setForm({ ...form, claimant_linkedin: e.target.value });
            if (linkedinError || e.target.value.includes("linkedin.com")) {
              validateLinkedIn(e.target.value);
            }
          }}
          onBlur={(e) => validateLinkedIn(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            linkedinError ? "border-red-400" : "border-enterprise-300"
          }`}
          placeholder="https://www.linkedin.com/in/your-profile"
        />
        {linkedinError && <p className="text-sm text-red-600 mt-1">{linkedinError}</p>}
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !!emailError || !!linkedinError || !!nameError}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Claim
          </>
        )}
      </button>
    </form>
  );
}
