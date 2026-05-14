// Shared types for agent and company data.
// These mirror the Convex document shape but are plain interfaces
// so components don't need to import from Convex directly.

export interface Agent {
  _id: string;
  slug?: string;
  agent_name: string;
  tagline?: string;
  description: string;
  category: string;
  company_id?: string;
  company_name?: string;
  company_slug?: string;
  company_logo_storage_id?: string;
  company_logo_url?: string;
  company_logo_bg?: string;
  logo_url?: string;
  functional_categories?: string[];
  industry_categories?: string[];
  infrastructure_categories?: string[];
  use_cases: { title: string; description: string }[];
  expected_outcomes?: string[];
  integrations?: string[];
  source_url?: string;
  demo_url?: string;
  rating?: number;
  rating_effectiveness?: number;
  rating_value?: number;
  review_count?: number;
  status: string;
}

export interface AgentDirectoryCard {
  _id: string;
  slug?: string;
  agent_name: string;
  tagline?: string;
  category: string;
  company_id?: string;
  company_name?: string;
  company_slug?: string;
  company_logo_storage_id?: string;
  company_logo_url?: string;
  company_logo_bg?: string;
  functional_categories?: string[];
  industry_categories?: string[];
  infrastructure_categories?: string[];
  rating?: number;
  review_count?: number;
  status: string;
}

export interface Company {
  _id: string;
  slug: string;
  name: string;
  description: string;
  website: string;
  headquarters: string;
  founded?: number;
  logo_url?: string;
  logo_bg?: string;
  primary_verticals: string[];
  contact_email?: string;
  contact_url?: string;
  clerk_org_id?: string;
  verification_status: string;
  claim_status: string;
}
