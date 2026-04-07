"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { CompanyLogo } from "@/components/directory/CompanyLogo";

export function ShortlistedAgentsTab() {
  const shortlistRows = useQuery(api.shortlists.getMineWithDetails);
  const removeFromShortlist = useMutation(api.shortlists.remove);

  if (shortlistRows === undefined) {
    return <ShortlistSkeleton />;
  }

  if (!shortlistRows.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
          <Star className="h-12 w-12 text-primary/40" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
          No shortlisted agents yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-enterprise-500">
          Browse the directory to find and shortlist AI agents for your
          organization.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Browse Directory
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h3 className="font-semibold text-enterprise-900">
          Shortlisted Agents
        </h3>
        <span className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs text-enterprise-500">
          {shortlistRows.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {shortlistRows.map((row: any, index: number) => {
          const categoryColor =
            CATEGORY_COLORS[row.agent.category] ?? "bg-enterprise-400";
          const companyName = row.company?.name ?? "Unknown company";

          return (
            <motion.div
              key={row.shortlistId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <CompanyLogo company={row.company ?? undefined} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs text-enterprise-500">{companyName}</p>
                    <h4 className="mt-1 font-semibold text-enterprise-900">
                      {row.agent.agent_name}
                    </h4>
                    {row.agent.tagline && (
                      <p className="mt-1 line-clamp-2 text-sm text-enterprise-600">
                        {row.agent.tagline}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${categoryColor}`} />
                      <span className="text-xs text-enterprise-500">
                        {row.agent.category}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromShortlist({ agent_id: row.agent._id })}
                  className="ml-2 shrink-0 rounded-lg p-2 text-enterprise-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Remove from shortlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 border-t border-enterprise-100 pt-3">
                <Link
                  href={
                    row.agent.slug
                      ? `/agents/${row.agent.slug}`
                      : `/agents/${row.agent._id}`
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ShortlistSkeleton() {
  return (
    <div>
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-enterprise-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl bg-white p-6 shadow-card"
          >
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 rounded-lg bg-enterprise-200" />
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-enterprise-100" />
                <div className="mt-2 h-4 w-40 rounded bg-enterprise-200" />
                <div className="mt-3 h-3 w-full rounded bg-enterprise-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-enterprise-100" />
              </div>
            </div>
            <div className="mt-4 border-t border-enterprise-100 pt-3">
              <div className="h-3 w-20 rounded bg-enterprise-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
