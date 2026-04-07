"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SetupStep {
  key: string;
  label: string;
  subtitle: string;
}

interface SetupSidebarProps {
  steps: SetupStep[];
  activeStep: number;
  onStepClick: (stepNumber: number) => void;
  pathSwitchLabel?: string;
  onPathSwitch?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Step state helpers                                                 */
/* ------------------------------------------------------------------ */

type StepState = "completed" | "active" | "upcoming";

function getStepState(stepIndex: number, activeStep: number): StepState {
  const stepNumber = stepIndex + 1;
  if (stepNumber < activeStep) return "completed";
  if (stepNumber === activeStep) return "active";
  return "upcoming";
}

/* ------------------------------------------------------------------ */
/*  Line color between circles                                         */
/* ------------------------------------------------------------------ */

function getLineColor(stateBelow: StepState): string {
  switch (stateBelow) {
    case "completed":
      return "bg-green-600/30";
    case "active":
      return "bg-primary";
    case "upcoming":
      return "bg-enterprise-200";
  }
}

/* ------------------------------------------------------------------ */
/*  SetupSidebar                                                       */
/* ------------------------------------------------------------------ */

export function SetupSidebar({
  steps,
  activeStep,
  onStepClick,
  pathSwitchLabel,
  onPathSwitch,
}: SetupSidebarProps) {
  return (
    <div>
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
        Provider Setup
      </p>

      {/* Step rail */}
      <div className="relative">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const state = getStepState(index, activeStep);
          const isCompleted = state === "completed";
          const isActive = state === "active";
          const isUpcoming = state === "upcoming";
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative">
              {/* Connecting line above this circle (not for first step) */}
              {index > 0 && (
                <div
                  className={`absolute left-4 -translate-x-1/2 top-0 w-0.5 h-4 ${getLineColor(state)}`}
                  aria-hidden
                />
              )}

              {/* Step row */}
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                disabled={isUpcoming}
                className={`
                  relative flex w-full items-start gap-3 pt-4 pb-4 text-left
                  ${isActive ? "bg-primary/5 rounded-xl px-3 -mx-3" : ""}
                  ${isCompleted ? "cursor-pointer" : ""}
                  ${isUpcoming ? "pointer-events-none opacity-50" : ""}
                `}
              >
                {/* Circle */}
                <motion.div
                  className={`
                    relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold
                    ${isCompleted ? "bg-green-600 text-white" : ""}
                    ${isActive ? "bg-primary text-white" : ""}
                    ${isUpcoming ? "bg-enterprise-100 text-enterprise-400" : ""}
                  `}
                  animate={
                    isCompleted
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    stepNumber
                  )}
                </motion.div>

                {/* Text */}
                <div className="min-w-0 pt-0.5">
                  <p
                    className={`text-sm leading-tight ${
                      isCompleted
                        ? "text-enterprise-700"
                        : isActive
                          ? "text-primary font-semibold"
                          : "text-enterprise-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-enterprise-400 leading-snug">
                    {step.subtitle}
                  </p>
                </div>
              </button>

              {/* Connecting line below this circle (not for last step) */}
              {!isLast && (
                <div
                  className={`absolute left-4 -translate-x-1/2 bottom-0 w-0.5 h-4 ${getLineColor(
                    getStepState(index + 1, activeStep)
                  )}`}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Path switch */}
      {pathSwitchLabel && onPathSwitch && (
        <div className="border-t border-enterprise-200 mt-6 pt-4">
          <button
            type="button"
            onClick={onPathSwitch}
            className="text-xs text-enterprise-500 hover:text-primary transition-colors"
          >
            {pathSwitchLabel}
          </button>
        </div>
      )}
    </div>
  );
}
