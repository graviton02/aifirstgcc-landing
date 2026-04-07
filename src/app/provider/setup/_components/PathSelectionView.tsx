"use client";

import { Search, Store } from "lucide-react";
import { motion } from "framer-motion";
import { PathCard } from "./shared";

interface PathSelectionViewProps {
  onChoosePath: (path: "claim_existing" | "create_new") => void;
  changingPath: "claim_existing" | "create_new" | null;
  submitError: string;
}

export function PathSelectionView({
  onChoosePath,
  changingPath,
  submitError,
}: PathSelectionViewProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] items-start justify-center pt-4 md:items-center md:pt-0">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-20 h-[480px] w-[480px] rounded-full bg-primary/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-accent-purple/[0.05] blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="relative mx-auto w-full max-w-5xl px-4"
      >
        <div className="rounded-3xl border border-enterprise-200/80 bg-white/80 p-8 shadow-card backdrop-blur-sm md:p-10">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-primary/[0.08] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Get Started
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-enterprise-900 md:text-4xl">
              List your company on Orbys360
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-enterprise-500">
              Set up your provider profile in minutes. Add your company and AI
              agents so GCC buyers can discover and connect with you.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <PathCard
              icon={Store}
              title="Add a new company"
              description="Your company isn't listed yet? Add your details and first AI agent — we'll review and get you live quickly."
              actionLabel="Get Started"
              isLoading={changingPath === "create_new"}
              onClick={() => onChoosePath("create_new")}
            />
            <PathCard
              icon={Search}
              title="Claim your company"
              description="Already see your company in our directory? Verify your identity and take control of your profile."
              actionLabel="Find My Company"
              isLoading={changingPath === "claim_existing"}
              onClick={() => onChoosePath("claim_existing")}
            />
          </div>

          {submitError && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
