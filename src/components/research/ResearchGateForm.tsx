"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Download, Loader2, Mail } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { isFreeEmailProvider } from "@/lib/email-validation";
import { getErrorMessage } from "@/lib/report-error";

const INDUSTRY_OPTIONS = [
  "Financial Services",
  "Technology",
  "Healthcare & Life Sciences",
  "Manufacturing",
  "Retail & E-commerce",
  "Energy & Utilities",
  "Telecommunications",
  "BPO / Services",
  "Consulting",
  "Government",
  "Other",
];

interface Props {
  reportSlug: string;
  reportTitle: string;
}

export function ResearchGateForm({ reportSlug, reportTitle }: Props) {
  const submitLead = useMutation(api.research.submitResearchLead);

  const [form, setForm] = useState({
    full_name: "",
    position: "",
    email: "",
    industry: "",
  });
  const [errors, setErrors] = useState({
    full_name: "",
    position: "",
    email: "",
    industry: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | { email: string }>(null);

  const validateName = (value: string) => {
    if (value.trim().length < 2) {
      setErrors((e) => ({ ...e, full_name: "Please enter your full name." }));
      return false;
    }
    if (value.includes("@")) {
      setErrors((e) => ({ ...e, full_name: "Please enter your name, not an email." }));
      return false;
    }
    setErrors((e) => ({ ...e, full_name: "" }));
    return true;
  };

  const validatePosition = (value: string) => {
    if (value.trim().length < 2) {
      setErrors((e) => ({ ...e, position: "Please enter your position or role." }));
      return false;
    }
    setErrors((e) => ({ ...e, position: "" }));
    return true;
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setErrors((e) => ({ ...e, email: "Please enter a valid email address." }));
      return false;
    }
    if (isFreeEmailProvider(trimmed)) {
      setErrors((e) => ({
        ...e,
        email: "Please use a company email address, not a free email provider.",
      }));
      return false;
    }
    setErrors((e) => ({ ...e, email: "" }));
    return true;
  };

  const validateIndustry = (value: string) => {
    if (!value) {
      setErrors((e) => ({ ...e, industry: "Please select your industry." }));
      return false;
    }
    setErrors((e) => ({ ...e, industry: "" }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameOk = validateName(form.full_name);
    const positionOk = validatePosition(form.position);
    const emailOk = validateEmail(form.email);
    const industryOk = validateIndustry(form.industry);
    if (!nameOk || !positionOk || !emailOk || !industryOk) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitLead({
        report_slug: reportSlug,
        full_name: form.full_name,
        position: form.position,
        email: form.email,
        industry: form.industry,
        user_agent:
          typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      });
      setSuccess({ email: form.email.trim().toLowerCase() });
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "Something went wrong. Please try again in a moment.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-enterprise-200 p-8 md:p-10 shadow-sm">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-enterprise-900 text-center mb-2">
          Check your inbox
        </h3>
        <p className="text-enterprise-600 text-center max-w-md mx-auto">
          We&apos;ve sent your copy of{" "}
          <span className="font-medium">{reportTitle}</span> to{" "}
          <span className="font-medium">{success.email}</span>. The download link will
          arrive within a few minutes — please check your spam folder if you don&apos;t
          see it.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-enterprise-200 p-6 md:p-8 shadow-sm space-y-5"
    >
      <div>
        <h3 className="text-2xl font-bold text-enterprise-900">
          Access the research report
        </h3>
        <p className="text-enterprise-600 mt-1 text-sm">
          Complete the form and we&apos;ll send a download link to your inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="research-name"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Full name
          </label>
          <input
            id="research-name"
            type="text"
            required
            value={form.full_name}
            onChange={(e) => {
              setForm({ ...form, full_name: e.target.value });
              if (errors.full_name) validateName(e.target.value);
            }}
            onBlur={(e) => validateName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.full_name ? "border-red-400" : "border-enterprise-300"
            }`}
            placeholder="Jane Doe"
          />
          {errors.full_name && (
            <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="research-position"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Position
          </label>
          <input
            id="research-position"
            type="text"
            required
            value={form.position}
            onChange={(e) => {
              setForm({ ...form, position: e.target.value });
              if (errors.position) validatePosition(e.target.value);
            }}
            onBlur={(e) => validatePosition(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.position ? "border-red-400" : "border-enterprise-300"
            }`}
            placeholder="Director, GCC Operations"
          />
          {errors.position && (
            <p className="text-sm text-red-600 mt-1">{errors.position}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="research-email"
          className="block text-sm font-medium text-enterprise-700 mb-1"
        >
          Company email
        </label>
        <input
          id="research-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (errors.email || e.target.value.includes("@")) {
              validateEmail(e.target.value);
            }
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            errors.email ? "border-red-400" : "border-enterprise-300"
          }`}
          placeholder="you@company.com"
        />
        {errors.email ? (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        ) : (
          <p className="text-xs text-enterprise-500 mt-1">
            A corporate email address is required.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="research-industry"
          className="block text-sm font-medium text-enterprise-700 mb-1"
        >
          Industry
        </label>
        <select
          id="research-industry"
          required
          value={form.industry}
          onChange={(e) => {
            setForm({ ...form, industry: e.target.value });
            if (errors.industry) validateIndustry(e.target.value);
          }}
          onBlur={(e) => validateIndustry(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            errors.industry ? "border-red-400" : "border-enterprise-300"
          }`}
        >
          <option value="">Select your industry…</option>
          {INDUSTRY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="text-sm text-red-600 mt-1">{errors.industry}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-enterprise-900 text-white rounded-lg font-medium hover:bg-enterprise-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting request…
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Request access
          </>
        )}
      </button>

      <p className="text-xs text-enterprise-500 text-center leading-relaxed">
        By submitting this form, you consent to receive periodic research updates from
        Orbys360. You may unsubscribe at any time.
      </p>
    </form>
  );
}
