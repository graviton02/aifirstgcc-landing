"use client";

import { Check } from "lucide-react";

interface Step {
  key: string;
  label: string;
}

interface SetupMobileStepperProps {
  steps: Step[];
  activeStep: number;
  onStepClick: (step: number) => void;
}

export function SetupMobileStepper({
  steps,
  activeStep,
  onStepClick,
}: SetupMobileStepperProps) {
  const activeLabel = steps[activeStep - 1]?.label ?? "";

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-enterprise-200 shadow-sm px-4 py-3">
      <div className="flex items-center">
        {/* Circles + connecting lines */}
        <div className="flex items-center">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = stepNumber < activeStep;
            const isActive = stepNumber === activeStep;

            return (
              <div key={step.key} className="flex items-center">
                {/* Connecting line before this circle (skip for the first step) */}
                {idx > 0 && (
                  <div
                    className={`h-0.5 flex-1 w-6 ${
                      stepNumber < activeStep
                        ? "bg-green-600/30"
                        : stepNumber === activeStep
                          ? "bg-primary"
                          : "bg-enterprise-200"
                    }`}
                  />
                )}

                {/* Step circle */}
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(stepNumber)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold bg-green-600 text-white transition-colors hover:bg-green-700"
                    aria-label={`Go to step ${stepNumber}: ${step.label}`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                ) : (
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-enterprise-100 text-enterprise-400"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {stepNumber}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active step label */}
        <span className="text-sm font-medium text-enterprise-900 ml-3 truncate">
          {activeLabel}
        </span>
      </div>
    </div>
  );
}
