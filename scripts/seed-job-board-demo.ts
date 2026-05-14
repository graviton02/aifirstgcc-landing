/**
 * Seed two Clerk users (a recruiter and a candidate) plus matching Convex
 * job board data so we can preview the recruiter and candidate dashboards
 * with realistic mocked content.
 *
 * Usage:
 *   npx tsx scripts/seed-job-board-demo.ts            # seed
 *   npx tsx scripts/seed-job-board-demo.ts --cleanup  # delete demo data + Clerk users
 *   npx tsx scripts/seed-job-board-demo.ts --cleanup-candidate-orgs
 *                                                        # remove Clerk org memberships
 *                                                        # from the demo candidate only
 *
 * Requires (auto-loaded from .env.local):
 *   - CLERK_SECRET_KEY
 *   - NEXT_PUBLIC_CONVEX_URL
 *   - CONVEX_DEPLOYMENT  (used by `npx convex run`)
 */

import { createClerkClient } from "@clerk/backend";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

function loadEnvLocal(path = ".env.local") {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1);
    if (
      (val.trim().startsWith('"') && val.trim().endsWith('"')) ||
      (val.trim().startsWith("'") && val.trim().endsWith("'"))
    ) {
      val = val.trim().slice(1, -1);
    } else {
      // Strip inline `# comment` (only when preceded by whitespace)
      const hash = val.search(/\s#/);
      if (hash !== -1) val = val.slice(0, hash);
      val = val.trim();
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const RECRUITER = {
  email: "demo-recruiter@orbys360.dev",
  password: "Orbys360!Demo2026",
  firstName: "Sarah",
  lastName: "Al-Rashid",
};
const CANDIDATE = {
  email: "demo-candidate@orbys360.dev",
  password: "Orbys360!Demo2026",
  firstName: "Ahmed",
  lastName: "Hassan",
};

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY not set in .env.local");
  process.exit(1);
}
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set in .env.local");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

const isCleanup = process.argv.includes("--cleanup");
const isCleanupCandidateOrgs = process.argv.includes("--cleanup-candidate-orgs");

function convexRun<T>(name: string, args: Record<string, unknown> = {}): T {
  const result = spawnSync(
    "npx",
    ["convex", "run", name, JSON.stringify(args)],
    { encoding: "utf8", env: process.env, stdio: ["ignore", "pipe", "pipe"] }
  );
  if (result.status !== 0) {
    console.error(`convex run ${name} failed:\n${result.stderr || result.stdout}`);
    process.exit(1);
  }
  // `npx convex run` pretty-prints the function's return value (possibly multi-line JSON).
  // Try parsing the whole stdout first; fall back to scanning lines bottom-up.
  const stdout = (result.stdout || "").trim();
  if (stdout) {
    try {
      return JSON.parse(stdout);
    } catch {
      // fall through
    }
    const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        return JSON.parse(lines[i]);
      } catch {
        // keep looking
      }
    }
  }
  return null as unknown as T;
}

async function ensureClerkUser(profile: typeof RECRUITER) {
  const { data: existing } = await clerk.users.getUserList({
    emailAddress: [profile.email],
  });
  if (existing.length > 0) {
    return { user: existing[0], created: false };
  }
  const user = await clerk.users.createUser({
    emailAddress: [profile.email],
    password: profile.password,
    firstName: profile.firstName,
    lastName: profile.lastName,
    skipPasswordChecks: true,
    skipPasswordRequirement: false,
  });
  return { user, created: true };
}

async function deleteClerkUser(email: string): Promise<boolean> {
  const { data } = await clerk.users.getUserList({ emailAddress: [email] });
  if (data.length === 0) return false;
  await clerk.users.deleteUser(data[0].id);
  return true;
}

async function removeUserOrganizationMemberships(userId: string) {
  const memberships = await clerk.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });

  for (const membership of memberships.data) {
    await clerk.organizations.deleteOrganizationMembership({
      organizationId: membership.organization.id,
      userId,
    });
  }

  return memberships.data.length;
}

async function cleanupCandidateOrganizations() {
  console.log("Looking up demo candidate Clerk user…");
  const { data } = await clerk.users.getUserList({
    emailAddress: [CANDIDATE.email],
  });
  const candidate = data[0];

  if (!candidate) {
    console.log(`  Candidate (${CANDIDATE.email}): not found`);
    return;
  }

  const removed = await removeUserOrganizationMemberships(candidate.id);
  console.log(
    `  Candidate (${CANDIDATE.email}): removed ${removed} organization membership${removed === 1 ? "" : "s"}`
  );
}

/**
 * A minimal but valid 1-page PDF. Generated in-memory so we don't have to
 * commit a binary asset. Renders a tiny resume-style header.
 */
function buildPlaceholderResumePdf(): Buffer {
  const lines: string[] = [];
  const offsets: number[] = [];

  function push(line: string) {
    lines.push(line);
  }
  function mark() {
    offsets.push(
      lines.reduce(
        (n, l, i) => n + Buffer.byteLength(l, "latin1") + (i < lines.length - 1 ? 1 : 0),
        0
      ) + (lines.length > 0 ? 1 : 0)
    );
  }

  push("%PDF-1.4");
  push("%\xe2\xe3\xcf\xd3");

  mark();
  push("1 0 obj");
  push("<< /Type /Catalog /Pages 2 0 R >>");
  push("endobj");

  mark();
  push("2 0 obj");
  push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  push("endobj");

  mark();
  push("3 0 obj");
  push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>"
  );
  push("endobj");

  const stream = [
    "BT",
    "/F1 18 Tf",
    "72 720 Td",
    "(Ahmed Hassan) Tj",
    "0 -24 Td",
    "/F1 12 Tf",
    "(ML Engineer  |  Riyadh, Saudi Arabia) Tj",
    "0 -36 Td",
    "/F1 10 Tf",
    "(Experience: 4 years building recommendation and ranking systems.) Tj",
    "0 -16 Td",
    "(Stack: Python, PyTorch, TypeScript, AWS, vector DBs.) Tj",
    "0 -16 Td",
    "(Placeholder resume generated for Orbys360 demo seeding.) Tj",
    "ET",
  ].join("\n");
  const streamLength = Buffer.byteLength(stream, "latin1");

  mark();
  push("4 0 obj");
  push(`<< /Length ${streamLength} >>`);
  push("stream");
  push(stream);
  push("endstream");
  push("endobj");

  mark();
  push("5 0 obj");
  push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  push("endobj");

  const body = lines.join("\n") + "\n";
  const xrefStart = Buffer.byteLength(body, "latin1");

  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (const off of offsets) {
    xref += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, "latin1");
}

async function seed() {
  console.log("Creating Clerk users…");
  const { user: recruiter, created: rCreated } = await ensureClerkUser(RECRUITER);
  console.log(
    `  Recruiter: ${RECRUITER.email}  (${recruiter.id})${rCreated ? " [created]" : " [existing]"}`
  );
  const { user: candidate, created: cCreated } = await ensureClerkUser(CANDIDATE);
  console.log(
    `  Candidate: ${CANDIDATE.email}  (${candidate.id})${cCreated ? " [created]" : " [existing]"}`
  );
  const removedCandidateMemberships = await removeUserOrganizationMemberships(candidate.id);
  if (removedCandidateMemberships > 0) {
    console.log(
      `  Candidate personal account cleanup: removed ${removedCandidateMemberships} organization membership${removedCandidateMemberships === 1 ? "" : "s"}`
    );
  }

  console.log("Uploading placeholder resume to Convex storage…");
  const uploadUrl = convexRun<string>("jobs:generateDemoResumeUploadUrl");
  if (typeof uploadUrl !== "string") {
    throw new Error("Failed to get upload URL from Convex");
  }
  const pdfBuffer = buildPlaceholderResumePdf();
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBuffer,
  });
  if (!uploadRes.ok) {
    throw new Error(
      `Resume upload failed: ${uploadRes.status} ${await uploadRes.text()}`
    );
  }
  const { storageId } = (await uploadRes.json()) as { storageId: string };
  console.log(`  Stored resume (${pdfBuffer.length} bytes) → ${storageId}`);

  console.log("Seeding Convex job board demo rows…");
  const result = convexRun<{
    jobSlug: string;
    jobId: string;
    applicationId: string;
  }>("jobs:seedJobBoardDemo", {
    recruiterClerkId: recruiter.id,
    recruiterEmail: RECRUITER.email,
    recruiterName: `${RECRUITER.firstName} ${RECRUITER.lastName}`,
    candidateClerkId: candidate.id,
    candidateEmail: CANDIDATE.email,
    candidateName: `${CANDIDATE.firstName} ${CANDIDATE.lastName}`,
    resumeStorageId: storageId,
    resumeSizeBytes: pdfBuffer.length,
  });
  console.log(`  Job slug: ${result?.jobSlug}`);

  console.log("\n✅ Demo accounts ready. Sign in at http://localhost:3000/sign-in");
  console.log(`   Recruiter: ${RECRUITER.email}  /  ${RECRUITER.password}`);
  console.log(`   Candidate: ${CANDIDATE.email}  /  ${CANDIDATE.password}`);
  console.log("   Candidate account is kept personal-only; it should not be asked to create or choose a Clerk organization.");
  console.log(`   Public job: http://localhost:3000/jobs/${result?.jobSlug}`);
  console.log(
    `   Recruiter dashboard: sign in as recruiter → http://localhost:3000/jobs/dashboard`
  );
  console.log(
    `   Candidate dashboard: sign in as candidate → http://localhost:3000/jobs/dashboard`
  );
  console.log("\nRe-run with --cleanup to remove all demo data + Clerk users.");
}

async function cleanup() {
  console.log("Looking up Clerk users…");
  const { data: recruiterList } = await clerk.users.getUserList({
    emailAddress: [RECRUITER.email],
  });
  const { data: candidateList } = await clerk.users.getUserList({
    emailAddress: [CANDIDATE.email],
  });
  const recruiterId = recruiterList[0]?.id ?? "missing";
  const candidateId = candidateList[0]?.id ?? "missing";

  console.log("Deleting Convex job board demo rows…");
  const result = convexRun<{
    deletedJob: boolean;
    deletedApplications: number;
    deletedRecruiterProfile: boolean;
    deletedCandidateProfile: boolean;
  }>("jobs:cleanupJobBoardDemo", {
    recruiterClerkId: recruiterId,
    candidateClerkId: candidateId,
  });
  console.log(
    `  Deleted job: ${result?.deletedJob}, applications: ${result?.deletedApplications}, ` +
      `recruiterProfile: ${result?.deletedRecruiterProfile}, candidateProfile: ${result?.deletedCandidateProfile}`
  );

  console.log("Deleting Clerk users…");
  console.log(`  Recruiter (${RECRUITER.email}): ${(await deleteClerkUser(RECRUITER.email)) ? "deleted" : "not found"}`);
  console.log(`  Candidate (${CANDIDATE.email}): ${(await deleteClerkUser(CANDIDATE.email)) ? "deleted" : "not found"}`);

  console.log("\n✅ Cleanup complete.");
}

(async () => {
  try {
    if (isCleanupCandidateOrgs) {
      await cleanupCandidateOrganizations();
    } else if (isCleanup) {
      await cleanup();
    } else {
      await seed();
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
