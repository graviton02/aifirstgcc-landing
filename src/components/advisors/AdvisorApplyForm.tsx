"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/report-error";
import {
  ADVISOR_EXPERTISE_AREAS,
  ADVISOR_EXPERIENCE_LEVELS,
  ADVISOR_BIO_MAX_LENGTH,
  ADVISOR_BIO_MIN_LENGTH,
} from "@/advisors/config";

const LINKEDIN_URL_PATTERN = /^https?:\/\/([a-z0-9-]+\.)*linkedin\.com\/.+/i;

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
    hasError ? "border-red-400" : "border-enterprise-300"
  }`;

export function AdvisorApplyForm() {
  const router = useRouter();
  const submitApplication = useMutation(api.advisors.submitAdvisorApplication);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    linkedin_url: "",
    headline: "",
    years_experience: "",
    bio: "",
  });
  const [expertise, setExpertise] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleExpertise = (area: string) => {
    setExpertise((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
    if (errors.expertise) setErrors((prev) => ({ ...prev, expertise: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.full_name.trim().length < 2) {
      next.full_name = "Please enter your full name.";
    }
    const email = form.email.trim();
    if (!email.includes("@") || !email.includes(".")) {
      next.email = "Please enter a valid email address.";
    }
    if (!LINKEDIN_URL_PATTERN.test(form.linkedin_url.trim())) {
      next.linkedin_url =
        "Enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/your-name).";
    }
    if (form.headline.trim().length < 2) {
      next.headline = "Please enter your current role or headline.";
    }
    if (!form.years_experience) {
      next.years_experience = "Please select your experience level.";
    }
    if (expertise.length === 0) {
      next.expertise = "Please select at least one expertise area.";
    }
    const bioLen = form.bio.trim().length;
    if (bioLen < ADVISOR_BIO_MIN_LENGTH) {
      next.bio = `Please write at least ${ADVISOR_BIO_MIN_LENGTH} characters.`;
    } else if (bioLen > ADVISOR_BIO_MAX_LENGTH) {
      next.bio = `Please keep your bio under ${ADVISOR_BIO_MAX_LENGTH} characters.`;
    }
    if (!consent) {
      next.consent = "Please confirm your consent to a public profile listing.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitApplication({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        linkedin_url: form.linkedin_url.trim(),
        headline: form.headline.trim(),
        years_experience: form.years_experience,
        expertise_areas: expertise,
        bio: form.bio.trim(),
        consent,
        user_agent:
          typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      });
      router.push("/advisors/apply/success");
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "Something went wrong. Please try again in a moment.")
      );
      setIsSubmitting(false);
    }
  };

  const bioCount = form.bio.trim().length;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-enterprise-200 p-6 md:p-8 shadow-sm space-y-5"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="advisor-name"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Full name
          </label>
          <input
            id="advisor-name"
            type="text"
            autoComplete="name"
            value={form.full_name}
            onChange={(e) => setField("full_name", e.target.value)}
            className={inputClass(!!errors.full_name)}
          />
          {errors.full_name && (
            <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="advisor-email"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Email
          </label>
          <input
            id="advisor-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="advisor-linkedin"
          className="block text-sm font-medium text-enterprise-700 mb-1"
        >
          LinkedIn profile URL
        </label>
        <input
          id="advisor-linkedin"
          type="url"
          inputMode="url"
          placeholder="https://www.linkedin.com/in/your-name"
          value={form.linkedin_url}
          onChange={(e) => setField("linkedin_url", e.target.value)}
          className={inputClass(!!errors.linkedin_url)}
        />
        {errors.linkedin_url && (
          <p className="text-sm text-red-600 mt-1">{errors.linkedin_url}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="advisor-headline"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Current role / headline
          </label>
          <input
            id="advisor-headline"
            type="text"
            placeholder="e.g. Fractional Head of AI"
            value={form.headline}
            onChange={(e) => setField("headline", e.target.value)}
            className={inputClass(!!errors.headline)}
          />
          {errors.headline && (
            <p className="text-sm text-red-600 mt-1">{errors.headline}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="advisor-experience"
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Years of AI/tech experience
          </label>
          <select
            id="advisor-experience"
            value={form.years_experience}
            onChange={(e) => setField("years_experience", e.target.value)}
            className={`${inputClass(!!errors.years_experience)} bg-white`}
          >
            <option value="">Select…</option>
            {ADVISOR_EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {errors.years_experience && (
            <p className="text-sm text-red-600 mt-1">{errors.years_experience}</p>
          )}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-enterprise-700 mb-2">
          Expertise areas
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ADVISOR_EXPERTISE_AREAS.map((area) => {
            const checked = expertise.includes(area);
            return (
              <label
                key={area}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  checked
                    ? "border-purple-500 bg-purple-50 text-enterprise-900"
                    : "border-enterprise-300 text-enterprise-700 hover:bg-enterprise-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-enterprise-300 text-purple-600 focus:ring-purple-500"
                  checked={checked}
                  onChange={() => toggleExpertise(area)}
                />
                {area}
              </label>
            );
          })}
        </div>
        {errors.expertise && (
          <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="advisor-bio"
          className="block text-sm font-medium text-enterprise-700 mb-1"
        >
          Short bio
        </label>
        <textarea
          id="advisor-bio"
          rows={4}
          maxLength={ADVISOR_BIO_MAX_LENGTH}
          placeholder="A few sentences on your AI experience and what you advise on."
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          className={inputClass(!!errors.bio)}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.bio ? (
            <p className="text-sm text-red-600">{errors.bio}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-enterprise-500">
            {bioCount}/{ADVISOR_BIO_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-enterprise-700 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-enterprise-300 text-purple-600 focus:ring-purple-500"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
            }}
          />
          <span>
            I consent to Orbys360 creating a public advisor profile from this
            application once approved, so GCC leaders can discover me.
          </span>
        </label>
        {errors.consent && (
          <p className="text-sm text-red-600 mt-1">{errors.consent}</p>
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
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Submitting…" : "Submit application"}
      </button>

      <p className="text-xs text-enterprise-500 text-center">
        We review every application. Approved advisors are contacted before going live.
      </p>
    </form>
  );
}
