"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/report-error";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  CANDIDATE_LEAD_DEFAULT_SOURCE,
  CANDIDATE_LEAD_STORAGE_KEY,
} from "@/jobs/config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CandidateSignupHero() {
  const searchParams = useSearchParams();
  const submitLead = useMutation(api.candidateLeads.submitCandidateLead);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "" });

  // Returning campaign traffic shouldn't be asked twice.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(CANDIDATE_LEAD_STORAGE_KEY)) {
        setSubmitted(true);
      }
    } catch {
      // Private browsing or blocked storage — just show the form.
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.full_name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await submitLead({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        source: searchParams.get("src") ?? CANDIDATE_LEAD_DEFAULT_SOURCE,
        user_agent:
          typeof navigator === "undefined" ? undefined : navigator.userAgent,
      });

      try {
        window.localStorage.setItem(
          CANDIDATE_LEAD_STORAGE_KEY,
          form.email.trim().toLowerCase()
        );
      } catch {
        // Storage is best-effort; the lead is already saved server-side.
      }

      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't add you to the list."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection>
      <section className="noise-texture relative overflow-hidden rounded-[32px] border border-enterprise-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_45%,_#f3f4f6_100%)] px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute right-8 top-8 hidden h-28 w-28 rounded-full bg-blue-200/40 blur-3xl lg:block" />
        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden h-32 w-32 rounded-full bg-purple-200/30 blur-3xl lg:block" />

        <Link
          href="/jobs/post"
          className="absolute right-6 top-6 z-10 hidden text-sm font-medium text-enterprise-600 transition-colors hover:text-blue-700 sm:block"
        >
          Hiring instead? Post a job &rarr;
        </Link>

        {submitted ? (
          <DoneState />
        ) : (
          <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: pitch */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                <MapPin className="h-3.5 w-3.5" />
                AI Jobs in India
              </div>
              <h1 className="mt-5 font-display text-display-sm font-bold tracking-tight text-enterprise-950 sm:text-display-md">
                Get notified when new AI roles open in India
              </h1>
              <p className="mt-4 text-base leading-7 text-enterprise-700 sm:text-lg">
                Leave your name and email. We&rsquo;ll email you the moment new
                AI roles go live &mdash; no account, no job-hunting.
              </p>
              <ul className="mt-6 hidden gap-5 text-sm text-enterprise-600 sm:flex">
                <li className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Only AI &amp; ML roles
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Takes 15 seconds
                </li>
              </ul>
            </div>

            {/* Right: form card */}
            <div className="w-full rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
              <form onSubmit={handleSubmit} noValidate className="grid gap-4">
                {error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <Field label="Name" htmlFor="candidate-name">
                  <input
                    id="candidate-name"
                    value={form.full_name}
                    onChange={(event) =>
                      setForm({ ...form, full_name: event.target.value })
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                    className={inputClassName}
                  />
                </Field>
                <Field label="Email" htmlFor="candidate-email">
                  <input
                    id="candidate-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClassName}
                  />
                </Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-2xl"
                >
                  {isSubmitting ? "Adding you…" : "Notify me about AI roles"}
                </Button>
                <p className="text-center text-xs text-enterprise-500">
                  We&rsquo;ll only email you about new AI roles. Unsubscribe
                  anytime.
                </p>
              </form>
            </div>
          </div>
        )}
      </section>
    </AnimatedSection>
  );
}

function DoneState() {
  return (
    <div className="relative mx-auto max-w-xl py-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-card">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-display-sm font-bold tracking-tight text-enterprise-950">
        You&rsquo;re on the list
      </h1>
      <p className="mt-4 text-base leading-7 text-enterprise-700">
        We&rsquo;ll email you when new AI roles open in India. In the meantime,
        everything currently open is below.
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-display text-sm font-medium text-enterprise-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
