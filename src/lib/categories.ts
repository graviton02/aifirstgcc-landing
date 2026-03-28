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
  "Aerospace & Defense", "Technology", "Professional Services",
  "Gaming & Entertainment", "Crypto & Web3",
] as const;

export const INFRASTRUCTURE_CATEGORIES = [
  "Agent Platforms & Builders", "AI Infrastructure & Models", "Agent Tooling & Monitoring",
] as const;

export const ALL_CATEGORIES = [
  ...FUNCTIONAL_CATEGORIES, ...INDUSTRY_CATEGORIES, ...INFRASTRUCTURE_CATEGORIES,
] as const;

const FUNCTIONAL_CATEGORY_SET = new Set<string>(FUNCTIONAL_CATEGORIES);
const INDUSTRY_CATEGORY_SET = new Set<string>(INDUSTRY_CATEGORIES);

const FUNCTIONAL_CATEGORY_ALIASES: Record<string, string> = {
  "Human Resources": "HR & Workforce",
};

const INDUSTRY_CATEGORY_ALIASES: Record<string, string> = {
  Insurance: "Financial Services (BFSI)",
  "Banking & Finance": "Financial Services (BFSI)",
  Automotive: "Automotive & Mobility",
  "E-commerce & Retail": "Retail & E-commerce",
  retail: "Retail & E-commerce",
  EdTech: "Education",
  Healthcare: "Healthcare & Life Sciences",
  Government: "Government & Public Sector",
  "Oil & Gas": "Energy & Utilities",
  manufacturing: "Manufacturing",
  other: "",
  Other: "",
};

export function isKnownFunctionalCategory(category: string): boolean {
  return FUNCTIONAL_CATEGORY_SET.has(category);
}

export function isKnownIndustryCategory(category: string): boolean {
  return INDUSTRY_CATEGORY_SET.has(category);
}

export function normalizeCategorySelections(values?: readonly string[]) {
  return normalizeSelections(values);
}

export function normalizeFunctionalCategorySelections(values?: readonly string[]) {
  return normalizeSelections(values, FUNCTIONAL_CATEGORY_ALIASES);
}

export function normalizeIndustryCategorySelections(values?: readonly string[]) {
  return normalizeSelections(values, INDUSTRY_CATEGORY_ALIASES);
}

export function getInvalidFunctionalCategories(values?: readonly string[]) {
  return (values ?? []).filter((value) => !FUNCTIONAL_CATEGORY_SET.has(value));
}

export function getInvalidIndustryCategories(values?: readonly string[]) {
  return (values ?? []).filter((value) => !INDUSTRY_CATEGORY_SET.has(value));
}

function normalizeSelections(
  values?: readonly string[],
  aliases: Record<string, string> = {}
) {
  if (!values) return undefined;

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const canonical = aliases[trimmed] ?? trimmed;
    if (!canonical) continue;
    if (seen.has(canonical)) continue;

    seen.add(canonical);
    normalized.push(canonical);
  }

  return normalized.length > 0 ? normalized : undefined;
}

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function categoryFromSlug(slug: string): string | undefined {
  return ALL_CATEGORIES.find((c) => slugifyCategory(c) === slug);
}
