"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { BriefcaseBusiness, Send } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/report-error";
import type { JobBoardRole } from "@/jobs/config";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";

export function JobOnboarding({
  returnUrl,
  presetRole,
}: {
  returnUrl: string;
  presetRole?: JobBoardRole;
}) {
  const router = useRouter();
  const { user } = useUser();
  const createProfile = useMutation(api.jobProfiles.createProfile);
  const [role, setRole] = useState<JobBoardRole | null>(presetRole ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    company_name: "",
    current_title: "",
  });

  const resolvedReturnUrl = useMemo(() => returnUrl || "/jobs/dashboard", [returnUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) return;

    setIsSubmitting(true);
    setError("");

    try {
      await createProfile({
        role,
        name: form.name,
        email: form.email,
        company_name: role === "recruiter" ? form.company_name : undefined,
        current_title: role === "jobseeker" ? form.current_title : undefined,
      });
      router.push(resolvedReturnUrl);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't create your job board profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection>
      <div className="mx-auto max-w-3xl rounded-[32px] border border-enterprise-200 bg-white p-6 shadow-card noise-texture sm:p-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            Job Board
          </p>
          <h1 className="mt-3 font-display text-display-sm text-enterprise-950">
            Set up your Job Board profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-enterprise-600">
            Tell us a bit about yourself so we can personalize your experience.
          </p>
        </div>

        {!presetRole ? (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className={`h-0.5 w-12 rounded-full transition-colors duration-300 ${role ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-enterprise-200'}`} />
              <div className={`h-3 w-3 rounded-full transition-colors duration-300 ${role ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-enterprise-200'}`} />
            </div>

            <p className="mb-6 text-center text-xs text-enterprise-400">
              Choose carefully — this selection cannot be changed later.
            </p>

            <StaggerContainer className="grid gap-4 md:grid-cols-2">
              <StaggerItem>
                <RoleCard
                  title="Recruiter"
                  body="Post AI roles and review applicants from one dashboard."
                  icon={<BriefcaseBusiness className="h-5 w-5" />}
                  selected={role === "recruiter"}
                  onClick={() => setRole("recruiter")}
                />
              </StaggerItem>
              <StaggerItem>
                <RoleCard
                  title="Job Seeker"
                  body="Apply to AI roles and track your applications."
                  icon={<Send className="h-5 w-5" />}
                  selected={role === "jobseeker"}
                  onClick={() => setRole("jobseeker")}
                />
              </StaggerItem>
            </StaggerContainer>
          </>
        ) : null}

        <AnimatePresence mode="wait">
          {role && (
            <motion.div
              key="onboarding-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
                {error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <Field label="Name" required>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className={inputClassName}
                  />
                </Field>
                {role === "recruiter" ? (
                  <Field label="Company name" required>
                    <input
                      required
                      value={form.company_name}
                      onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                      className={inputClassName}
                    />
                  </Field>
                ) : null}
                {role === "jobseeker" ? (
                  <Field label="Current title" required>
                    <input
                      required
                      value={form.current_title}
                      onChange={(event) => setForm({ ...form, current_title: event.target.value })}
                      className={inputClassName}
                    />
                  </Field>
                ) : null}
                <div className="mt-2 flex justify-end">
                  <Button type="submit" disabled={!role || isSubmitting}>
                    {isSubmitting ? "Creating profile\u2026" : "Create profile"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
}

function RoleCard({
  title,
  body,
  icon,
  selected,
  onClick,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`rounded-3xl border p-6 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-card"
          : "border-enterprise-200 bg-enterprise-50 hover:border-blue-300 hover:bg-blue-50/50"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
          selected
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            : "bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700"
        }`}
      >
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-semibold text-enterprise-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-enterprise-600">{body}</p>
    </motion.button>
  );
}

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
      <span className="mb-2 block text-sm font-medium font-display text-enterprise-700">
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
  "w-full rounded-2xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
