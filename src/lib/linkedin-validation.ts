export function isValidLinkedInProfileUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = url.pathname.replace(/\/+$/, "");

    if (!hostname.endsWith("linkedin.com")) {
      return false;
    }

    return pathname.startsWith("/in/") || pathname.startsWith("/pub/");
  } catch {
    return false;
  }
}
