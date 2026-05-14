"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Agent {
  _id: string;
  slug?: string;
  agent_name: string;
  tagline?: string;
  category: string;
  functional_categories?: string[];
}

export function FeaturedAgentCard({ agent }: { agent: Agent }) {
  const href = agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link href={href} prefetch={false} className="block p-6 bg-white rounded-xl border border-enterprise-200 shadow-card hover:shadow-card-hover transition-shadow">
        <h4 className="font-semibold text-enterprise-900 mb-1">{agent.agent_name}</h4>
        {agent.tagline && (
          <p className="text-sm text-enterprise-600 mb-3 line-clamp-2">{agent.tagline}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
            {agent.category}
          </span>
          {agent.functional_categories?.filter((cat) => cat !== agent.category).slice(0, 2).map((cat) => (
            <span key={cat} className="px-2 py-0.5 bg-enterprise-100 text-enterprise-600 text-xs rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
