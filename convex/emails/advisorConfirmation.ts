function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function advisorConfirmationEmail({
  recipientName,
}: {
  recipientName: string;
}): { subject: string; html: string } {
  const safeName = escapeHtml(recipientName);

  return {
    subject: "We received your Orbys360 AI Advisor application",
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
              <p style="margin:6px 0 0;font-size:13px;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">AI Advisor Network</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Thanks for applying to join the <strong>Orbys360 AI Advisor Network</strong>. We&rsquo;ve received your application and it&rsquo;s now in our review queue.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Our team vets each applicant to keep the network focused on senior AI practitioners. If your background is a fit, we&rsquo;ll be in touch to confirm the details and bring your profile live for GCC leaders to discover.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Founding-cohort applicants are reviewed first &mdash; you don&rsquo;t need to do anything else for now.
              </p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                Questions in the meantime? Email us at <a href="mailto:team@orbys360.com" style="color:#2563eb;text-decoration:none;">team@orbys360.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">
                Orbys360 &mdash; AI Knowledge Hub for Global Capability Centers
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
