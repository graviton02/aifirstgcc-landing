"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { Navbar } from "@/components/shared/Navbar";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";

const COMPANY_SIZE_OPTIONS = [
  "1-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1,000 employees",
  "1,001-5,000 employees",
  "5,000+ employees",
] as const;

type ProviderPath = "claim_existing" | "create_new";

export default function ProviderSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { role, isLoaded } = useUserRole();
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const setupState = useQuery(api.providerProfiles.getSetupState);
  const setOnboardingPath = useMutation(api.providerProfiles.setOnboardingPath);
  const createCompanySubmission = useMutation(api.companySubmissions.create);

  const [changingPath, setChangingPath] = useState<ProviderPath | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seededSubmissionId, setSeededSubmissionId] = useState<string | null>(null);
  const [form, setForm] = useState({
    contact_email: "",
    company_name: "",
    website: "",
    description: "",
    headquarters: "",
    company_size: "",
    primary_verticals: "",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    if (!role) router.replace("/onboarding");
    if (role === "provider" && myCompany) router.replace("/dashboard");
  }, [role, isLoaded, myCompany, router]);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setForm((current) => (current.contact_email ? current : { ...current, contact_email: email }));
  }, [user]);

  useEffect(() => {
    const submission = setupState?.companySubmission;
    if (!submission || seededSubmissionId === submission._id) return;

    setForm((current) => ({
      ...current,
      contact_email: submission.contact_email || current.contact_email,
      company_name: submission.company_name,
      website: submission.website,
      description: submission.description,
      headquarters: submission.headquarters,
      company_size: submission.company_size,
      primary_verticals: submission.primary_verticals.join(", "),
    }));
    setSeededSubmissionId(submission._id);
  }, [setupState, seededSubmissionId]);

  const selectedPath = setupState?.profile?.onboarding_path ?? null;
  const claimRequest = setupState?.claimRequest;
  const companySubmission = setupState?.companySubmission;
  const canSwitchToClaim = !claimRequest && (!companySubmission || companySubmission.status === "rejected");
  const canSwitchToCreate = !companySubmission && (!claimRequest || claimRequest.status === "rejected");

  const handleChoosePath = async (path: ProviderPath) => {
    setChangingPath(path);
    setSubmitError("");
    try {
      await setOnboardingPath({ onboarding_path: path });
    } catch (error: any) {
      setSubmitError(error.message || "Failed to update your setup path.");
    } finally {
      setChangingPath(null);
    }
  };

  const handleCompanySubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createCompanySubmission({
        contact_email: form.contact_email,
        company_name: form.company_name,
        website: form.website,
        description: form.description,
        headquarters: form.headquarters,
        company_size: form.company_size,
        primary_verticals: form.primary_verticals
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
    } catch (error: any) {
      const raw = error.message || "";
      const match = raw.match(/Uncaught Error: (.+?)(?:\n|$)/);
      setSubmitError(match ? match[1] : "We couldn't submit your company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || role !== "provider" || myCompany || setupState === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-enterprise-50">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-enterprise-50 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-3xl border border-enterprise-200 bg-white p-8 shadow-card">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Provider Setup
              </p>
              <h1 className="mt-3 text-3xl font-bold text-enterprise-900">
                Choose how you want to get your company live on Orbys360
              </h1>
              <p className="mt-3 text-enterprise-600">
                Provider accounts now start in setup. Your dashboard unlocks after you either
                activate a claim for an existing company profile or get a brand-new company listing
                approved by admin.
              </p>
            </div>

            {!selectedPath && (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <PathCard
                  icon={Search}
                  title="Claim an existing company"
                  description="Use this if your company already appears in the public directory and you want to take ownership of that listing."
                  actionLabel="Claim Existing Listing"
                  isLoading={changingPath === "claim_existing"}
                  onClick={() => handleChoosePath("claim_existing")}
                />
                <PathCard
                  icon={Store}
                  title="Create a new company profile"
                  description="Use this if your company is not in the directory yet and you need a fresh listing plus a new provider workspace."
                  actionLabel="Create New Listing"
                  isLoading={changingPath === "create_new"}
                  onClick={() => handleChoosePath("create_new")}
                />
              </div>
            )}

            {selectedPath === "claim_existing" && (
              <div className="mt-8 space-y-6">
                <SectionHeader
                  title="Claim an existing company profile"
                  description="Search the directory, open your company page, and submit a claim using your corporate email."
                  action={
                    canSwitchToCreate ? (
                      <button
                        onClick={() => handleChoosePath("create_new")}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        My company isn't listed
                      </button>
                    ) : undefined
                  }
                />

                {!claimRequest && (
                  <StatusCard
                    icon={ShieldCheck}
                    title="No claim submitted yet"
                    tone="neutral"
                    body="Browse the directory to find your company. Once you submit a claim, this page will track the review and activation status."
                    action={
                      <Link
                        href="/directory"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        Browse Directory
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  />
                )}

                {claimRequest?.status === "pending" && (
                  <StatusCard
                    icon={Loader2}
                    title={`Claim under review for ${claimRequest.company_name}`}
                    tone="pending"
                    body="Admin has your claim and the company listing stays reserved while it is being reviewed."
                  />
                )}

                {claimRequest?.status === "approved" && (
                  <StatusCard
                    icon={CheckCircle2}
                    title={`Claim approved for ${claimRequest.company_name}`}
                    tone="success"
                    body="Finish activation to convert the approved claim into an active provider dashboard."
                    action={
                      claimRequest.magic_link_token ? (
                        <Link
                          href={`/claim/activate?token=${encodeURIComponent(claimRequest.magic_link_token)}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Finish Activation
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : undefined
                    }
                  />
                )}

                {claimRequest?.status === "rejected" && (
                  <StatusCard
                    icon={Building2}
                    title={`Claim rejected for ${claimRequest.company_name}`}
                    tone="danger"
                    body={claimRequest.admin_notes || "Admin rejected this claim. You can try a different listing or contact support with more proof of ownership."}
                    action={
                      <Link
                        href="/directory"
                        className="inline-flex items-center gap-2 rounded-lg border border-enterprise-300 px-4 py-2 text-sm font-medium text-enterprise-700 hover:bg-enterprise-50"
                      >
                        Browse Directory Again
                      </Link>
                    }
                  />
                )}
              </div>
            )}

            {selectedPath === "create_new" && (
              <div className="mt-8 space-y-6">
                <SectionHeader
                  title="Create a new company profile"
                  description="Submit your company details for admin approval. Once approved, Orbys360 will create the company profile and unlock your provider dashboard."
                  action={
                    canSwitchToClaim ? (
                      <button
                        onClick={() => handleChoosePath("claim_existing")}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        My company already exists
                      </button>
                    ) : undefined
                  }
                />

                {companySubmission?.status === "pending" && (
                  <StatusCard
                    icon={Loader2}
                    title={`${companySubmission.company_name} is under review`}
                    tone="pending"
                    body="Your new company submission is waiting for admin approval. Once approved, you will become the owner automatically and can start adding agents."
                  />
                )}

                {companySubmission?.status === "approved" && (
                  <StatusCard
                    icon={CheckCircle2}
                    title={`${companySubmission.company_name} is approved`}
                    tone="success"
                    body="Your company is live. If you are not redirected automatically, continue to your dashboard."
                    action={
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        Open Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  />
                )}

                {(companySubmission?.status === "rejected" || !companySubmission) && (
                  <form onSubmit={handleCompanySubmission} className="grid gap-4 rounded-2xl border border-enterprise-200 bg-enterprise-50/60 p-6 md:grid-cols-2">
                    {companySubmission?.status === "rejected" && (
                      <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {companySubmission.admin_notes ||
                          "Admin rejected the last submission. Update the details below and resubmit."}
                      </div>
                    )}

                    <FormField label="Contact Email">
                      <input
                        type="email"
                        required
                        value={form.contact_email}
                        onChange={(event) => setForm({ ...form, contact_email: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                        placeholder="you@company.com"
                      />
                    </FormField>

                    <FormField label="Company Name">
                      <input
                        type="text"
                        required
                        value={form.company_name}
                        onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                        placeholder="Acme AI Labs"
                      />
                    </FormField>

                    <FormField label="Website">
                      <input
                        type="url"
                        required
                        value={form.website}
                        onChange={(event) => setForm({ ...form, website: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                        placeholder="https://acme.ai"
                      />
                    </FormField>

                    <FormField label="Headquarters">
                      <input
                        type="text"
                        required
                        value={form.headquarters}
                        onChange={(event) => setForm({ ...form, headquarters: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                        placeholder="Bengaluru, India"
                      />
                    </FormField>

                    <FormField label="Company Size">
                      <select
                        required
                        value={form.company_size}
                        onChange={(event) => setForm({ ...form, company_size: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                      >
                        <option value="">Select size</option>
                        {COMPANY_SIZE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Primary Verticals" className="md:col-span-2">
                      <input
                        type="text"
                        required
                        value={form.primary_verticals}
                        onChange={(event) => setForm({ ...form, primary_verticals: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
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
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                        className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2"
                        placeholder="What does your company build, and which GCC problems do you solve?"
                      />
                    </FormField>

                    {submitError && (
                      <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                      </p>
                    )}

                    <div className="md:col-span-2 flex items-center justify-between gap-3">
                      <p className="text-sm text-enterprise-500">
                        Admin approval creates the live company profile and your owner membership in one step.
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
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
                )}
              </div>
            )}

            {submitError && !selectedPath && (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function PathCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  isLoading,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-enterprise-200 bg-enterprise-50 p-6 text-left transition-all hover:border-primary/40 hover:bg-white hover:shadow-sm"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-enterprise-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-enterprise-600">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </div>
    </button>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-enterprise-900">{title}</h2>
        <p className="mt-1 text-sm text-enterprise-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  body,
  tone,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tone: "neutral" | "pending" | "success" | "danger";
  action?: React.ReactNode;
}) {
  const toneClasses = {
    neutral: "border-enterprise-200 bg-enterprise-50 text-enterprise-700",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-green-200 bg-green-50 text-green-800",
    danger: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-white/70 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6">{body}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-enterprise-700">{label}</span>
      {children}
    </label>
  );
}
