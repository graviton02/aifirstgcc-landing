import {
  getInvalidFunctionalCategories,
  getInvalidIndustryCategories,
  normalizeCategorySelections,
  normalizeFunctionalCategorySelections,
  normalizeIndustryCategorySelections,
} from "./categories";

export interface AgentUseCase {
  title: string;
  description: string;
}

export interface AgentFormData {
  agent_name: string;
  tagline: string;
  description: string;
  category: string;
  functional_categories: string[];
  industry_categories: string[];
  infrastructure_categories: string[];
  use_cases: AgentUseCase[];
  integrations: string[];
  expected_outcomes: string[];
  source_url: string;
  demo_url: string;
}

export const EMPTY_AGENT_FORM: AgentFormData = {
  agent_name: "",
  tagline: "",
  description: "",
  category: "",
  functional_categories: [],
  industry_categories: [],
  infrastructure_categories: [],
  use_cases: [],
  integrations: [],
  expected_outcomes: [],
  source_url: "",
  demo_url: "",
};

export type AgentUseCaseInput =
  | string
  | {
      title?: string | null;
      description?: string | null;
    };

export type AgentDraftInput = Partial<
  Omit<AgentFormData, "use_cases"> & {
    use_cases: readonly AgentUseCaseInput[];
    industries: readonly string[];
  }
>;

export interface NormalizedAgentDraft {
  agent_name: string;
  tagline?: string;
  description: string;
  category: string;
  functional_categories?: string[];
  industry_categories?: string[];
  industries?: string[];
  infrastructure_categories?: string[];
  use_cases: AgentUseCase[];
  integrations?: string[];
  expected_outcomes?: string[];
  source_url?: string;
  demo_url?: string;
}

export function agentToFormData(agent: AgentDraftInput | null | undefined): AgentFormData {
  return {
    agent_name: asString(agent?.agent_name),
    tagline: asString(agent?.tagline),
    description: asString(agent?.description),
    category: asString(agent?.category),
    functional_categories: [...(agent?.functional_categories ?? [])],
    industry_categories: [...(agent?.industry_categories ?? agent?.industries ?? [])],
    infrastructure_categories: [...(agent?.infrastructure_categories ?? [])],
    use_cases: normalizeAgentUseCases(agent?.use_cases),
    integrations: [...(agent?.integrations ?? [])],
    expected_outcomes: [...(agent?.expected_outcomes ?? [])],
    source_url: asString(agent?.source_url),
    demo_url: asString(agent?.demo_url),
  };
}

export function normalizeAgentDraftInput(input: AgentDraftInput): NormalizedAgentDraft {
  const functional_categories = normalizeFunctionalCategorySelections(
    input.functional_categories
  );
  const industry_categories = normalizeIndustryCategorySelections(
    input.industry_categories ?? input.industries
  );

  return {
    agent_name: asString(input.agent_name).trim(),
    tagline: asOptionalString(input.tagline),
    description: asString(input.description).trim(),
    category: asString(input.category).trim(),
    functional_categories,
    industry_categories,
    industries: industry_categories,
    infrastructure_categories: normalizeCategorySelections(input.infrastructure_categories),
    use_cases: normalizeAgentUseCases(input.use_cases),
    integrations: normalizeCategorySelections(input.integrations),
    expected_outcomes: normalizeCategorySelections(input.expected_outcomes),
    source_url: asOptionalString(input.source_url),
    demo_url: asOptionalString(input.demo_url),
  };
}

export function getAgentDraftValidationErrors(input: AgentDraftInput): string[] {
  const normalized = normalizeAgentDraftInput(input);
  const errors: string[] = [];

  if (!normalized.agent_name) {
    errors.push("Agent name is required.");
  }

  if (!normalized.category) {
    errors.push("Category is required.");
  }

  if (!normalized.description) {
    errors.push("Description is required.");
  }

  if ((normalized.functional_categories?.length ?? 0) === 0) {
    errors.push("Select at least one functional category.");
  }

  if ((normalized.industry_categories?.length ?? 0) === 0) {
    errors.push("Select at least one industry category.");
  }

  if (normalized.use_cases.length === 0) {
    errors.push("Add at least one use case.");
  }

  const invalidFunctional = getInvalidFunctionalCategories(
    normalized.functional_categories
  );
  if (invalidFunctional.length > 0) {
    errors.push(`Invalid functional categories: ${invalidFunctional.join(", ")}.`);
  }

  const invalidIndustry = getInvalidIndustryCategories(
    normalized.industry_categories
  );
  if (invalidIndustry.length > 0) {
    errors.push(`Invalid industry categories: ${invalidIndustry.join(", ")}.`);
  }

  return errors;
}

export function normalizeAgentUseCases(
  useCases?: readonly AgentUseCaseInput[]
): AgentUseCase[] {
  if (!useCases) {
    return [];
  }

  return useCases
    .map((useCase) => {
      const raw = typeof useCase === "string" ? useCase : asString(useCase?.title);
      const description = typeof useCase === "string" ? "" : asString(useCase?.description).trim();

      let title = raw.trim().replace(/[.;,]\s*$/, "");
      if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      return { title, description };
    })
    .filter((useCase) => useCase.title.length > 0);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value).trim();
  return normalized || undefined;
}
