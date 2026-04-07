type ProviderRequestLike = {
  gcc_name?: string | null;
  gcc_email?: string | null;
  gcc_organization?: string | null;
  gcc_industry?: string | null;
  use_case?: string | null;
  current_challenge?: string | null;
  expected_outcome?: string | null;
  timeline?: string | null;
  gcc_user_email?: string | null;
  message?: string | null;
};

type GccProfileLike = {
  name?: string | null;
  email?: string | null;
  organization?: string | null;
  industry?: string | null;
} | null;

function firstMeaningfulText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function hasMeaningfulText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeProviderRequest<T extends ProviderRequestLike>(request: T) {
  return {
    ...request,
    gcc_name: firstMeaningfulText(request.gcc_name) ?? "Unknown GCC",
    gcc_email:
      firstMeaningfulText(request.gcc_email, request.gcc_user_email) ?? "",
    gcc_organization:
      firstMeaningfulText(request.gcc_organization) ??
      "Unknown organization",
    gcc_industry:
      firstMeaningfulText(request.gcc_industry) ?? "Unknown industry",
    use_case: firstMeaningfulText(request.use_case) ?? "Not provided",
    current_challenge:
      firstMeaningfulText(request.current_challenge, request.message) ??
      "Not provided",
    expected_outcome:
      firstMeaningfulText(request.expected_outcome) ?? "Not provided",
    timeline: firstMeaningfulText(request.timeline) ?? "Not specified",
  };
}

export function buildLegacyProviderRequestBackfillPatch(
  request: ProviderRequestLike,
  gccProfile: GccProfileLike
) {
  const patch: Record<string, string> = {};

  if (!hasMeaningfulText(request.gcc_email)) {
    patch.gcc_email =
      firstMeaningfulText(
        request.gcc_user_email,
        gccProfile?.email
      ) ?? "";
  }

  if (!hasMeaningfulText(request.gcc_name)) {
    patch.gcc_name =
      firstMeaningfulText(gccProfile?.name) ?? "Unknown GCC";
  }

  if (!hasMeaningfulText(request.gcc_organization)) {
    patch.gcc_organization =
      firstMeaningfulText(gccProfile?.organization) ??
      "Unknown organization";
  }

  if (!hasMeaningfulText(request.gcc_industry)) {
    patch.gcc_industry =
      firstMeaningfulText(gccProfile?.industry) ?? "Unknown industry";
  }

  if (!hasMeaningfulText(request.use_case)) {
    patch.use_case = "Legacy provider introduction";
  }

  if (!hasMeaningfulText(request.current_challenge)) {
    patch.current_challenge =
      firstMeaningfulText(request.message) ??
      "Legacy request imported without structured challenge.";
  }

  if (!hasMeaningfulText(request.expected_outcome)) {
    patch.expected_outcome = "Provider follow-up requested.";
  }

  if (!hasMeaningfulText(request.timeline)) {
    patch.timeline = "Not specified";
  }

  return patch;
}
