function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function researchDeliveryEmail({
  recipientName,
  reportTitle,
  reportSubtitle,
  downloadUrl,
}: {
  recipientName: string;
  reportTitle: string;
  reportSubtitle: string;
  downloadUrl: string;
}): { subject: string; html: string } {
  const safeName = escapeHtml(recipientName);
  const safeTitle = escapeHtml(reportTitle);
  const safeSubtitle = escapeHtml(reportSubtitle);
  const safeUrl = escapeHtml(downloadUrl);

  return {
    subject: `Your copy of ${reportTitle}`,
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
              <p style="margin:6px 0 0;font-size:13px;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">Orbys Research</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Thanks for requesting <strong>${safeTitle}</strong> — ${safeSubtitle}.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Your copy is ready. Use the button below to download the full PDF.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#2563eb;">
                    <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Download the report
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">
                If the button doesn&rsquo;t work, copy and paste this URL into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;word-break:break-all;">
                ${safeUrl}
              </p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                Have questions or want to talk through the implications for your GCC? Just reply to this email — we read every response.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">
                Orbys360 — AI Knowledge Hub for Global Capability Centers
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
