import { describe, it, expect } from "vitest";
import {
  INDUSTRY_CATEGORIES,
  getInvalidFunctionalCategories,
  getInvalidIndustryCategories,
  normalizeFunctionalCategorySelections,
  normalizeIndustryCategorySelections,
} from "@/lib/categories";

describe("category taxonomy helpers", () => {
  it("canonicalizes legacy functional and industry aliases", () => {
    expect(
      normalizeFunctionalCategorySelections([" Human Resources ", "HR & Workforce"])
    ).toEqual(["HR & Workforce"]);

    expect(
      normalizeIndustryCategorySelections([
        "Insurance",
        "Automotive",
        "E-commerce & Retail",
        "EdTech",
      ])
    ).toEqual([
      "Financial Services (BFSI)",
      "Automotive & Mobility",
      "Retail & E-commerce",
      "Education",
    ]);
  });

  it("accepts expanded industry taxonomy values", () => {
    expect(INDUSTRY_CATEGORIES).toContain("Technology");
    expect(INDUSTRY_CATEGORIES).toContain("Professional Services");
    expect(INDUSTRY_CATEGORIES).toContain("Gaming & Entertainment");
    expect(INDUSTRY_CATEGORIES).toContain("Crypto & Web3");

    expect(
      normalizeIndustryCategorySelections([
        "Technology",
        "Professional Services",
        "Gaming & Entertainment",
        "Crypto & Web3",
      ])
    ).toEqual([
      "Technology",
      "Professional Services",
      "Gaming & Entertainment",
      "Crypto & Web3",
    ]);
  });

  it("drops placeholder values and deduplicates normalized selections", () => {
    expect(
      normalizeIndustryCategorySelections([
        "  Banking & Finance ",
        "Financial Services (BFSI)",
        "other",
        "retail",
        "Retail & E-commerce",
      ])
    ).toEqual(["Financial Services (BFSI)", "Retail & E-commerce"]);
  });

  it("flags unknown values after normalization", () => {
    expect(getInvalidFunctionalCategories(["Unknown Function"])).toEqual([
      "Unknown Function",
    ]);

    const normalized = normalizeIndustryCategorySelections([
      "Unknown Industry",
      "Insurance",
    ]);

    expect(normalized).toEqual([
      "Unknown Industry",
      "Financial Services (BFSI)",
    ]);
    expect(getInvalidIndustryCategories(normalized)).toEqual(["Unknown Industry"]);
  });
});
