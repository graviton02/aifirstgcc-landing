"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
} from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";
import {
  buildJobBoardSignInUrl,
  isValidLinkedInUrl,
  normalizeLinkedInUrl,
  sanitizeJobBoardReturnUrl,
} from "@/jobs/config";
import { validateResumeFile } from "@/lib/jobResumeUpload";
import { getErrorMessage } from "@/lib/report-error";
import { Navbar } from "@/components/shared/Navbar";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSalary(job: any) {
  if (typeof job.salary_min !== "number" || typeof job.salary_max !== "number")
    return null;
  const currency = job.salary_currency ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  const period = job.salary_type === "monthly" ? "/mo" : "/yr";
  return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}${period}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function JobApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { profile, role, isLoaded: roleLoaded } = useJobBoardRole();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const job = useQuery(
    api.jobs.getPublicBySlug,
    slug ? { slug } : "skip"
  );

  const returnUrl = sanitizeJobBoardReturnUrl(
    slug ? `/jobs/${slug}/apply` : "/jobs",
    "/jobs"
  );

  const alreadyApplied = useQuery(
    api.jobApplications.hasApplied,
    job && isSignedIn && role === "jobseeker"
      ? { job_id: job._id }
      : "skip"
  );

  // Auth redirects
  useEffect(() => {
    if (!authLoaded || !slug) return;
    if (!isSignedIn) {
      router.replace(buildJobBoardSignInUrl(returnUrl, "/jobs"));
      return;
    }
    if (!roleLoaded) return;
    if (!role) {
      router.replace(
        `/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
  }, [authLoaded, roleLoaded, isSignedIn, role, returnUrl, slug, router]);

  // Loading state
  if (
    !slug ||
    !authLoaded ||
    !roleLoaded ||
    !isSignedIn ||
    !role ||
    job === undefined
  ) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
          <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
        </div>
      </>
    );
  }

  // Job not found
  if (!job) {
    return (
      <>
        <Navbar />
        <div className="relative bg-enterprise-50 pb-16 pt-24 sm:pt-28">
          <Container size="narrow">
            <Breadcrumbs
              items={[
                { label: "Jobs", href: "/jobs" },
                { label: "Not found" },
              ]}
            />
            <div className="mt-6 rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-card">
              <h1 className="text-2xl font-semibold text-enterprise-950">
                Job not found
              </h1>
              <p className="mt-2 text-sm text-enterprise-600">
                This role may have been removed or is no longer listed.
              </p>
              <div className="mt-6">
                <Button asChild size="sm">
                  <Link href="/jobs">Browse open roles</Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  // Recruiter guard
  if (role === "recruiter") {
    return (
      <>
        <Navbar />
        <div className="relative bg-enterprise-50 pb-16 pt-24 sm:pt-28">
          <Container size="narrow">
            <Breadcrumbs
              items={[
                { label: "Jobs", href: "/jobs" },
                { label: job.title, href: `/jobs/${slug}` },
                { label: "Apply" },
              ]}
            />
            <div className="mt-6 rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-card">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-enterprise-300" />
              <h1 className="mt-4 text-xl font-semibold text-enterprise-950">
                Recruiter accounts cannot apply
              </h1>
              <p className="mt-2 text-sm text-enterprise-600">
                Switch to a job seeker account to apply, or go back to posting
                roles.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild size="sm">
                  <Link href={`/jobs/${slug}`}>Back to job</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/jobs/dashboard">Your dashboard</Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-enterprise-50 pb-16 pt-24 sm:pt-28">
        {/* Ambient background */}
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-full bg-gradient-to-b from-blue-50/60 via-transparent to-transparent" />
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 bg-gradient-radial from-purple-100/30 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 h-72 w-72 bg-gradient-radial from-blue-100/25 to-transparent blur-3xl" />

        <Container size="wide" className="relative">
          <Breadcrumbs
            items={[
              { label: "Jobs", href: "/jobs" },
              { label: job.title, href: `/jobs/${slug}` },
              { label: "Apply" },
            ]}
          />

          <div className="mt-6 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* Left column — Job summary */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <div className="overflow-hidden rounded-3xl border border-enterprise-200 bg-white shadow-card">
                {/* Gradient header strip */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    {job.category.replace(/-/g, " ")}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-white leading-snug">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm text-blue-100">
                    {job.company_name}
                  </p>
                </div>

                <div className="space-y-3 px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-enterprise-700">
                    <MapPin className="h-4 w-4 text-enterprise-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-enterprise-700">
                    <BriefcaseBusiness className="h-4 w-4 text-enterprise-400" />
                    {capitalize(job.workplace_type)} · {capitalize(job.job_type)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-enterprise-700">
                    <GraduationCap className="h-4 w-4 text-enterprise-400" />
                    {capitalize(job.seniority)} level
                  </div>
                  {formatSalary(job) ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <Banknote className="h-4 w-4" />
                      {formatSalary(job)}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-enterprise-100 px-6 py-4">
                  <Link
                    href={`/jobs/${slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-enterprise-500 hover:text-enterprise-700 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to job details
                  </Link>
                </div>
              </div>
            </motion.aside>

            {/* Right column — Form or states */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {alreadyApplied ? (
                <AlreadyAppliedState slug={slug!} jobTitle={job.title} />
              ) : (
                <ApplicationForm job={job} profile={profile} slug={slug!} />
              )}
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Already-applied state                                              */
/* ------------------------------------------------------------------ */

function AlreadyAppliedState({
  slug,
  jobTitle,
}: {
  slug: string;
  jobTitle: string;
}) {
  return (
    <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-card sm:p-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-bold text-enterprise-950">
        Already applied
      </h2>
      <p className="mt-2 text-sm text-enterprise-600">
        You have already submitted your application for{" "}
        <strong>{jobTitle}</strong>.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild size="sm">
          <Link href="/jobs/dashboard">View your applications</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/jobs/${slug}`}>Back to job</Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Application form                                                   */
/* ------------------------------------------------------------------ */

function ApplicationForm({
  job,
  profile,
  slug,
}: {
  job: any;
  profile: any;
  slug: string;
}) {
  const createApplication = useMutation(api.jobApplications.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [linkedinError, setLinkedinError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    phone: profile?.phone ?? "",
    current_company: "",
    current_title: profile?.current_title ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
    years_of_experience: "0",
    cover_note: "",
  });

  const handleResumeChange = (file: File | null) => {
    setResumeFile(file);
    setResumeError("");
    if (file) {
      const validationError = validateResumeFile(file);
      if (validationError) {
        setResumeError(validationError);
        setResumeFile(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resumeFile) {
      setResumeError("Please upload your resume as a PDF (max 5 MB).");
      return;
    }

    const normalizedLinkedIn = normalizeLinkedInUrl(form.linkedin_url);
    if (!isValidLinkedInUrl(normalizedLinkedIn)) {
      setLinkedinError(
        "LinkedIn URL must look like https://www.linkedin.com/in/your-handle"
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setLinkedinError("");

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": resumeFile.type || "application/octet-stream",
        },
        body: resumeFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Resume upload failed. Please try again.");
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId?: string;
      };

      if (!storageId) {
        throw new Error("Resume upload did not return a storage id.");
      }

      await createApplication({
        job_id: job._id,
        phone: form.phone,
        current_company: form.current_company || undefined,
        current_title: form.current_title || undefined,
        linkedin_url: normalizedLinkedIn,
        years_of_experience: Number(form.years_of_experience),
        cover_note: form.cover_note || undefined,
        resume_storage_id: storageId as any,
        resume_file_name: resumeFile.name,
        resume_content_type: resumeFile.type || "application/pdf",
        resume_size_bytes: resumeFile.size,
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "We couldn't submit your application. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- Success state ---- */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden rounded-3xl border border-green-200 bg-white p-8 text-center shadow-card sm:p-12"
      >
        {/* Celebration dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: "50%",
                y: "40%",
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: `${15 + Math.random() * 70}%`,
                y: `${10 + Math.random() * 80}%`,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                delay: 0.1 + Math.random() * 0.4,
                ease: "easeOut",
              }}
              className="absolute h-2 w-2 rounded-full"
              style={{
                background: [
                  "#3b82f6",
                  "#8b5cf6",
                  "#10b981",
                  "#f59e0b",
                  "#ec4899",
                  "#06b6d4",
                ][i % 6],
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 0.2,
          }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="mt-6 font-display text-2xl font-bold text-enterprise-950 sm:text-3xl">
            Application submitted!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-enterprise-600">
            Your application for <strong>{job.title}</strong> at{" "}
            <strong>{job.company_name}</strong> has been sent to the recruiter.
            You'll be able to track it from your dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button asChild>
            <Link href="/jobs/dashboard">
              <Sparkles className="h-4 w-4" />
              View your applications
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/jobs">Browse more roles</Link>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  /* ---- Form ---- */
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-enterprise-200 bg-white shadow-card"
    >
      {/* Form header */}
      <div className="border-b border-enterprise-100 px-6 py-6 sm:px-8">
        <h1 className="font-display text-2xl font-bold text-enterprise-950">
          Submit your application
        </h1>
        <p className="mt-2 text-sm text-enterprise-700">
          Applying as <strong>{profile?.name ?? "your profile"}</strong>
        </p>
        <p className="mt-1 text-xs text-enterprise-500">
          Your information is shared only with the recruiter for this role.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        {/* Section 1: Contact */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-enterprise-400">
            Contact information
          </legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Phone" required>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+966 5XX XXX XXXX"
                className={inputClassName}
              />
            </Field>
            <Field label="LinkedIn URL" required>
              <input
                required
                inputMode="url"
                value={form.linkedin_url}
                onChange={(e) => {
                  setForm({ ...form, linkedin_url: e.target.value });
                  setLinkedinError("");
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const normalized = normalizeLinkedInUrl(value);
                  if (!isValidLinkedInUrl(normalized)) {
                    setLinkedinError(
                      "LinkedIn URL must look like https://www.linkedin.com/in/your-handle"
                    );
                  }
                }}
                placeholder="https://www.linkedin.com/in/your-handle"
                className={inputClassName}
              />
              {linkedinError ? (
                <p className="mt-1 text-xs text-red-600">{linkedinError}</p>
              ) : null}
            </Field>
          </div>
        </fieldset>

        <div className="my-6 h-px bg-enterprise-100" />

        {/* Section 2: Experience */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-enterprise-400">
            Experience
          </legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Current company">
              <input
                value={form.current_company}
                onChange={(e) =>
                  setForm({ ...form, current_company: e.target.value })
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Current title">
              <input
                value={form.current_title}
                onChange={(e) =>
                  setForm({ ...form, current_title: e.target.value })
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Years of experience" required>
              <input
                required
                type="number"
                min={0}
                value={form.years_of_experience}
                onChange={(e) =>
                  setForm({ ...form, years_of_experience: e.target.value })
                }
                className={inputClassName}
              />
            </Field>
          </div>
        </fieldset>

        <div className="my-6 h-px bg-enterprise-100" />

        {/* Section 3: Resume */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-enterprise-400">
            Resume
          </legend>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) =>
                handleResumeChange(e.target.files?.[0] ?? null)
              }
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                handleResumeChange(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-blue-400 bg-blue-50/60 scale-[1.01]"
                  : resumeFile
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-enterprise-300 bg-enterprise-50 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
            >
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-enterprise-900">
                    {resumeFile.name}
                  </span>
                  <span className="text-xs text-enterprise-500">
                    {formatFileSize(resumeFile.size)} · Click to change
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-enterprise-800">
                    Drop your resume here or click to browse
                  </span>
                  <span className="text-xs text-enterprise-500">
                    PDF only, max 5 MB
                  </span>
                </div>
              )}
            </div>
            {resumeError ? (
              <p className="mt-2 text-xs text-red-600">{resumeError}</p>
            ) : null}
          </div>
        </fieldset>

        <div className="my-6 h-px bg-enterprise-100" />

        {/* Section 4: Cover note */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.15em] text-enterprise-400">
            Cover note
          </legend>
          <div className="mt-4">
            <textarea
              rows={5}
              value={form.cover_note}
              onChange={(e) =>
                setForm({ ...form, cover_note: e.target.value })
              }
              placeholder="Why are you interested in this role? What makes you a great fit?"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-enterprise-400">Optional</p>
          </div>
        </fieldset>
      </div>

      {/* Form footer */}
      <div className="flex items-center justify-between border-t border-enterprise-100 px-6 py-5 sm:px-8">
        <Link
          href={`/jobs/${slug}`}
          className="text-sm text-enterprise-500 hover:text-enterprise-700 transition-colors"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-enterprise-700">
        {label}
        {required && (
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
        )}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-enterprise-400";
