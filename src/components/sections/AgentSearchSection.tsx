"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FeaturedAgentCard } from "@/components/directory/FeaturedAgentCard";

export function AgentSearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const featuredAgents = useQuery(api.agents.list, { limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/directory");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-enterprise-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-display-md text-enterprise-900 mb-4">
            Search for Your Agent
          </h2>
          <p className="text-lg text-enterprise-600 max-w-2xl mx-auto">
            Discover AI agents across industries and functions to transform your operations.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-enterprise-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, category, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-card text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {featuredAgents?.data && featuredAgents.data.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-enterprise-800 mb-6 text-center">
              Featured Agents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.data.slice(0, 6).map((agent) => (
                <FeaturedAgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
