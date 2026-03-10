"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Agent {
  _id: string;
  slug?: string;
  agent_name: string;
  tagline?: string;
  description?: string;
  category: string;
  functional_categories?: string[];
  logo_url?: string;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const href = agent.slug ? `/agents/${agent.slug}` : `/agents/${agent._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link
        href={href}
        className="block p-6 bg-white rounded-xl border border-enterprise-200 shadow-card hover:shadow-card-hover transition-all hover:border-primary/30 group"
      >
        <div className="flex items-start gap-3 mb-3">
          {agent.logo_url && (
            <img src={agent.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-enterprise-900 group-hover:text-primary transition-colors truncate">
              {agent.agent_name}
            </h3>
            {agent.tagline && (
              <p className="text-sm text-enterprise-600 line-clamp-2 mt-1">{agent.tagline}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
            {agent.category}
          </span>
          {agent.functional_categories?.slice(0, 2).map((cat) => (
            <span key={cat} className="px-2 py-0.5 bg-enterprise-100 text-enterprise-600 text-xs rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
