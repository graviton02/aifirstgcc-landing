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
  logo_url?: string;
  functional_categories?: string[];
  industry_categories?: string[];
  infrastructure_categories?: string[];
  use_cases: { title: string; description: string }[];
  expected_outcomes?: string[];
  integrations?: string[];
  source_url?: string;
  demo_url?: string;
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
  company_size: string;
  logo_url?: string;
  logo_bg?: string;
  primary_verticals: string[];
  contact_email?: string;
  contact_url?: string;
  clerk_org_id?: string;
  verification_status: string;
  claim_status: string;
}
