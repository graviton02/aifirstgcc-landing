"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Scales, Check } from "@phosphor-icons/react";
import type { Agent, Company } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { CompanyLogo } from "./CompanyLogo";
import { useCompare } from "@/hooks/useCompare";

interface AgentCardProps {
  agent: Agent;
  company?: Company;
  index?: number;
}

export function AgentCard({ agent, company, index = 0 }: AgentCardProps) {
  const dotColor = CATEGORY_COLORS[agent.category] || "bg-enterprise-400";
  const companyName = company?.name || "Unknown";
  const href = `/agents/${agent.slug ?? agent._id}`;
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Card wrapper — relative so the compare button can be positioned absolutely */}
      <div className="relative group">
        <Link href={href} className="block">
          <div className="relative p-7 pb-8 rounded-2xl bg-white border border-enterprise-200/60 hover:border-enterprise-300/80 transition-[transform,border-color,box-shadow] duration-300 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] flex flex-col min-h-[338px]">
            {/* Header row */}
            <div className="flex items-start gap-4 mb-6">
              <CompanyLogo company={company} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold text-enterprise-950 tracking-tight group-hover:text-primary transition-colors duration-200 truncate">
                  {agent.agent_name}
                </h3>
                <p className="text-sm text-enterprise-400 mt-1">
                  {companyName}
                </p>
              </div>
              <ArrowUpRight
                weight="bold"
                className="w-5 h-5 text-enterprise-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[transform,color] duration-200 shrink-0 mt-1"
              />
            </div>

            {/* Tagline */}
            <p className="text-base text-enterprise-500 leading-relaxed line-clamp-3 flex-1 mb-8">
              {agent.tagline}
            </p>

            {/* Footer meta */}
            <div className="flex items-center gap-2.5 mt-auto">
              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              <span className="text-sm text-enterprise-500">
                {agent.category}
              </span>
              {(agent.industry_categories?.length ?? 0) > 0 && (
                <>
                  <span className="text-enterprise-200">/</span>
                  <span className="text-sm text-enterprise-400 truncate">
                    {agent.industry_categories?.[0]}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Compare button — outside the Link, positioned bottom-right */}
        <button
          onClick={toggleCompare}
          disabled={isFull && !isSelected}
          className={`absolute bottom-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-enterprise-50 text-enterprise-400 border border-enterprise-200/60 opacity-0 group-hover:opacity-100 hover:text-enterprise-600 hover:border-enterprise-300"
          } ${isFull && !isSelected ? "cursor-not-allowed" : ""}`}
        >
          {isSelected ? (
            <>
              <Check weight="bold" className="w-3 h-3" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Scales weight="bold" className="w-3 h-3" />
              <span>Compare</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
