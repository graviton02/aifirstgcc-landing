"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  AgentFormSections,
} from "./AgentFormFields";
import {
  EMPTY_AGENT_FORM,
  agentToFormData,
  getAgentDraftValidationErrors,
  type AgentFormData,
} from "@/lib/agentSubmission";
import { getErrorMessage } from "@/lib/report-error";

export function AgentForm({
  mode,
  initialData,
  companyId,
  agentId,
  submissionId,
  onSuccess,
  onCancel,
}: {
  mode: "submit" | "edit" | "resubmit";
  initialData?: any;
  companyId: string;
  agentId?: string;
  submissionId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AgentFormData>(
    initialData
      ? agentToFormData(initialData)
      : {
          ...EMPTY_AGENT_FORM,
          use_cases: [{ title: "", description: "" }],
        }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [noChanges, setNoChanges] = useState(false);

  const submitAgent = useMutation(api.agents.submit);
  const createEdit = useMutation(api.agents.createEdit);
  const resubmitSubmission = useMutation(api.agents.resubmitSubmission);

  const updateField = <K extends keyof AgentFormData>(
    key: K,
    value: AgentFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setNoChanges(false);
  };

  const draftPayload = {
    agent_name: form.agent_name.trim(),
    tagline: form.tagline.trim() || undefined,
    description: form.description.trim(),
    category: form.category,
    use_cases: form.use_cases,
    functional_categories: form.functional_categories,
    industry_categories: form.industry_categories,
    infrastructure_categories: form.infrastructure_categories.length
      ? form.infrastructure_categories
      : undefined,
    integrations: form.integrations.length
      ? form.integrations
      : undefined,
    expected_outcomes: form.expected_outcomes.length
      ? form.expected_outcomes
      : undefined,
    source_url: form.source_url.trim() || undefined,
    demo_url: form.demo_url.trim() || undefined,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNoChanges(false);

    const validationErrors = getAgentDraftValidationErrors(form);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "submit") {
        await submitAgent({
          company_id: companyId as Id<"companies">,
          ...draftPayload,
        });
      } else if (mode === "resubmit") {
        const original = agentToFormData(initialData);
        const hasChanges = (Object.keys(form) as (keyof AgentFormData)[]).some(
          (key) => JSON.stringify(form[key]) !== JSON.stringify(original[key])
        );

        if (!hasChanges) {
          setNoChanges(true);
          setIsSubmitting(false);
          return;
        }

        await resubmitSubmission({
          submission_id: submissionId as Id<"agentSubmissions">,
          ...draftPayload,
        });
      } else {
        // Edit mode: only send changed fields
        const original = agentToFormData(initialData);
        const payload: Record<string, unknown> = {};

        for (const key of Object.keys(form) as (keyof AgentFormData)[]) {
          const curr = JSON.stringify(form[key]);
          const orig = JSON.stringify(original[key]);
          if (curr !== orig) {
            payload[key] = form[key];
          }
        }

        if (Object.keys(payload).length === 0) {
          setNoChanges(true);
          setIsSubmitting(false);
          return;
        }

        await createEdit({
          agent_id: agentId as Id<"agents">,
          payload,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err, "Something went wrong."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AgentFormSections
        form={form}
        updateField={updateField}
        mode={mode}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {noChanges && (
        <p className="text-sm text-amber-600">No changes detected.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "submit"
            ? "Submit for Review"
            : mode === "resubmit"
              ? "Resubmit for Review"
              : "Submit Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-enterprise-300 rounded-lg text-sm font-medium text-enterprise-700 hover:bg-enterprise-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
