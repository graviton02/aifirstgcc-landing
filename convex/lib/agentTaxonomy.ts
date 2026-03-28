import {
  AgentDraftInput,
  AgentUseCaseInput,
  getAgentDraftValidationErrors,
  normalizeAgentDraftInput,
  normalizeAgentUseCases,
} from "../../src/lib/agentSubmission";
import {
  getInvalidFunctionalCategories,
  getInvalidIndustryCategories,
  normalizeCategorySelections,
  normalizeFunctionalCategorySelections,
  normalizeIndustryCategorySelections,
} from "../../src/lib/categories";
import { appError } from "./errors";

type AgentTaxonomyInput = {
  functional_categories?: readonly string[];
  industry_categories?: readonly string[];
  industries?: readonly string[];
};

type AgentEditableStringField =
  | "agent_name"
  | "tagline"
  | "description"
  | "category"
  | "source_url"
  | "demo_url";

type AgentEditableArrayField =
  | "infrastructure_categories"
  | "integrations"
  | "expected_outcomes";

type AgentSearchTextInput = {
  agent_name: string;
  description: string;
  tagline?: string;
  category?: string;
  functional_categories?: readonly string[];
  industry_categories?: readonly string[];
  integrations?: readonly string[];
  expected_outcomes?: readonly string[];
};

export function normalizeAndValidateFunctionalCategories(
  values?: readonly string[]
) {
  const normalized = normalizeFunctionalCategorySelections(values);
  const invalid = getInvalidFunctionalCategories(normalized);

  if (invalid.length > 0) {
    appError("agent_functional_categories_invalid", `Invalid functional categories: ${invalid.join(", ")}`, 400);
  }

  return normalized;
}

export function normalizeAndValidateIndustryCategories(
  values?: readonly string[]
) {
  const normalized = normalizeIndustryCategorySelections(values);
  const invalid = getInvalidIndustryCategories(normalized);

  if (invalid.length > 0) {
    appError("agent_industry_categories_invalid", `Invalid industry categories: ${invalid.join(", ")}`, 400);
  }

  return normalized;
}

export function normalizeAndValidateAgentTaxonomy(
  input: AgentTaxonomyInput
) {
  const functional_categories = normalizeAndValidateFunctionalCategories(
    input.functional_categories
  );
  const industry_categories = normalizeAndValidateIndustryCategories(
    input.industry_categories ?? input.industries
  );

  return {
    functional_categories,
    industry_categories,
    industries: industry_categories,
  };
}

export function normalizeAndValidateCompleteAgent(input: AgentDraftInput) {
  const errors = getAgentDraftValidationErrors(input);
  if (errors.length > 0) {
    appError("agent_validation_failed", errors.join(" "), 400);
  }

  return normalizeAgentDraftInput(input);
}

export function getAgentValidationErrors(input: AgentDraftInput) {
  return getAgentDraftValidationErrors(input);
}

export function normalizeAgentEditPayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const nextPayload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === "business_functions") {
      continue;
    }

    if (isEditableStringField(key)) {
      if (typeof value !== "string") {
        appError("agent_edit_string_invalid", `${key} must be a string.`, 400);
      }
      nextPayload[key] = value.trim();
      continue;
    }

    if (key === "use_cases") {
      if (!Array.isArray(value)) {
        appError("agent_edit_use_cases_invalid", "use_cases must be an array.", 400);
      }
      nextPayload.use_cases = normalizeAgentUseCases(value as AgentUseCaseInput[]);
      continue;
    }

    if (key === "functional_categories") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        appError("agent_edit_functional_categories_invalid", "functional_categories must be an array of strings.", 400);
      }
      nextPayload.functional_categories =
        normalizeAndValidateFunctionalCategories(value) ?? [];
      continue;
    }

    if (key === "industry_categories" || key === "industries") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        appError("agent_edit_industry_categories_invalid", `${key} must be an array of strings.`, 400);
      }
      const industry_categories = normalizeAndValidateIndustryCategories(value) ?? [];
      nextPayload.industry_categories = industry_categories;
      nextPayload.industries = industry_categories;
      continue;
    }

    if (isEditableArrayField(key)) {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        appError("agent_edit_array_invalid", `${key} must be an array of strings.`, 400);
      }
      nextPayload[key] = normalizeCategorySelections(value) ?? [];
      continue;
    }

    nextPayload[key] = value;
  }

  return nextPayload;
}

export function buildAgentSearchText(input: AgentSearchTextInput) {
  return (
    normalizeCategorySelections([
      input.agent_name,
      input.description,
      input.tagline ?? "",
      input.category ?? "",
      ...(input.functional_categories ?? []),
      ...(input.industry_categories ?? []),
      ...(input.integrations ?? []),
      ...(input.expected_outcomes ?? []),
    ])?.join(" ") ?? ""
  );
}

export function stringArraysEqual(
  left?: readonly string[],
  right?: readonly string[]
) {
  const normalizedLeft = normalizeCategorySelections(left) ?? [];
  const normalizedRight = normalizeCategorySelections(right) ?? [];

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

function isEditableStringField(key: string): key is AgentEditableStringField {
  return [
    "agent_name",
    "tagline",
    "description",
    "category",
    "source_url",
    "demo_url",
  ].includes(key);
}

function isEditableArrayField(key: string): key is AgentEditableArrayField {
  return [
    "infrastructure_categories",
    "integrations",
    "expected_outcomes",
  ].includes(key);
}
