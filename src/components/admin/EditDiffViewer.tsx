"use client";

type EditRecord = Record<string, unknown>;

export function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getChangedFieldCount(payload?: EditRecord): number {
  return Object.keys(payload ?? {}).length;
}

export function summarizeFieldValue(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return "—";
  }

  if (Array.isArray(value)) {
    if (value.every(isPrimitiveValue)) {
      return value.map((item) => String(item)).join(", ");
    }

    if (value.every(isUseCaseLike)) {
      const count = value.length;
      return `${count} use case${count === 1 ? "" : "s"}`;
    }

    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  if (isPlainObject(value)) {
    return "Updated";
  }

  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

export function PendingEditDiff({
  currentRecord,
  payload,
}: {
  currentRecord?: EditRecord | null;
  payload?: EditRecord;
}) {
  const entries = Object.entries(payload ?? {});

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-enterprise-200 bg-enterprise-50 p-3 text-sm text-enterprise-600">
        No changed fields captured for this edit.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-enterprise-500">
        Only changed fields shown
      </p>

      {entries.map(([key, proposedValue]) => (
        <div
          key={key}
          className="overflow-hidden rounded-xl border border-enterprise-200"
        >
          <div className="border-b border-enterprise-100 bg-enterprise-50 px-4 py-2">
            <p className="text-sm font-medium text-enterprise-900">
              {formatFieldLabel(key)}
            </p>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2">
            <DiffValuePanel
              label="Current"
              value={currentRecord?.[key]}
              tone="muted"
            />
            <DiffValuePanel
              label="Proposed"
              value={proposedValue}
              tone="primary"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DiffValuePanel({
  label,
  value,
  tone,
}: {
  label: string;
  value: unknown;
  tone: "muted" | "primary";
}) {
  const classes =
    tone === "primary"
      ? "border-primary/20 bg-primary/5"
      : "border-enterprise-200 bg-white";

  return (
    <div className={`rounded-lg border p-3 ${classes}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-enterprise-500">
        {label}
      </p>
      <DiffValueContent value={value} />
    </div>
  );
}

function DiffValueContent({ value }: { value: unknown }) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <span className="text-sm text-enterprise-400">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.every(isPrimitiveValue)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={`${String(item)}-${index}`}
              className="rounded-full bg-enterprise-100 px-2.5 py-1 text-sm text-enterprise-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (value.every(isUseCaseLike)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-enterprise-200 bg-white p-3"
            >
              <p className="text-sm font-medium text-enterprise-900">
                {normalizeText(item.title)}
              </p>
              {normalizeText(item.description) && (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-enterprise-700">
                  {normalizeText(item.description)}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (value.every(isPlainObject)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-enterprise-200 bg-white p-3"
            >
              <ObjectValueContent value={item} />
            </div>
          ))}
        </div>
      );
    }
  }

  if (isPlainObject(value)) {
    return <ObjectValueContent value={value} />;
  }

  const text = formatScalar(value);
  return (
    <p className="whitespace-pre-wrap break-words text-sm text-enterprise-800">
      {text}
    </p>
  );
}

function ObjectValueContent({ value }: { value: EditRecord }) {
  const entries = Object.entries(value);

  if (entries.length === 0) {
    return <span className="text-sm text-enterprise-400">—</span>;
  }

  return (
    <div className="space-y-1.5">
      {entries.map(([key, nestedValue]) => (
        <div key={key} className="flex gap-2 text-sm">
          <span className="min-w-[90px] shrink-0 font-medium text-enterprise-500">
            {formatFieldLabel(key)}:
          </span>
          <span className="whitespace-pre-wrap break-words text-enterprise-800">
            {summarizeFieldValue(nestedValue)}
          </span>
        </div>
      ))}
    </div>
  );
}

function isPlainObject(value: unknown): value is EditRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitiveValue(
  value: unknown
): value is string | number | boolean {
  return ["string", "number", "boolean"].includes(typeof value);
}

function isUseCaseLike(
  value: unknown
): value is { title?: unknown; description?: unknown } {
  return (
    isPlainObject(value) &&
    ("title" in value || "description" in value)
  );
}

function formatScalar(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}
