"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { AgentFormSections } from "@/components/dashboard/AgentFormFields";
import type { AgentFormData } from "@/lib/agentSubmission";

interface AgentStepProps {
  agentForm: AgentFormData;
  updateAgentField: <K extends keyof AgentFormData>(
    key: K,
    value: AgentFormData[K],
  ) => void;
  onContinue: () => void;
  onBack: () => void;
  validationError: string;
}

export function AgentStep({
  agentForm,
  updateAgentField,
  onContinue,
  onBack,
  validationError,
}: AgentStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-enterprise-200 bg-white p-6 shadow-card">
        <AgentFormSections
          form={agentForm}
          updateField={updateAgentField}
          mode="setup"
        />
      </div>

      {validationError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-enterprise-300 px-4 py-2.5 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
