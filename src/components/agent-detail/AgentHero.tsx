"use client";

import Link from "next/link";

interface Props {
  agent: {
    agent_name: string;
    tagline?: string;
    description: string;
    category: string;
    functional_categories?: string[];
    industry_categories?: string[];
    logo_url?: string;
    website_url?: string;
  };
  company?: {
    name: string;
    slug?: string;
  } | null;
}

export function AgentHero({ agent, company }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-4">
        {agent.logo_url && (
          <img src={agent.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">{agent.agent_name}</h1>
          {agent.tagline && (
            <p className="text-lg text-enterprise-600 mt-1">{agent.tagline}</p>
          )}
          {company && (
            <p className="text-sm text-enterprise-500 mt-1">
              by{" "}
              {company.slug ? (
                <Link href={`/companies/${company.slug}`} className="text-primary hover:underline">
                  {company.name}
                </Link>
              ) : (
                company.name
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
          {agent.category}
        </span>
        {agent.functional_categories?.map((cat) => (
          <span key={cat} className="px-3 py-1 bg-enterprise-100 text-enterprise-600 text-sm rounded-full">
            {cat}
          </span>
        ))}
        {agent.industry_categories?.map((cat) => (
          <span key={cat} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
            {cat}
          </span>
        ))}
      </div>

      <p className="text-enterprise-700 leading-relaxed">{agent.description}</p>

      {agent.website_url && (
        <a
          href={agent.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-primary hover:underline text-sm"
        >
          Visit website
        </a>
      )}
    </div>
  );
}
