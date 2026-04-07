"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  Loader2,
  Mail,
  MessageSquare,
  X,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/report-error";
import type { Agent, Company } from "@/lib/types";
import { cn } from "@/lib/utils";

type RequestSource = "agent_detail" | "company_profile";

type AgentOption = Pick<Agent, "_id" | "agent_name" | "status">;

type ReachoutCompany = Pick<
  Company,
  "_id" | "name" | "website" | "contact_email" | "contact_url" | "claim_status"
>;

const TIMELINE_OPTIONS = [
  "Exploring in the next 6 months",
  "Targeting a pilot in 1-3 months",
  "Need to move this quarter",
  "Already evaluating vendors now",
] as const;

function isProviderOwned(company: ReachoutCompany) {
  return company.claim_status === "claimed";
}

function getDirectContactHref(company: ReachoutCompany) {
  return (
    company.contact_url ||
    (company.contact_email ? `mailto:${company.contact_email}` : null) ||
    company.website
  );
}

function textareaClassName() {
  return cn(
    "min-h-[104px] w-full rounded-lg border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 shadow-sm transition-all duration-300",
    "placeholder:text-enterprise-600/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
  );
}

function getManagedStatusLabel(status: string) {
  switch (status) {
    case "pending_admin":
      return "Request Submitted";
    case "approved":
      return "Awaiting Provider Follow-up";
    case "contacted":
      return "Provider Contacted";
    default:
      return "Request In Progress";
  }
}

export function ReachoutRequestButton({
  company,
  agents,
  requestSource,
  managedLabel,
  className,
  directLabel,
}: {
  company: ReachoutCompany;
  agents: AgentOption[];
  requestSource: RequestSource;
  managedLabel: string;
  className?: string;
  directLabel?: string;
}) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded: roleLoaded } = useUserRole();
  const providerOwned = isProviderOwned(company);
  const contactHref = getDirectContactHref(company);
  const isEmail = contactHref?.startsWith("mailto:");
  const gccProfile = useQuery(
    api.gccProfiles.getProfile,
    isSignedIn ? {} : "skip"
  );
  const existingRequest = useQuery(
    api.gcc.getMyProviderRequestStatus,
    isSignedIn && providerOwned
      ? { company_id: company._id as any }
      : "skip"
  );
  const createContactRequest = useMutation(api.gcc.createContactRequest);

  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.status === "active"),
    [agents]
  );
  const defaultAgentId =
    activeAgents.length === 1 ? activeAgents[0]?._id ?? "" : "";

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    agent_id: defaultAgentId,
    use_case: "",
    current_challenge: "",
    expected_outcome: "",
    timeline: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      agent_id:
        activeAgents.length === 1
          ? activeAgents[0]?._id ?? ""
          : current.agent_id,
    }));
  }, [activeAgents]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  const resetAndClose = () => {
    setIsOpen(false);
    setSubmitError("");
    setSubmitted(false);
    setForm({
      agent_id: defaultAgentId,
      use_case: "",
      current_challenge: "",
      expected_outcome: "",
      timeline: "",
    });
  };

  const openForm = () => {
    setSubmitError("");
    setSubmitted(false);
    setIsOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!form.agent_id) {
      setSubmitError("Select an agent before submitting your request.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createContactRequest({
        agent_id: form.agent_id as any,
        use_case: form.use_case,
        current_challenge: form.current_challenge,
        expected_outcome: form.expected_outcome,
        timeline: form.timeline,
        request_source: requestSource,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          "We couldn't send your request. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!providerOwned) {
    if (!contactHref) {
      return null;
    }

    return (
      <a
        href={contactHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className)}
      >
        {isEmail ? (
          <Mail className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
        {directLabel ??
          (isEmail
            ? "Email Company"
            : company.contact_url
              ? "Contact Company"
              : "Visit Website")}
      </a>
    );
  }

  if (activeAgents.length === 0) {
    return (
      <div className="space-y-2">
        <button disabled className={cn(className, "cursor-not-allowed opacity-60")}>
          <Mail className="h-4 w-4" />
          {managedLabel}
        </button>
        <p className="text-xs text-enterprise-500">
          This provider hasn't listed any solutions yet. Check back soon.
        </p>
      </div>
    );
  }

  if (!authLoaded || (isSignedIn && !roleLoaded)) {
    return (
      <button disabled className={cn(className, "cursor-wait opacity-70")}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-up" className={cn(className)}>
        <Mail className="h-4 w-4" />
        Sign Up to Connect
      </Link>
    );
  }

  if (role !== "gcc" || !gccProfile) {
    if (role === "provider") {
      return (
        <div className="space-y-2">
          <button disabled className={cn(className, "cursor-not-allowed opacity-60")}>
            <Mail className="h-4 w-4" />
            Enterprise Buyers Only
          </button>
          <p className="text-xs text-enterprise-500">
            This feature is available to enterprise buyers evaluating solutions on Orbys360.
          </p>
        </div>
      );
    }

    return (
      <Link href="/onboarding" className={cn(className)}>
        <Mail className="h-4 w-4" />
        Complete Your Profile
      </Link>
    );
  }

  if (existingRequest === undefined) {
    return (
      <button disabled className={cn(className, "cursor-wait opacity-70")}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (existingRequest) {
    return (
      <div className="space-y-2">
        <div
          className={cn(
            className,
            "cursor-default bg-enterprise-100 text-enterprise-700 hover:bg-enterprise-100"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          {getManagedStatusLabel(existingRequest.status)}
        </div>
        <Link
          href="/gcc-dashboard?tab=current-requests"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View request status
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <button onClick={openForm} className={cn(className)} type="button">
        <Mail className="h-4 w-4" />
        {managedLabel}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto bg-enterprise-950/60 px-4 pt-20 pb-6 sm:px-6 sm:pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reachout-request-title"
        >
          <div className="flex min-h-full items-start justify-center">
            <div className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4rem)]">
              <button
                onClick={resetAndClose}
                type="button"
                className="absolute right-4 top-4 rounded-full p-2 text-enterprise-500 transition-colors hover:bg-enterprise-100 hover:text-enterprise-900"
                aria-label="Close reachout request dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="shrink-0 border-b border-enterprise-100 px-6 py-5 pr-14">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Connect with Provider
                </p>
                <h2
                  id="reachout-request-title"
                  className="mt-2 text-2xl font-bold text-enterprise-950"
                >
                  Tell us what you need
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-enterprise-600">
                  Share your requirements and the provider team will follow up
                  using the details on your profile.
                </p>
              </div>

              {submitted ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="mt-0.5 h-5 w-5 text-green-700" />
                        <div>
                          <h3 className="font-semibold text-green-900">
                            Request sent
                          </h3>
                          <p className="mt-1 text-sm text-green-800">
                            The provider team will be in touch. You can track
                            progress from your GCC dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-enterprise-100 px-6 py-5">
                    <div className="flex justify-end">
                      <Button type="button" variant="secondary" onClick={resetAndClose}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                      {activeAgents.length > 1 && (
                        <div className="space-y-2">
                          <Label htmlFor="agent_id">Agent</Label>
                          <select
                            id="agent_id"
                            value={form.agent_id}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                agent_id: event.target.value,
                              }))
                            }
                            className={cn(
                              "flex h-11 w-full rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm text-enterprise-900 shadow-sm transition-all duration-300",
                              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            )}
                          >
                            <option value="">Select the solution you want to discuss</option>
                            {activeAgents.map((agent) => (
                              <option key={agent._id} value={agent._id}>
                                {agent.agent_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="use_case">Primary use case</Label>
                        <Input
                          id="use_case"
                          value={form.use_case}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              use_case: event.target.value,
                            }))
                          }
                          placeholder="What are you trying to solve with this solution?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_challenge">Current challenge</Label>
                        <textarea
                          id="current_challenge"
                          value={form.current_challenge}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              current_challenge: event.target.value,
                            }))
                          }
                          className={textareaClassName()}
                          placeholder="What is blocking progress today?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expected_outcome">Expected outcome</Label>
                        <textarea
                          id="expected_outcome"
                          value={form.expected_outcome}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              expected_outcome: event.target.value,
                            }))
                          }
                          className={textareaClassName()}
                          placeholder="What outcome are you looking for?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <select
                          id="timeline"
                          value={form.timeline}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              timeline: event.target.value,
                            }))
                          }
                          className={cn(
                            "flex h-11 w-full rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm text-enterprise-900 shadow-sm transition-all duration-300",
                            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          )}
                          required
                        >
                          <option value="">Select your timeline</option>
                          {TIMELINE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {submitError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {submitError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-enterprise-100 px-6 py-5">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={resetAndClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Send Request"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
