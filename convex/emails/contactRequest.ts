function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderField(label: string, value: string) {
  return `
    <tr>
      <td style="padding:0 0 12px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">
          ${escapeHtml(label)}
        </p>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
          ${escapeHtml(value)}
        </p>
      </td>
    </tr>
  `.trim();
}

function buildEmail({
  subject,
  greeting,
  intro,
  fields,
  ctaLabel,
  ctaUrl,
  footer,
}: {
  subject: string;
  greeting: string;
  intro: string;
  fields: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  ctaUrl?: string;
  footer: string;
}) {
  const fieldsHtml = fields
    .filter((field) => field.value.trim().length > 0)
    .map((field) => renderField(field.label, field.value))
    .join("");

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">Orbys360</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                ${escapeHtml(greeting)}
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
                ${escapeHtml(intro)}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                ${fieldsHtml}
              </table>
              ${
                ctaLabel && ctaUrl
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#2563eb;">
                    <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${escapeHtml(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>
                  `.trim()
                  : ""
              }
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                ${escapeHtml(footer)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">
                Orbys360 — AI-First GCC Advisory Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}

type ReachoutSummary = {
  agentName: string;
  companyName: string;
  gccName: string;
  gccEmail: string;
  gccOrganization: string;
  gccIndustry: string;
  useCase: string;
  currentChallenge: string;
  expectedOutcome: string;
  timeline: string;
};

export function providerLeadApprovedEmail(
  summary: ReachoutSummary & {
    dashboardUrl: string;
  }
) {
  return buildEmail({
    subject: `New approved GCC lead for ${summary.agentName}`,
    greeting: "Hello,",
    intro: `A GCC buyer request for ${summary.agentName} at ${summary.companyName} has been approved and is ready for follow-up.`,
    fields: [
      { label: "GCC Contact", value: `${summary.gccName} (${summary.gccEmail})` },
      { label: "Organization", value: summary.gccOrganization },
      { label: "Industry", value: summary.gccIndustry },
      { label: "Use Case", value: summary.useCase },
      { label: "Current Challenge", value: summary.currentChallenge },
      { label: "Expected Outcome", value: summary.expectedOutcome },
      { label: "Timeline", value: summary.timeline },
    ],
    ctaLabel: "Open Provider Dashboard",
    ctaUrl: summary.dashboardUrl,
    footer:
      "Review the lead in your dashboard, then reach out directly to the GCC contact by email.",
  });
}

export function gccReachoutApprovedEmail({
  companyName,
  agentName,
  dashboardUrl,
}: {
  companyName: string;
  agentName: string;
  dashboardUrl: string;
}) {
  return buildEmail({
    subject: `Your reachout to ${companyName} is approved`,
    greeting: "Hello,",
    intro: `Your reachout request for ${agentName} has been approved. The provider team can now review your details and contact you directly.`,
    fields: [
      { label: "Provider", value: companyName },
      { label: "Solution", value: agentName },
    ],
    ctaLabel: "View GCC Dashboard",
    ctaUrl: dashboardUrl,
    footer:
      "You can track the request status in your GCC dashboard while the provider team follows up.",
  });
}

export function gccReachoutRejectedEmail({
  companyName,
  agentName,
  dashboardUrl,
  adminNotes,
}: {
  companyName: string;
  agentName: string;
  dashboardUrl: string;
  adminNotes?: string;
}) {
  return buildEmail({
    subject: `Update on your reachout to ${companyName}`,
    greeting: "Hello,",
    intro: `Your reachout request for ${agentName} was not approved for provider routing.`,
    fields: [
      { label: "Provider", value: companyName },
      { label: "Solution", value: agentName },
      { label: "Admin Notes", value: adminNotes?.trim() || "No additional notes were provided." },
    ],
    ctaLabel: "View GCC Dashboard",
    ctaUrl: dashboardUrl,
    footer:
      "You can review the request history in your GCC dashboard and submit a new request later if needed.",
  });
}

export function gccReachoutContactedEmail({
  companyName,
  agentName,
  dashboardUrl,
}: {
  companyName: string;
  agentName: string;
  dashboardUrl: string;
}) {
  return buildEmail({
    subject: `${companyName} marked your Orbys360 request as contacted`,
    greeting: "Hello,",
    intro: `${companyName} marked your reachout for ${agentName} as contacted. Their team should follow up with you directly using the email on your GCC profile.`,
    fields: [
      { label: "Provider", value: companyName },
      { label: "Solution", value: agentName },
    ],
    ctaLabel: "View GCC Dashboard",
    ctaUrl: dashboardUrl,
    footer:
      "If you do not hear back, you can still use your GCC dashboard as the source of record for the request status.",
  });
}
