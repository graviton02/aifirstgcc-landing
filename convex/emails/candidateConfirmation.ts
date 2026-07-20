function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function candidateConfirmationEmail({
  recipientName,
}: {
  recipientName: string;
}): { subject: string; html: string } {
  const safeName = escapeHtml(recipientName);

  return {
    subject: "You're on the Orbys360 AI talent list",
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
              <p style="margin:6px 0 0;font-size:13px;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">AI Talent for GCCs</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                You&rsquo;re on the list. We&rsquo;ll email you when an AI role opens at a Global Capability Center that matches what you told us.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                In the meantime, you can browse everything that&rsquo;s currently open at <a href="https://orbys360.com/jobs" style="color:#2563eb;text-decoration:none;">orbys360.com/jobs</a>.
              </p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                Want to update your details or come off the list? Just reply to <a href="mailto:team@orbys360.com" style="color:#2563eb;text-decoration:none;">team@orbys360.com</a>.
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
