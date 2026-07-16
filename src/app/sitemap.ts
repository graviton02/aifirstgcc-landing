import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { ALL_CATEGORIES, slugifyCategory } from "@/lib/categories";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/advisors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Category pages
  for (const cat of ALL_CATEGORIES) {
    entries.push({
      url: `${BASE_URL}/categories/${slugifyCategory(cat)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Agent pages
  try {
    const agentSlugs = await fetchQuery(api.agents.listAllSlugs, {});
    for (const a of agentSlugs) {
      entries.push({
        url: `${BASE_URL}/agents/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Skip if Convex unavailable during build
  }

  // Company pages
  try {
    const companySlugs = await fetchQuery(api.companies.listAllSlugs, {});
    for (const c of companySlugs) {
      entries.push({
        url: `${BASE_URL}/companies/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Skip if Convex unavailable during build
  }

  return entries;
}
