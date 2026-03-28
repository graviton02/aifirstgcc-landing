"use client";

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-enterprise-100 px-2.5 py-1 text-xs font-medium text-enterprise-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function UseCaseList({
  useCases,
}: {
  useCases: { title?: string; description?: string }[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {useCases.map((useCase, index) => (
        <div
          key={`${useCase.title ?? "use-case"}-${index}`}
          className="rounded-lg border border-enterprise-100 bg-enterprise-50 p-3"
        >
          <p className="text-sm font-medium text-enterprise-900">
            {useCase.title ?? "Untitled use case"}
          </p>
          {useCase.description && (
            <p className="mt-1 text-sm text-enterprise-600">{useCase.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function AgentReviewDetails({
  agent,
  validationErrors = [],
}: {
  agent: any;
  validationErrors?: string[];
}) {
  return (
    <div className="space-y-3 border-t border-enterprise-100 pt-3 text-sm">
      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
          <p className="font-medium">Missing or invalid required fields</p>
          <ul className="mt-1 list-disc pl-5">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {agent.company?.name && (
        <div>
          <span className="font-medium text-enterprise-600">Company:</span>{" "}
          <span className="text-enterprise-700">{agent.company.name}</span>
        </div>
      )}

      {agent.description && (
        <div>
          <span className="font-medium text-enterprise-600">Description:</span>
          <p className="mt-1 text-enterprise-700 whitespace-pre-wrap">
            {agent.description}
          </p>
        </div>
      )}

      {agent.functional_categories?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Functional Categories:</span>
          <div className="mt-1">
            <ChipList items={agent.functional_categories} />
          </div>
        </div>
      )}

      {agent.industry_categories?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Industry Categories:</span>
          <div className="mt-1">
            <ChipList items={agent.industry_categories} />
          </div>
        </div>
      )}

      {agent.infrastructure_categories?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Infrastructure Categories:</span>
          <div className="mt-1">
            <ChipList items={agent.infrastructure_categories} />
          </div>
        </div>
      )}

      {agent.use_cases?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Use Cases:</span>
          <div className="mt-1">
            <UseCaseList useCases={agent.use_cases} />
          </div>
        </div>
      )}

      {agent.integrations?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Integrations:</span>
          <div className="mt-1">
            <ChipList items={agent.integrations} />
          </div>
        </div>
      )}

      {agent.expected_outcomes?.length > 0 && (
        <div>
          <span className="font-medium text-enterprise-600">Expected Outcomes:</span>
          <div className="mt-1">
            <ChipList items={agent.expected_outcomes} />
          </div>
        </div>
      )}

      {(agent.source_url || agent.demo_url) && (
        <div className="flex flex-wrap gap-4">
          {agent.source_url && (
            <a
              href={agent.source_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Source URL
            </a>
          )}
          {agent.demo_url && (
            <a
              href={agent.demo_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Demo URL
            </a>
          )}
        </div>
      )}
    </div>
  );
}
