import * as Sentry from "@sentry/nextjs";

type ErrorTags = Record<string, string | number | boolean | undefined>;

type ReportErrorContext = {
  extra?: Record<string, unknown>;
  fingerprint?: string[];
  handled?: boolean;
  level?: Sentry.SeverityLevel;
  tags?: ErrorTags;
  userId?: string;
};

type ErrorData = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

function getErrorData(error: unknown): ErrorData | null {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return null;
  }

  const data = (error as { data?: unknown }).data;
  if (typeof data === "string") {
    return { message: data };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  return data as ErrorData;
}

function cleanErrorMessage(message: string, fallbackMessage: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return fallbackMessage;
  }

  const match = trimmed.match(/Uncaught Error: (.+?)(?:\n|$)/);
  return match ? match[1] : trimmed;
}

function normalizeError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    const data = getErrorData(error);
    if (typeof data?.message === "string") {
      const normalized = new Error(cleanErrorMessage(data.message, fallbackMessage));
      normalized.name = error.name;
      normalized.stack = error.stack;
      return normalized;
    }

    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  const data = getErrorData(error);
  if (typeof data?.message === "string") {
    return cleanErrorMessage(data.message, fallbackMessage);
  }

  if (error instanceof Error && error.message) {
    return cleanErrorMessage(error.message, fallbackMessage);
  }

  if (typeof error === "string" && error.trim()) {
    return cleanErrorMessage(error, fallbackMessage);
  }

  return fallbackMessage;
}

export function getErrorStatus(error: unknown): number | null {
  const data = getErrorData(error);
  return typeof data?.status === "number" ? data.status : null;
}

export function reportError(
  error: unknown,
  {
    extra,
    fingerprint,
    handled = false,
    level = "error",
    tags,
    userId,
  }: ReportErrorContext = {}
): Error {
  const exception = normalizeError(error, "Unknown error");

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setTag("handled", String(handled));

    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        if (value !== undefined) {
          scope.setTag(key, String(value));
        }
      }
    }

    if (extra) {
      scope.setExtras(extra);
    }

    if (fingerprint) {
      scope.setFingerprint(fingerprint);
    }

    if (userId) {
      scope.setUser({ id: userId });
    }

    Sentry.captureException(exception);
  });

  return exception;
}

export function reportHandledError(
  error: unknown,
  context: Omit<ReportErrorContext, "handled"> = {}
) {
  return reportError(error, { ...context, handled: true });
}
