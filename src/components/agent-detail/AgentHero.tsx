"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowSquareOut, Scales, Check, Star } from "@phosphor-icons/react";
import type { Agent, Company } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { useCompare } from "@/hooks/useCompare";
import { ShortlistButton } from "@/components/shared/ShortlistButton";
import { CompanyLogo } from "@/components/directory/CompanyLogo";

interface Props {
  agent: Agent;
  company?: Company;
}

export function AgentHero({ agent, company }: Props) {
  const dotColor = CATEGORY_COLORS[agent.category] || "bg-enterprise-400";
  const slug = agent.slug ?? agent._id;
  const { has, add, remove, isFull } = useCompare();
  const isSelected = has(slug);

  const toggleCompare = () => {
    if (isSelected) {
      remove(slug);
    } else if (!isFull) {
      add(slug, agent.agent_name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Category + company */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-enterprise-600">
            {agent.category}
          </span>
        </div>
        <span className="text-enterprise-200">|</span>
        <div className="flex items-center gap-2">
          <CompanyLogo company={company} size="xs" />
          {company ? (
            <Link
              href={`/companies/${company.slug}`}
              className="text-sm text-enterprise-500 hover:text-primary transition-colors"
            >
              {company.name}
            </Link>
          ) : (
            <span className="text-sm text-enterprise-500">
              Unknown
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h1 className="font-display text-display-md md:text-display-lg text-enterprise-950 tracking-tighter leading-none mb-4">
        {agent.agent_name}
      </h1>

      {(agent.review_count ?? 0) > 0 && agent.rating ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-enterprise-600">
          <Star weight="fill" className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-enterprise-900">{agent.rating.toFixed(1)}</span>
          <span>({agent.review_count} review{agent.review_count === 1 ? "" : "s"})</span>
        </div>
      ) : null}

      {/* Tagline */}
      <p className="text-lg text-enterprise-500 leading-relaxed mb-6">
        {agent.tagline}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        <ShortlistButton
          agentId={agent._id}
          variant="hero"
          className="px-4 py-2.5"
        />
        <button
          onClick={toggleCompare}
          disabled={isFull && !isSelected}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
              : "bg-enterprise-100 text-enterprise-600 border border-enterprise-200/60 hover:bg-enterprise-150 hover:text-enterprise-700"
          } ${isFull && !isSelected ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {isSelected ? (
            <>
              <Check weight="bold" className="w-4 h-4" />
              Added to compare
            </>
          ) : (
            <>
              <Scales weight="duotone" className="w-4 h-4" />
              Add to compare
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <div className="border-t border-enterprise-200/60 pt-6">
        <p className="text-base text-enterprise-600 leading-relaxed">
          {agent.description}
        </p>
      </div>

      {(agent.source_url || agent.demo_url) && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {agent.source_url ? (
            <a
              href={agent.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Visit product page
              <ArrowSquareOut weight="bold" className="w-4 h-4" />
            </a>
          ) : null}
          {agent.demo_url ? (
            <a
              href={agent.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View demo
              <ArrowSquareOut weight="bold" className="w-4 h-4" />
            </a>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
