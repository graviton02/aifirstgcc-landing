"use client";

import { motion } from "framer-motion";
import {
  Buildings,
  MapPin,
  Calendar,
  ShieldCheck,
  Shield,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { Agent, Company } from "@/lib/types";
import { ReachoutRequestButton } from "@/components/reachout/ReachoutRequestButton";

interface Props {
  agent: Agent;
  company?: Company;
}

export function AgentStatsPanel({ agent, company }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="rounded-2xl bg-white border border-enterprise-200/60 p-6 space-y-5">
        {/* Company info */}
        {company && (
          <div>
            <h3 className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest mb-3">
              Company
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Buildings
                  weight="duotone"
                  className="w-4 h-4 text-enterprise-400"
                />
                <span className="text-sm text-enterprise-700">
                  {company.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin
                  weight="duotone"
                  className="w-4 h-4 text-enterprise-400"
                />
                <span className="text-sm text-enterprise-600">
                  {company.headquarters}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar
                  weight="duotone"
                  className="w-4 h-4 text-enterprise-400"
                />
                <span className="text-sm text-enterprise-600">
                  Founded {company.founded}
                </span>
              </div>
              {company.claim_status === "claimed" ? (
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    weight="duotone"
                    className="w-4 h-4 text-emerald-500"
                  />
                  <span className="text-sm font-medium text-emerald-600">
                    Verified
                  </span>
                </div>
              ) : company.claim_status === "approved" ? (
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    weight="duotone"
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-600">
                    Claimed
                  </span>
                </div>
              ) : company.claim_status === "pending" ? (
                <div className="flex items-center gap-2.5">
                  <Shield
                    weight="duotone"
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-sm font-medium text-amber-600">
                    Claim under review
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Shield
                    weight="duotone"
                    className="w-4 h-4 text-enterprise-400"
                  />
                  <Link
                    href={`/claim/${company.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Claim this profile
                  </Link>
                </div>
              )}
              <ReachoutRequestButton
                company={company}
                agents={[agent]}
                requestSource="agent_detail"
                managedLabel="Contact Provider"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              />
            </div>
          </div>
        )}

        <div className="h-px bg-enterprise-100" />

        {/* Functions */}
        <div>
          <h3 className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest mb-3">
            Functions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {agent.functional_categories?.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-md bg-enterprise-50 text-xs text-enterprise-600 border border-enterprise-100"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-enterprise-100" />

        {/* Industries */}
        <div>
          <h3 className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest mb-3">
            Industries
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {agent.industry_categories?.map((ind) => (
              <span
                key={ind}
                className="px-2.5 py-1 rounded-md bg-enterprise-50 text-xs text-enterprise-600 border border-enterprise-100"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-enterprise-100" />

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-2xl font-display font-semibold text-enterprise-950 tabular-nums">
              {agent.integrations?.length ?? 0}
            </span>
            <p className="text-xs text-enterprise-400 mt-0.5">
              Integrations
            </p>
          </div>
          <div>
            <span className="text-2xl font-display font-semibold text-enterprise-950 tabular-nums">
              {agent.use_cases.length}
            </span>
            <p className="text-xs text-enterprise-400 mt-0.5">
              Use cases
            </p>
          </div>
        </div>
      </div>

      {/* Claim CTA card — only for unclaimed profiles */}
      {company && company.claim_status !== "claimed" && company.claim_status !== "approved" && company.claim_status !== "pending" && (
        <div className="rounded-2xl border border-enterprise-200/60 bg-white p-4 mt-3">
          <p className="text-xs text-enterprise-700">
            Is this your company?{" "}
            <Link
              href={`/claim/${company.slug}`}
              className="font-medium text-primary hover:underline"
            >
              Claim &amp; customize your profile
            </Link>
          </p>
          <p className="text-[11px] italic text-enterprise-400 mt-1">
            This profile was created using publicly available information.
          </p>
        </div>
      )}
    </motion.div>
  );
}
