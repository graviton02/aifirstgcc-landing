export const FUNCTIONAL_CATEGORIES = [
  "Customer Experience", "Sales & Marketing", "Finance & Accounting",
  "HR & Workforce", "Engineering & DevOps", "IT Operations",
  "Data & Analytics", "Legal & Compliance", "Operations & Supply Chain",
] as const;

export const INDUSTRY_CATEGORIES = [
  "Healthcare & Life Sciences", "Financial Services (BFSI)", "Manufacturing",
  "Automotive & Mobility", "Retail & E-commerce", "Telecom & Media",
  "Energy & Utilities", "Real Estate & Construction", "Logistics & Transportation",
  "Government & Public Sector", "Education", "Agriculture & AgriTech",
  "Aerospace & Defense",
] as const;

export const INFRASTRUCTURE_CATEGORIES = [
  "Agent Platforms & Builders", "AI Infrastructure & Models", "Agent Tooling & Monitoring",
] as const;

export const ALL_CATEGORIES = [
  ...FUNCTIONAL_CATEGORIES, ...INDUSTRY_CATEGORIES, ...INFRASTRUCTURE_CATEGORIES,
] as const;

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function categoryFromSlug(slug: string): string | undefined {
  return ALL_CATEGORIES.find((c) => slugifyCategory(c) === slug);
}
