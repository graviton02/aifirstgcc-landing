"use client";

import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { FUNCTIONAL_CATEGORIES, INDUSTRY_CATEGORIES } from "@/lib/categories";
import type { AgentFormData } from "@/lib/agentSubmission";

const CATEGORIES = Object.keys(CATEGORY_COLORS);

export function CategorySelect({
  id,
  value,
  onChange,
  required,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-enterprise-300 rounded-lg bg-white text-enterprise-900"
    >
      <option value="">Select a category</option>
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-enterprise-300 rounded-lg"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-enterprise-100 text-enterprise-700 rounded-lg hover:bg-enterprise-200 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-enterprise-100 text-enterprise-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="hover:text-enterprise-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaxonomyPalette({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const selectedSet = new Set(selected);
  const legacyValues = selected.filter((value) => !options.includes(value));

  const toggleOption = (option: string) => {
    if (selectedSet.has(option)) {
      onChange(selected.filter((value) => value !== option));
      return;
    }

    onChange([...selected, option]);
  };

  const removeLegacyValue = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selectedSet.has(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-enterprise-900 text-white"
                  : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {legacyValues.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Legacy {label}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            These values are on the agent already but are outside the current taxonomy.
            Remove them to fully standardize this field.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {legacyValues.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => removeLegacyValue(value)}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-sm text-amber-800"
              >
                {value}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const FUNCTIONAL_CATEGORY_OPTIONS = [...FUNCTIONAL_CATEGORIES];
export const INDUSTRY_CATEGORY_OPTIONS = [...INDUSTRY_CATEGORIES];

export function UseCaseFields({
  useCases,
  onChange,
  requireTitles = false,
}: {
  useCases: { title: string; description: string }[];
  onChange: (useCases: { title: string; description: string }[]) => void;
  requireTitles?: boolean;
}) {
  const addUseCase = () => {
    onChange([...useCases, { title: "", description: "" }]);
  };

  const removeUseCase = (index: number) => {
    onChange(useCases.filter((_, i) => i !== index));
  };

  const updateUseCase = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = useCases.map((uc, i) =>
      i === index ? { ...uc, [field]: value } : uc
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {useCases.map((uc, i) => (
        <div
          key={i}
          className="p-3 bg-white border border-enterprise-200 rounded-lg space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-enterprise-600">
              Use Case {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeUseCase(i)}
              className="p-1 text-enterprise-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={uc.title}
            onChange={(e) => updateUseCase(i, "title", e.target.value)}
            required={requireTitles}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg text-sm"
          />
          <textarea
            placeholder="Description"
            value={uc.description}
            onChange={(e) => updateUseCase(i, "description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addUseCase}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Use Case
      </button>
    </div>
  );
}

export function FormSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-enterprise-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-enterprise-50 transition-colors"
      >
        <span className="font-medium text-enterprise-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-enterprise-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

type UpdateAgentField = <K extends keyof AgentFormData>(
  key: K,
  value: AgentFormData[K]
) => void;

export function AgentFormSections({
  form,
  updateField,
  mode,
}: {
  form: AgentFormData;
  updateField: UpdateAgentField;
  mode: "submit" | "edit" | "resubmit" | "setup";
}) {
  const showRequiredHints = mode !== "edit";
  const fieldIdPrefix = `agent-${mode}`;

  return (
    <>
      <FormSection title="Basic Info">
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-agent-name`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Agent Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`${fieldIdPrefix}-agent-name`}
            type="text"
            value={form.agent_name}
            onChange={(e) => updateField("agent_name", e.target.value)}
            required
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
        </div>
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-tagline`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Tagline
          </label>
          <input
            id={`${fieldIdPrefix}-tagline`}
            type="text"
            value={form.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="Brief one-liner"
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
        </div>
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-category`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <CategorySelect
            id={`${fieldIdPrefix}-category`}
            value={form.category}
            onChange={(value) => updateField("category", value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-description`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`${fieldIdPrefix}-description`}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
        </div>
      </FormSection>

      <FormSection
        title="Classification"
        defaultOpen={mode !== "edit"}
      >
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1">
            Functional Categories
            {showRequiredHints && <span className="text-red-500"> *</span>}
          </label>
          <TaxonomyPalette
            label="functional categories"
            options={FUNCTIONAL_CATEGORY_OPTIONS}
            selected={form.functional_categories}
            onChange={(value) => updateField("functional_categories", value)}
          />
          {showRequiredHints && (
            <p className="mt-1 text-xs text-enterprise-500">
              Select at least one functional category.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1">
            Industry Categories
            {showRequiredHints && <span className="text-red-500"> *</span>}
          </label>
          <TaxonomyPalette
            label="industry categories"
            options={INDUSTRY_CATEGORY_OPTIONS}
            selected={form.industry_categories}
            onChange={(value) => updateField("industry_categories", value)}
          />
          {showRequiredHints && (
            <p className="mt-1 text-xs text-enterprise-500">
              Select at least one industry category.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1">
            Infrastructure Categories
          </label>
          <TagInput
            tags={form.infrastructure_categories}
            onChange={(value) => updateField("infrastructure_categories", value)}
            placeholder="e.g. Cloud, On-Premise"
          />
        </div>
      </FormSection>

      <FormSection title="Use Cases" defaultOpen={mode !== "edit"}>
        {showRequiredHints && (
          <p className="text-xs text-enterprise-500">
            Add at least one use case. The title is required.
          </p>
        )}
        <UseCaseFields
          useCases={form.use_cases}
          onChange={(value) => updateField("use_cases", value)}
          requireTitles={showRequiredHints}
        />
      </FormSection>

      <FormSection title="Integrations" defaultOpen={false}>
        <TagInput
          tags={form.integrations}
          onChange={(value) => updateField("integrations", value)}
          placeholder="e.g. Salesforce, Slack, HubSpot"
        />
      </FormSection>

      <FormSection title="Expected Outcomes" defaultOpen={false}>
        <TagInput
          tags={form.expected_outcomes}
          onChange={(value) => updateField("expected_outcomes", value)}
          placeholder="e.g. 30% reduction in response time"
        />
      </FormSection>

      <FormSection title="Links" defaultOpen={false}>
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-source-url`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Source URL
          </label>
          <input
            id={`${fieldIdPrefix}-source-url`}
            type="url"
            value={form.source_url}
            onChange={(e) => updateField("source_url", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
        </div>
        <div>
          <label
            htmlFor={`${fieldIdPrefix}-demo-url`}
            className="block text-sm font-medium text-enterprise-700 mb-1"
          >
            Demo URL
          </label>
          <input
            id={`${fieldIdPrefix}-demo-url`}
            type="url"
            value={form.demo_url}
            onChange={(e) => updateField("demo_url", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
        </div>
      </FormSection>
    </>
  );
}
