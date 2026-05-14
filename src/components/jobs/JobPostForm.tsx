"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  JOB_CATEGORIES,
  JOB_SENIORITY_LEVELS,
  JOB_TYPES,
  JOB_WORKPLACE_TYPES,
  SALARY_TYPES,
} from "@/jobs/config";
import { getErrorMessage } from "@/lib/report-error";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ChevronDown, Loader2 } from "lucide-react";

const DEFAULT_FORM = {
  title: "",
  company_name: "",
  location: "",
  workplace_type: "remote",
  job_type: "full-time",
  seniority: "mid",
  category: "engineering",
  description: "",
  requirements: "",
  skills: "",
  salary_min: "",
  salary_max: "",
  salary_type: "annual",
  salary_currency: "USD",
  num_openings: "1",
  apply_url: "",
  deadline: "",
};

const RequiredDot = () => (
  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
);

export function JobPostForm({ companyName }: { companyName?: string | null }) {
  const router = useRouter();
  const createJob = useMutation(api.jobs.create);
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    company_name: companyName ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [salaryError, setSalaryError] = useState("");

  const hasSalaryMin = form.salary_min.trim() !== "";
  const hasSalaryMax = form.salary_max.trim() !== "";
  const hasSalaryRange = hasSalaryMin && hasSalaryMax;
  const hasPartialSalaryRange = hasSalaryMin !== hasSalaryMax;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSalaryError("");

    if (hasPartialSalaryRange) {
      setSalaryError("Enter both salary min and salary max, or leave compensation blank.");
      return;
    }

    setIsSubmitting(true);
    setIsSubmitted(false);
    setError("");

    try {
      const salaryFields = hasSalaryRange
        ? {
            salary_min: Number(form.salary_min),
            salary_max: Number(form.salary_max),
            salary_type: form.salary_type,
            salary_currency: form.salary_currency,
          }
        : {};

      await createJob({
        title: form.title,
        company_name: form.company_name,
        location: form.location,
        workplace_type: form.workplace_type,
        job_type: form.job_type,
        seniority: form.seniority,
        category: form.category,
        description: form.description,
        requirements: form.requirements || undefined,
        skills: form.skills
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        ...salaryFields,
        num_openings: form.num_openings ? Number(form.num_openings) : undefined,
        apply_url: form.apply_url || undefined,
        deadline: form.deadline
          ? new Date(`${form.deadline}T23:59:59`).getTime()
          : undefined,
      });
      setIsSubmitted(true);
      router.replace("/jobs/dashboard?created=1");
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't create the job. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-enterprise-950">Post a job</h1>
          <p className="mt-2 text-sm text-enterprise-600">
            Jobs are reviewed by our team before going live.
          </p>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Heads up:</span> Once submitted, jobs cannot be edited. Please review all details carefully before submitting. Approved jobs can be closed from your dashboard.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {isSubmitted ? (
          <p className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Job submitted for review. Taking you to your dashboard...
          </p>
        ) : null}

        {/* Section 1: Job Details */}
        <div className="rounded-2xl border border-enterprise-100 bg-enterprise-50/50 p-6">
          <h2 className="font-display text-lg font-semibold text-enterprise-900 mb-4">Job Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={<>Job title <RequiredDot /></>}>
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className={inputClassName}
              />
            </Field>
            <Field label={<>Company name <RequiredDot /></>}>
              <input
                required
                value={form.company_name}
                onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                className={inputClassName}
              />
            </Field>
            <Field label={<>Location <RequiredDot /></>}>
              <input
                required
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                className={inputClassName}
              />
            </Field>
            <Field label="Category">
              <SelectWrapper>
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className={selectClassName}
                >
                  {JOB_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Workplace type">
              <SelectWrapper>
                <select
                  value={form.workplace_type}
                  onChange={(event) => setForm({ ...form, workplace_type: event.target.value })}
                  className={selectClassName}
                >
                  {JOB_WORKPLACE_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Job type">
              <SelectWrapper>
                <select
                  value={form.job_type}
                  onChange={(event) => setForm({ ...form, job_type: event.target.value })}
                  className={selectClassName}
                >
                  {JOB_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Seniority">
              <SelectWrapper>
                <select
                  value={form.seniority}
                  onChange={(event) => setForm({ ...form, seniority: event.target.value })}
                  className={selectClassName}
                >
                  {JOB_SENIORITY_LEVELS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Openings">
              <input
                type="number"
                min={1}
                value={form.num_openings}
                onChange={(event) => setForm({ ...form, num_openings: event.target.value })}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>

        {/* Section 2: Compensation */}
        <div className="mt-6 rounded-2xl border border-enterprise-100 bg-enterprise-50/50 p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-enterprise-900">
                Compensation
              </h2>
              <p className="mt-1 text-xs text-enterprise-500">
                Optional. Leave the range blank if you do not want to publish salary.
              </p>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-enterprise-400">
              Optional
            </span>
          </div>
          {salaryError ? (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {salaryError}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Salary min (optional)">
              <input
                type="number"
                min={0}
                value={form.salary_min}
                onChange={(event) => {
                  setForm({ ...form, salary_min: event.target.value });
                  setSalaryError("");
                }}
                className={inputClassName}
                placeholder="Leave blank"
              />
            </Field>
            <Field label="Salary max (optional)">
              <input
                type="number"
                min={0}
                value={form.salary_max}
                onChange={(event) => {
                  setForm({ ...form, salary_max: event.target.value });
                  setSalaryError("");
                }}
                className={inputClassName}
                placeholder="Leave blank"
              />
            </Field>
            <Field label="Salary type">
              <SelectWrapper>
                <select
                  value={form.salary_type}
                  onChange={(event) => setForm({ ...form, salary_type: event.target.value })}
                  className={selectClassName}
                  disabled={!hasSalaryRange}
                >
                  {SALARY_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </Field>
            <Field label="Currency">
              <input
                value={form.salary_currency}
                onChange={(event) => setForm({ ...form, salary_currency: event.target.value.toUpperCase() })}
                className={inputClassName}
                maxLength={3}
                disabled={!hasSalaryRange}
              />
            </Field>
          </div>
        </div>

        {/* Section 3: Role Description */}
        <div className="mt-6 rounded-2xl border border-enterprise-100 bg-enterprise-50/50 p-6">
          <h2 className="font-display text-lg font-semibold text-enterprise-900 mb-4">Role Description</h2>
          <div className="grid gap-4">
            <Field label="Skills">
              <input
                value={form.skills}
                onChange={(event) => setForm({ ...form, skills: event.target.value })}
                className={inputClassName}
                placeholder="Python, LLMs, product analytics"
              />
              <p className="mt-1 text-xs text-enterprise-500">
                Comma-separated list of skills relevant to this role.
              </p>
            </Field>
            <Field label={<>Description <RequiredDot /></>}>
              <textarea
                required
                rows={8}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className={inputClassName}
              />
              <p className="mt-1 text-xs text-enterprise-400">{form.description.length} characters · Aim for 200–1,000</p>
            </Field>
            <Field label="Requirements">
              <textarea
                rows={5}
                value={form.requirements}
                onChange={(event) => setForm({ ...form, requirements: event.target.value })}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>

        {/* Section 4: Application Settings */}
        <div className="mt-6 rounded-2xl border border-enterprise-100 bg-enterprise-50/50 p-6">
          <h2 className="font-display text-lg font-semibold text-enterprise-900 mb-4">Application Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="External apply URL">
              <input
                value={form.apply_url}
                onChange={(event) => setForm({ ...form, apply_url: event.target.value })}
                className={inputClassName}
                placeholder="https://company.com/jobs/..."
              />
              <p className="mt-1 text-xs text-enterprise-500">
                If set, candidates will be directed to this URL instead of applying in-platform.
              </p>
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSubmitting || isSubmitted}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : isSubmitted ? (
              "Redirecting…"
            ) : (
              "Submit for review"
            )}
          </Button>
        </div>
      </form>
    </AnimatedSection>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-display mb-2 block text-sm font-medium text-enterprise-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-enterprise-400" />
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-enterprise-100 disabled:text-enterprise-400";

const selectClassName =
  "w-full appearance-none cursor-pointer rounded-2xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 pr-10 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-enterprise-100 disabled:text-enterprise-400";
