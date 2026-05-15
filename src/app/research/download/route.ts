import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORT_FILES: Record<string, { file: string; filename: string }> = {
  "the-gcc-reckoning": {
    file: "private/research/the-gcc-reckoning.pdf",
    filename: "the-gcc-reckoning.pdf",
  },
};

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return invalid("This download link is missing its token.");
  }

  const lead = await fetchQuery(api.research.getLeadByToken, { token });
  if (!lead) {
    return invalid("This link is invalid.");
  }
  if (lead.expires_at && lead.expires_at < Date.now()) {
    return invalid("This link has expired. Request a fresh copy from /research.");
  }

  const report = REPORT_FILES[lead.report_slug];
  if (!report) {
    return invalid("Report not available.");
  }

  await fetchMutation(api.research.recordDownload, { token });

  const data = await readFile(path.join(process.cwd(), report.file));
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function invalid(message: string) {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = `<!doctype html><meta charset="utf-8"><title>Download unavailable</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#0f172a;line-height:1.6}h1{font-size:22px;margin-bottom:12px}a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}</style>
<h1>Download unavailable</h1><p>${escaped}</p>
<p><a href="/research">Return to the research page →</a></p>`;
  return new Response(html, {
    status: 403,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
