export function claimApprovedEmail({
  claimantName,
  companyName,
  magicLinkUrl,
}: {
  claimantName: string;
  companyName: string;
  magicLinkUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Your Orbys360 company profile is ready — ${companyName}`,
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
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">Orbys360</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Hi ${claimantName},
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
                Your claim for <strong>${companyName}</strong> has been approved. Click the button below to set up your account and access your provider dashboard.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#2563eb;">
                    <a href="${magicLinkUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Access Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">
                This link expires in 7 days. If you didn&rsquo;t request this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                If the button doesn&rsquo;t work, copy and paste this URL into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;word-break:break-all;">
                ${magicLinkUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
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
