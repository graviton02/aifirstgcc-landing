const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com", "yahoo.co.uk",
  "yahoo.co.in", "rediffmail.com", "msn.com",
]);

export function isFreeEmailProvider(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !domain || FREE_EMAIL_DOMAINS.has(domain);
}
