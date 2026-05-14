/**
 * Create or reuse the Orbis360 recruiter account, reset its password, and seed
 * three approved Orbys360 job-board roles.
 *
 * Usage:
 *   npx tsx scripts/seed-orbis360-recruiter-jobs.ts
 *
 * Requires (auto-loaded from .env.local):
 *   - CLERK_SECRET_KEY
 *   - NEXT_PUBLIC_CONVEX_URL
 *   - CONVEX_DEPLOYMENT
 */

import { createClerkClient } from "@clerk/backend";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

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
      const hash = val.search(/\s#/);
      if (hash !== -1) val = val.slice(0, hash);
      val = val.trim();
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const RECRUITER = {
  email: "neeraj.shrigiri02@gmail.com",
  firstName: "Neeraj",
  lastName: "Shrigiri",
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

function generateTemporaryPassword() {
  return `Orbys360!${randomBytes(9).toString("base64url")}Aa1`;
}

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
  return null as T;
}

async function ensureRecruiterUser(password: string) {
  const { data: existing } = await clerk.users.getUserList({
    emailAddress: [RECRUITER.email],
  });

  if (existing.length > 0) {
    const user = existing[0];
    await clerk.users.updateUser(user.id, {
      firstName: RECRUITER.firstName,
      lastName: RECRUITER.lastName,
      password,
      skipPasswordChecks: true,
    } as any);
    return { user, created: false };
  }

  const user = await clerk.users.createUser({
    emailAddress: [RECRUITER.email],
    password,
    firstName: RECRUITER.firstName,
    lastName: RECRUITER.lastName,
    skipPasswordChecks: true,
    skipPasswordRequirement: false,
  });
  return { user, created: true };
}

async function main() {
  const password = generateTemporaryPassword();
  console.log("Creating or updating Clerk recruiter user...");
  const { user, created } = await ensureRecruiterUser(password);
  console.log(
    `  Recruiter: ${RECRUITER.email} (${user.id})${created ? " [created]" : " [existing, password reset]"}`
  );

  console.log("Seeding approved Orbys360 recruiter jobs...");
  const result = convexRun<{
    recruiterProfileId: string;
    jobs: Array<{ slug: string; jobId: string; skipped: boolean }>;
  }>("jobs:seedOrbis360RecruiterJobs", {
    recruiterClerkId: user.id,
    recruiterEmail: RECRUITER.email,
    recruiterName: `${RECRUITER.firstName} ${RECRUITER.lastName}`,
  });

  for (const job of result.jobs) {
    console.log(`  ${job.slug}: ${job.skipped ? "already existed" : "created"} (${job.jobId})`);
  }

  console.log("\n✅ Orbis360 recruiter jobs are ready.");
  console.log(`   Recruiter: ${RECRUITER.email}`);
  console.log(`   Temporary password: ${password}`);
  console.log("   Dashboard: http://localhost:3000/jobs/dashboard");
  console.log("   Public board: http://localhost:3000/jobs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
