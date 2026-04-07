"use client";

import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  Buildings,
  MapPin,
  Calendar,
  ShieldCheck,
  Shield,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { Agent, Company } from "@/lib/types";
import { useUserRole } from "@/auth/useUserRole";
import { ReachoutRequestButton } from "@/components/reachout/ReachoutRequestButton";
import { StarRatingDisplay } from "@/components/reviews/StarRating";

interface Props {
  agent: Agent;
  company?: Company;
}

export function AgentStatsPanel({ agent, company }: Props) {
  const { isSignedIn } = useAuth();
  const { role, isLoaded: roleLoaded } = useUserRole();
  const foundedYear = company?.founded;
  const primaryVerticals = company?.primary_verticals ?? [];
  const suppressClaimCtas = isSignedIn && (!roleLoaded || role === "gcc");
  const isUnclaimedCompany =
    company &&
    company.claim_status !== "claimed" &&
    company.claim_status !== "approved" &&
    company.claim_status !== "pending";

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
              {foundedYear ? (
                <div className="flex items-center gap-2.5">
                  <Calendar
                    weight="duotone"
                    className="w-4 h-4 text-enterprise-400"
                  />
                  <span className="text-sm text-enterprise-600">
                    Founded {foundedYear}
                  </span>
                </div>
              ) : null}
              {primaryVerticals.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
                    Primary Verticals
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {primaryVerticals.map((vertical) => (
                      <span
                        key={vertical}
                        className="rounded-md border border-enterprise-100 bg-enterprise-50 px-2.5 py-1 text-xs text-enterprise-600"
                      >
                        {vertical}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
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
              ) : null}
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

        {(agent.review_count ?? 0) > 0 && agent.rating ? (
          <>
            <div>
              <h3 className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest mb-3">
                Ratings
              </h3>
              <div className="space-y-3">
                <RatingRow label="Overall" value={agent.rating} />
                {agent.rating_effectiveness ? (
                  <RatingRow label="Effectiveness" value={agent.rating_effectiveness} />
                ) : null}
                {agent.rating_value ? (
                  <RatingRow label="Value" value={agent.rating_value} />
                ) : null}
                <p className="text-xs text-enterprise-400">
                  Based on {agent.review_count} review
                  {agent.review_count === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            <div className="h-px bg-enterprise-100" />
          </>
        ) : null}

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

        {agent.infrastructure_categories?.length ? (
          <>
            <div>
              <h3 className="text-xs font-semibold text-enterprise-400 uppercase tracking-widest mb-3">
                Infrastructure
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.infrastructure_categories.map((category) => (
                  <span
                    key={category}
                    className="px-2.5 py-1 rounded-md bg-enterprise-50 text-xs text-enterprise-600 border border-enterprise-100"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-enterprise-100" />
          </>
        ) : null}

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
      {isUnclaimedCompany && !suppressClaimCtas && (
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

function RatingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-enterprise-100 bg-enterprise-50/60 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-enterprise-800">{label}</p>
        <StarRatingDisplay value={value} className="mt-1" />
      </div>
      <span className="text-sm font-semibold text-enterprise-900">{value.toFixed(1)}</span>
    </div>
  );
}
