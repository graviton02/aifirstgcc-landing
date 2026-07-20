"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/report-error";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  CANDIDATE_LEAD_DEFAULT_SOURCE,
  CANDIDATE_LEAD_STORAGE_KEY,
  JOB_CATEGORIES,
  JOB_CATEGORY_LABELS,
  JOB_EXPERIENCE_LABELS,
  JOB_EXPERIENCE_LEVELS,
} from "@/jobs/config";

type Step = 1 | 2 | "done";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CandidateSignupHero() {
  const searchParams = useSearchParams();
  const submitLead = useMutation(api.candidateLeads.submitCandidateLead);

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    current_title: "",
    years_experience: "",
    job_category: "",
    profile_url: "",
  });

  // Returning campaign traffic shouldn't be asked twice.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(CANDIDATE_LEAD_STORAGE_KEY)) {
        setStep("done");
      }
    } catch {
      // Private browsing or blocked storage — just show the form.
    }
  }, []);

  const handleContinue = () => {
    if (form.full_name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await submitLead({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        current_title: form.current_title.trim(),
        years_experience: form.years_experience,
        job_category: form.job_category,
        profile_url: form.profile_url.trim() || undefined,
        source: searchParams.get("src") ?? CANDIDATE_LEAD_DEFAULT_SOURCE,
        user_agent:
          typeof navigator === "undefined" ? undefined : navigator.userAgent,
      });

      try {
        window.localStorage.setItem(
          CANDIDATE_LEAD_STORAGE_KEY,
          form.email.trim().toLowerCase()
        );
      } catch {
        // Storage is best-effort; the lead is already saved server-side.
      }

      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't add you to the list."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection>
      <section className="noise-texture relative overflow-hidden rounded-[32px] border border-enterprise-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_45%,_#f3f4f6_100%)] px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full bg-blue-200/40 blur-2xl sm:block" />
        <div className="absolute left-6 bottom-6 hidden h-32 w-32 rounded-full bg-purple-200/30 blur-3xl sm:block" />

        <Link
          href="/jobs/post"
          className="absolute right-6 top-6 z-10 hidden text-sm font-medium text-enterprise-600 transition-colors hover:text-blue-700 sm:block"
        >
          Hiring instead? Post a job &rarr;
        </Link>

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            AI Talent for GCCs
          </div>

          {step === "done" ? (
            <DoneState />
          ) : (
            <>
              <h1 className="mt-5 font-display text-display-sm font-bold tracking-tight text-enterprise-950 sm:text-display-md">
                Get notified when AI roles open at GCCs
              </h1>
              <p className="mt-4 text-base leading-7 text-enterprise-700 sm:text-lg">
                Tell us who you are and what you do. We&rsquo;ll email you when a
                Global Capability Center posts a role that matches.
              </p>

              <StepDots step={step} />

              {error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6 grid gap-4 sm:max-w-lg"
                  >
                    <Field label="Name" htmlFor="candidate-name">
                      <input
                        id="candidate-name"
                        value={form.full_name}
                        onChange={(event) =>
                          setForm({ ...form, full_name: event.target.value })
                        }
                        placeholder="Your full name"
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Email" htmlFor="candidate-email">
                      <input
                        id="candidate-email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm({ ...form, email: event.target.value })
                        }
                        placeholder="you@example.com"
                        className={inputClassName}
                      />
                    </Field>
                    <div>
                      <Button
                        type="button"
                        onClick={handleContinue}
                        className="w-full rounded-2xl sm:w-auto"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="step-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSubmit}
                    className="mt-6 grid gap-4 sm:max-w-lg"
                  >
                    <Field label="Current job title" htmlFor="candidate-title">
                      <input
                        id="candidate-title"
                        required
                        value={form.current_title}
                        onChange={(event) =>
                          setForm({ ...form, current_title: event.target.value })
                        }
                        placeholder="e.g. Senior ML Engineer"
                        className={inputClassName}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Years of experience"
                        htmlFor="candidate-experience"
                      >
                        <select
                          id="candidate-experience"
                          required
                          value={form.years_experience}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              years_experience: event.target.value,
                            })
                          }
                          className={inputClassName}
                        >
                          <option value="">Select</option>
                          {JOB_EXPERIENCE_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {JOB_EXPERIENCE_LABELS[level]}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        label="What kind of role?"
                        htmlFor="candidate-category"
                      >
                        <select
                          id="candidate-category"
                          required
                          value={form.job_category}
                          onChange={(event) =>
                            setForm({ ...form, job_category: event.target.value })
                          }
                          className={inputClassName}
                        >
                          <option value="">Select</option>
                          {JOB_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {JOB_CATEGORY_LABELS[category]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field
                      label="LinkedIn or resume link (optional)"
                      htmlFor="candidate-profile"
                    >
                      <input
                        id="candidate-profile"
                        value={form.profile_url}
                        onChange={(event) =>
                          setForm({ ...form, profile_url: event.target.value })
                        }
                        placeholder="https://www.linkedin.com/in/you"
                        className={inputClassName}
                      />
                    </Field>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-2xl"
                      >
                        {isSubmitting ? "Adding you…" : "Join the list"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setStep(1);
                        }}
                        className="text-sm font-medium text-enterprise-600 transition-colors hover:text-blue-700"
                      >
                        Back
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}

function DoneState() {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-7 w-7 text-blue-600" />
        <h1 className="font-display text-display-sm font-bold tracking-tight text-enterprise-950">
          You&rsquo;re on the list
        </h1>
      </div>
      <p className="mt-4 max-w-xl text-base leading-7 text-enterprise-700">
        We&rsquo;ll email you when a Global Capability Center posts a role that
        matches what you told us. In the meantime, everything currently open is
        below.
      </p>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const onStepTwo = step === 2;
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
      <div
        className={`h-0.5 w-12 rounded-full transition-colors duration-300 ${
          onStepTwo
            ? "bg-gradient-to-r from-blue-600 to-purple-600"
            : "bg-enterprise-200"
        }`}
      />
      <div
        className={`h-3 w-3 rounded-full transition-colors duration-300 ${
          onStepTwo
            ? "bg-gradient-to-r from-blue-600 to-purple-600"
            : "bg-enterprise-200"
        }`}
      />
      <span className="ml-1 text-xs font-medium text-enterprise-500">
        Step {onStepTwo ? 2 : 1} of 2
      </span>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-display text-sm font-medium text-enterprise-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
