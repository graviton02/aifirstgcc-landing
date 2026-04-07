"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import {
  EMPTY_AGENT_FORM,
  agentToFormData,
  getAgentDraftValidationErrors,
  type AgentFormData,
} from "@/lib/agentSubmission";
import {
  uploadFileToConvexStorage,
  validateCompanyLogoFile,
} from "@/lib/companyLogoUpload";
import { getErrorMessage } from "@/lib/report-error";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

import { SetupSidebar, type SetupStep } from "./_components/SetupSidebar";
import { SetupMobileStepper } from "./_components/SetupMobileStepper";
import { PathSelectionView } from "./_components/PathSelectionView";
import { CompanyInfoStep } from "./_components/CompanyInfoStep";
import { AgentStep } from "./_components/AgentStep";
import { ReviewStep } from "./_components/ReviewStep";
import { ClaimStatusView } from "./_components/ClaimStatusView";
import { StatusCard } from "./_components/shared";

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const CREATE_STEPS: SetupStep[] = [
  { key: "company", label: "Company Info", subtitle: "Your company details" },
  { key: "agent", label: "First Agent", subtitle: "Agent you want listed" },
  { key: "review", label: "Review & Submit", subtitle: "Confirm and submit" },
];

const CLAIM_STEPS: SetupStep[] = [
  { key: "find", label: "Find Your Company", subtitle: "Browse the directory" },
  { key: "review", label: "Under Review", subtitle: "Admin reviews your claim" },
  { key: "activate", label: "Activate", subtitle: "Finish activation" },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

/* ------------------------------------------------------------------ */
/*  Step title/description map                                         */
/* ------------------------------------------------------------------ */

const STEP_META: Record<number, { title: string; description: string }> = {
  1: {
    title: "Company Information",
    description: "Tell us about your company so we can set up your provider profile.",
  },
  2: {
    title: "Add Your First Agent",
    description: "Describe your first AI agent — this is what GCC buyers will see.",
  },
  3: {
    title: "Review & Submit",
    description: "Review your details before submitting for admin approval.",
  },
};

type ProviderPath = "claim_existing" | "create_new";

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ProviderSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const { role, isLoaded, providerSetupStarted } = useUserRole();
  const companyStepFormRef = useRef<HTMLFormElement>(null);
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const setupState = useQuery(api.providerProfiles.getSetupState);
  const setOnboardingPath = useMutation(api.providerProfiles.setOnboardingPath);
  const createCompanySubmission = useMutation(api.companySubmissions.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [changingPath, setChangingPath] = useState<ProviderPath | null>(null);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seededSubmissionId, setSeededSubmissionId] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState({
    contact_email: "",
    company_name: "",
    website: "",
    description: "",
    headquarters: "",
    logo_storage_id: "",
    logo_url: "",
    logo_bg: "" as "" | "dark",
    primary_verticals: "",
  });
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [agentForm, setAgentForm] = useState<AgentFormData>({
    ...EMPTY_AGENT_FORM,
    use_cases: [{ title: "", description: "" }],
  });
  const logoPreviewUrlRef = useRef<string | null>(null);

  /* ---- Redirects ---- */
  useEffect(() => {
    if (!isLoaded) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    if (role === "provider" && myCompany) router.replace("/dashboard");
    if (!role && !providerSetupStarted) router.replace("/onboarding");
  }, [role, isLoaded, myCompany, providerSetupStarted, router]);

  /* ---- Pre-fill email ---- */
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    setCompanyForm((current) =>
      current.contact_email ? current : { ...current, contact_email: email }
    );
  }, [user]);

  /* ---- Seed from existing submission ---- */
  useEffect(() => {
    const submission = setupState?.companySubmission;
    if (!submission || seededSubmissionId === submission._id) return;

    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
      logoPreviewUrlRef.current = null;
    }
    setCompanyLogoFile(null);

    setCompanyForm((current) => ({
      ...current,
      contact_email: submission.contact_email || current.contact_email,
      company_name: submission.company_name,
      website: submission.website,
      description: submission.description,
      headquarters: submission.headquarters,
      logo_storage_id: submission.logo_storage_id ?? "",
      logo_url: submission.logo_url ?? "",
      logo_bg: submission.logo_bg === "dark" ? "dark" : "",
      primary_verticals: submission.primary_verticals.join(", "),
    }));
    setAgentForm(() => {
      const nextAgent = submission.initial_agent
        ? agentToFormData(submission.initial_agent)
        : { ...EMPTY_AGENT_FORM, use_cases: [{ title: "", description: "" }] };
      return nextAgent.use_cases.length > 0
        ? nextAgent
        : { ...nextAgent, use_cases: [{ title: "", description: "" }] };
    });
    setCreateStep(1);
    setSeededSubmissionId(submission._id);
  }, [setupState, seededSubmissionId]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
    };
  }, []);

  /* ---- Derived state ---- */
  const selectedPath = setupState?.profile?.onboarding_path ?? null;
  const claimRequest = setupState?.claimRequest;
  const companySubmission = setupState?.companySubmission;
  const canSwitchToClaim =
    !claimRequest && (!companySubmission || companySubmission.status === "rejected");
  const canSwitchToCreate =
    !companySubmission && (!claimRequest || claimRequest.status === "rejected");

  /* ---- Claim path: derive active step from status ---- */
  const claimActiveStep = !claimRequest
    ? 1
    : claimRequest.status === "pending"
      ? 2
      : claimRequest.status === "approved"
        ? 3
        : 1; // rejected → back to 1

  /* ---- Handlers ---- */
  const handleChoosePath = async (path: ProviderPath) => {
    setChangingPath(path);
    setSubmitError("");
    try {
      await setOnboardingPath({ onboarding_path: path });
      if (path === "create_new") setCreateStep(1);
    } catch (error: any) {
      setSubmitError(getErrorMessage(error, "Failed to update your setup path."));
    } finally {
      setChangingPath(null);
    }
  };

  const updateAgentField = <K extends keyof AgentFormData>(
    key: K,
    value: AgentFormData[K]
  ) => {
    setAgentForm((current) => ({ ...current, [key]: value }));
  };

  const goToStep = (step: 1 | 2 | 3) => {
    setDirection(step > createStep ? 1 : -1);
    setSubmitError("");
    setCreateStep(step);
  };

  const handleContinueToAgent = () => {
    if (!companyForm.logo_url && !companyForm.logo_storage_id) {
      setSubmitError("Upload a company logo before continuing.");
      return;
    }
    if (!companyStepFormRef.current?.reportValidity()) return;
    setSubmitError("");
    goToStep(2);
  };

  const handleContinueToReview = () => {
    const validationErrors = getAgentDraftValidationErrors(agentForm);
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors[0]);
      return;
    }
    setSubmitError("");
    goToStep(3);
  };

  const handleCompanySubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const logoStorageId =
        companyLogoFile != null
          ? await uploadFileToConvexStorage(companyLogoFile, generateUploadUrl)
          : companyForm.logo_storage_id;

      if (!logoStorageId) {
        throw new Error("Upload a company logo before submitting.");
      }

      await createCompanySubmission({
        contact_email: companyForm.contact_email,
        company_name: companyForm.company_name,
        website: companyForm.website,
        description: companyForm.description,
        headquarters: companyForm.headquarters,
        logo_storage_id: logoStorageId as any,
        primary_verticals: companyForm.primary_verticals
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        logo_bg: companyForm.logo_bg || undefined,
        initial_agent: {
          agent_name: agentForm.agent_name,
          tagline: agentForm.tagline.trim(),
          description: agentForm.description,
          category: agentForm.category,
          functional_categories: agentForm.functional_categories,
          industry_categories: agentForm.industry_categories,
          use_cases: agentForm.use_cases,
          integrations: agentForm.integrations,
          expected_outcomes: agentForm.expected_outcomes,
          source_url: agentForm.source_url.trim(),
          demo_url: agentForm.demo_url.trim() || undefined,
        },
      });
    } catch (error: any) {
      setSubmitError(
        getErrorMessage(error, "We couldn't submit your company. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    const validationError = validateCompanyLogoFile(file);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    logoPreviewUrlRef.current = previewUrl;
    setCompanyLogoFile(file);
    setCompanyForm((current) => ({
      ...current,
      logo_storage_id: "",
      logo_url: previewUrl,
    }));
    setSubmitError("");
  };

  /* ---- Loading state ---- */
  if (
    !isLoaded ||
    (role === "gcc" || (!providerSetupStarted && role !== "provider")) ||
    myCompany ||
    setupState === undefined
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-enterprise-50">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  /* ---- Path selection (no path chosen yet) ---- */
  if (!selectedPath) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-enterprise-50 pt-24 pb-16">
          <PathSelectionView
            onChoosePath={handleChoosePath}
            changingPath={changingPath}
            submitError={submitError}
          />
        </main>
      </>
    );
  }

  /* ---- Determine sidebar config based on path ---- */
  const isCreatePath = selectedPath === "create_new";
  const steps = isCreatePath ? CREATE_STEPS : CLAIM_STEPS;
  const activeStep = isCreatePath ? createStep : claimActiveStep;

  const pathSwitchLabel = isCreatePath
    ? canSwitchToClaim
      ? "My company already exists"
      : undefined
    : canSwitchToCreate
      ? "My company isn't listed"
      : undefined;

  const handlePathSwitch = () => {
    handleChoosePath(isCreatePath ? "claim_existing" : "create_new");
  };

  /* ---- Has a pending/approved submission? Show status instead of form ---- */
  const showCreateForm =
    isCreatePath &&
    (companySubmission?.status === "rejected" || !companySubmission);

  const showCreateStatus =
    isCreatePath && companySubmission && companySubmission.status !== "rejected";

  /* ---- Render two-panel layout ---- */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-enterprise-50 pt-24 pb-16">
        {/* Mobile stepper */}
        <div className="md:hidden">
          <SetupMobileStepper
            steps={steps}
            activeStep={activeStep}
            onStepClick={(step) => {
              if (isCreatePath && step < createStep) goToStep(step as 1 | 2 | 3);
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex gap-8"
          >
            {/* Sidebar — desktop only */}
            <div className="hidden md:block w-72 shrink-0">
              <div className="sticky top-24 rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
                <SetupSidebar
                  steps={steps}
                  activeStep={activeStep}
                  onStepClick={(step) => {
                    if (isCreatePath && step < createStep)
                      goToStep(step as 1 | 2 | 3);
                  }}
                  pathSwitchLabel={pathSwitchLabel}
                  onPathSwitch={pathSwitchLabel ? handlePathSwitch : undefined}
                />
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 min-w-0 max-w-3xl py-2">
              {/* ---- CREATE PATH: Status cards ---- */}
              {showCreateStatus && (
                <div className="space-y-4">
                  {companySubmission.status === "pending" && (
                    <StatusCard
                      icon={Loader2}
                      title={`${companySubmission.company_name} is under review`}
                      tone="pending"
                      body="Your new company submission is waiting for admin approval. Once approved, your provider workspace goes live and the first agent you submitted will move into the admin agent review queue."
                    />
                  )}
                  {companySubmission.status === "approved" && (
                    <StatusCard
                      icon={CheckCircle2}
                      title={`${companySubmission.company_name} is approved`}
                      tone="success"
                      body={
                        companySubmission.initial_agent_submission
                          ? "Your company is live and your first agent is being tracked in the provider dashboard."
                          : "Your company is live. If you are not redirected automatically, continue to your dashboard."
                      }
                      action={
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                        >
                          Open Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      }
                    />
                  )}
                </div>
              )}

              {/* ---- CREATE PATH: Form steps ---- */}
              {showCreateForm && (
                <div>
                  {/* Step header */}
                  <div className="mb-6">
                    <h1 className="font-display text-2xl font-bold text-enterprise-900">
                      {STEP_META[createStep].title}
                    </h1>
                    <p className="mt-1 text-sm text-enterprise-600">
                      {STEP_META[createStep].description}
                    </p>
                  </div>

                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={createStep}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={slideTransition}
                    >
                      {createStep === 1 && (
                        <CompanyInfoStep
                          formRef={companyStepFormRef}
                          companyForm={companyForm}
                          setCompanyForm={setCompanyForm}
                          onLogoFileChange={handleLogoFileChange}
                          onContinue={handleContinueToAgent}
                          validationError={submitError}
                          rejectionNotice={
                            companySubmission?.status === "rejected"
                              ? companySubmission.admin_notes ||
                                "Admin rejected the last submission. Update the details below and resubmit."
                              : null
                          }
                        />
                      )}
                      {createStep === 2 && (
                        <AgentStep
                          agentForm={agentForm}
                          updateAgentField={updateAgentField}
                          onContinue={handleContinueToReview}
                          onBack={() => goToStep(1)}
                          validationError={submitError}
                        />
                      )}
                      {createStep === 3 && (
                        <ReviewStep
                          companyForm={companyForm}
                          agentForm={agentForm}
                          onEditCompany={() => goToStep(1)}
                          onEditAgent={() => goToStep(2)}
                          onSubmit={handleCompanySubmission}
                          isSubmitting={isSubmitting}
                          submitError={submitError}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* ---- CLAIM PATH ---- */}
              {selectedPath === "claim_existing" && (
                <div>
                  <div className="mb-6">
                    <h1 className="font-display text-2xl font-bold text-enterprise-900">
                      Claim an existing company profile
                    </h1>
                    <p className="mt-1 text-sm text-enterprise-600">
                      Search the directory, open your company page, and submit a claim
                      using your corporate email.
                    </p>
                  </div>
                  <ClaimStatusView claimRequest={claimRequest} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
