# Job Board UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the context-blind navbar CTA, redundant role picker, and duplicated application info with state-aware hero CTAs, a pre-set role onboarding flow, and a deduplicated application form — and allow marketplace users (gcc/provider) to also have a job-board role.

**Architecture:** All changes are additive or local edits. No schema migration. The marketplace role union (`gcc | provider | null`) is already correctly narrowed in `src/auth/roles.ts`. The two role systems (`users` via `viewer.getContext` vs `jobProfiles`) are already independent in the data layer; this work removes the implicit "one role" assumptions in UX, routing, and the application form.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Convex, Clerk, Tailwind, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-05-13-job-board-ux-redesign-design.md`

**Plan corrections applied before implementation:** keep `current_title` as an optional per-application snapshot instead of removing/rejecting it; require and normalize `linkedin_url`; distinguish null job-board role from wrong-role guards; align `JobDetail` tests with the actual `{ slug }` component API.

---

## File Structure

### Modified files

| File | Responsibility after change |
|---|---|
| `src/jobs/config.ts` | Add `LINKEDIN_URL_PATTERN` regex, `isValidLinkedInUrl(value)`, and `normalizeLinkedInUrl(value)` (auto-prefixes `https://` when missing). Shared between client and server. |
| `convex/jobApplications.ts` | `create` mutation: keep `current_title` as optional; make `linkedin_url` **required**; normalize via `normalizeLinkedInUrl` then validate via `isValidLinkedInUrl`. |
| `src/app/jobs/[slug]/apply/page.tsx` (inline `ApplicationForm`) | Keep `current_title` (pre-filled from profile, editable). Make `linkedin_url` required with regex validation. Add "Applying as: {name}" header sourced from profile. Also: when signed-in null-role user lands here, redirect now includes `&role=jobseeker`. **This is the user-facing form** — `src/components/jobs/JobApplicationForm.tsx` is an orphaned/unused file (will be deleted in Task 3). |
| `src/app/jobs/post/page.tsx` | When signed-in null-role user lands here, redirect now includes `&role=recruiter`. Existing recruiter-only friendly block stays. |
| `src/components/jobs/JobDetail.tsx` | "Apply Now" CTA: signed-out branch and no-role branch now carry `role=jobseeker` through the URL chain. |
| `src/components/jobs/JobOnboarding.tsx` | Accept `presetRole?: JobBoardRole` prop. Hide role picker and force role when present. Remove `linkedin_url` and `phone` from this form (they belong on applications). |
| `src/app/jobs/onboarding/page.tsx` | Read `?role=` from URL; validate via `isJobBoardRole`; pass to `JobOnboarding` as `presetRole`. |
| `src/components/jobs/JobHero.tsx` | Replace single "Post a Job" CTA with state-aware matrix keyed on `useJobBoardRole().role` + `isSignedIn`. |
| `src/components/shared/Navbar.tsx` | Hide "Join Now" on `/jobs/*` for signed-out users; show a "Sign in" text link instead. Pathname-first `dashboardPath`: on `/jobs/*` with a job-board role → `/jobs/dashboard`. |
| `src/app/auth-redirect/page.tsx` | Honor job-board role when marketplace role is absent: if `jobBoardRole` exists, redirect to `/jobs/dashboard` instead of `/onboarding`. |
| `src/app/jobs/post/page.tsx` | If signed-in but `jobBoardRole !== 'recruiter'`, render "This account is registered as a jobseeker" friendly block instead of the form. |
| `src/app/jobs/[slug]/apply/page.tsx` | If signed-in but `jobBoardRole !== 'jobseeker'`, render "This account is registered as a recruiter" friendly block instead of the form. |

### New test files

| File | Purpose |
|---|---|
| `tests/jobs/linkedinUrl.test.ts` | Unit tests for `isValidLinkedInUrl`. |
| `tests/components/jobs/JobHero.test.tsx` | Renders correct CTAs for each `(jobBoardRole × isSignedIn)` state; clicks route to correct URLs. |
| `tests/components/jobs/JobOnboarding.test.tsx` | With `presetRole`, role picker hidden + role-specific field rendered. Without it, original picker shown. |
| `tests/app/jobs-apply.page.test.tsx` | LinkedIn field required + regex-validated; `current_title` field remains present, pre-filled, and editable as an application snapshot; "Applying as" header shows profile values; recruiter sees friendly block. (Combines Task 3 + Task 10 coverage.) |
| `tests/app/auth-redirect.page.test.tsx` | Job-board-only users routed to `/jobs/dashboard`; marketplace logic preserved otherwise. |

### Tests modified

| File | What gets added |
|---|---|
| `tests/components/shared/Navbar.test.tsx` | Cases for `/jobs/*` pathname: no "Join Now", visible "Sign in" link for signed-out users; `Dashboard` button routes to `/jobs/dashboard` when on `/jobs/*` with a job-board role. |
| `tests/convex/jobBoard.test.ts` | `jobApplications.create` rejects missing/malformed `linkedin_url`; keeps accepting optional `current_title` as a per-application snapshot. |

---

## Task 1 — LinkedIn URL validator + normalizer (shared helpers)

**Files:**
- Modify: `src/jobs/config.ts`
- Test: `tests/jobs/linkedinUrl.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/jobs/linkedinUrl.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isValidLinkedInUrl, normalizeLinkedInUrl } from "@/jobs/config";

describe("isValidLinkedInUrl", () => {
  it("accepts canonical https://www.linkedin.com/in/ URLs", () => {
    expect(isValidLinkedInUrl("https://www.linkedin.com/in/jane-doe")).toBe(true);
  });

  it("accepts https://linkedin.com/in/ URLs without www", () => {
    expect(isValidLinkedInUrl("https://linkedin.com/in/jane")).toBe(true);
  });

  it("accepts trailing-slash and slug variants", () => {
    expect(isValidLinkedInUrl("https://www.linkedin.com/in/jane-doe/")).toBe(true);
    expect(isValidLinkedInUrl("https://www.linkedin.com/in/jane_doe-1")).toBe(true);
  });

  it("rejects http (non-https)", () => {
    expect(isValidLinkedInUrl("http://www.linkedin.com/in/jane")).toBe(false);
  });

  it("rejects non-LinkedIn domains", () => {
    expect(isValidLinkedInUrl("https://github.com/jane")).toBe(false);
  });

  it("rejects empty / null / undefined", () => {
    expect(isValidLinkedInUrl("")).toBe(false);
    expect(isValidLinkedInUrl(null)).toBe(false);
    expect(isValidLinkedInUrl(undefined)).toBe(false);
  });

  it("rejects LinkedIn URLs that don't point at /in/", () => {
    expect(isValidLinkedInUrl("https://www.linkedin.com/company/orbys")).toBe(false);
  });
});

describe("normalizeLinkedInUrl", () => {
  it("auto-prefixes https:// when missing", () => {
    expect(normalizeLinkedInUrl("www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
    expect(normalizeLinkedInUrl("linkedin.com/in/jane")).toBe(
      "https://linkedin.com/in/jane"
    );
  });

  it("leaves already-prefixed URLs unchanged", () => {
    expect(normalizeLinkedInUrl("https://www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });

  it("trims whitespace", () => {
    expect(normalizeLinkedInUrl("  https://www.linkedin.com/in/jane  ")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });

  it("upgrades http:// to https://", () => {
    expect(normalizeLinkedInUrl("http://www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });

  it("returns empty string for empty/null input", () => {
    expect(normalizeLinkedInUrl("")).toBe("");
    expect(normalizeLinkedInUrl(null)).toBe("");
    expect(normalizeLinkedInUrl(undefined)).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/jobs/linkedinUrl.test.ts`
Expected: FAIL — `isValidLinkedInUrl` and `normalizeLinkedInUrl` not exported.

- [ ] **Step 3: Add helpers to `src/jobs/config.ts`**

Add near the existing `isJobBoardRole` helper (after line ~73):

```ts
export const LINKEDIN_URL_PATTERN =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

export function isValidLinkedInUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && LINKEDIN_URL_PATTERN.test(value);
}

export function normalizeLinkedInUrl(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://")) return "https://" + trimmed.slice(7);
  if (trimmed.startsWith("https://")) return trimmed;
  return "https://" + trimmed;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/jobs/linkedinUrl.test.ts`
Expected: PASS, 12/12.

- [ ] **Step 5: Commit**

```bash
git add src/jobs/config.ts tests/jobs/linkedinUrl.test.ts
git commit -m "feat(jobs): add LinkedIn URL validator and normalizer"
```

---

## Task 2 — Convex `jobApplications.create`: require + normalize LinkedIn, keep current_title

**Files:**
- Modify: `convex/jobApplications.ts:19-102`
- Test: `tests/convex/jobBoard.test.ts` (extend)

- [ ] **Step 1: Write failing tests**

Append to `tests/convex/jobBoard.test.ts` inside the `describe("job board workflows", ...)` block (keep existing tests):

```ts
  it("rejects applications missing a LinkedIn URL", async () => {
    const jobId = await seedApprovedJob(t);
    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, {
        job_id: jobId,
        phone: "+91 99999 11111",
        years_of_experience: 4,
        linkedin_url: "",
        resume_storage_id: "storage-resume-1" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      })
    ).rejects.toThrow("LinkedIn URL is required");
  });

  it("rejects applications with malformed LinkedIn URLs", async () => {
    const jobId = await seedApprovedJob(t);
    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, {
        job_id: jobId,
        phone: "+91 99999 11111",
        years_of_experience: 4,
        linkedin_url: "https://github.com/jane",
        resume_storage_id: "storage-resume-1" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      })
    ).rejects.toThrow("LinkedIn URL");
  });

  it("normalizes a LinkedIn URL missing the https:// prefix", async () => {
    const jobId = await seedApprovedJob(t);
    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    const application = await t
      .withIdentity(seekerIdentity)
      .mutation(api.jobApplications.create, {
        job_id: jobId,
        phone: "+91 99999 11111",
        years_of_experience: 4,
        linkedin_url: "www.linkedin.com/in/seeker",
        current_title: "ML Engineer",
        resume_storage_id: "storage-resume-1" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      });

    expect((application as any).linkedin_url).toBe(
      "https://www.linkedin.com/in/seeker"
    );
  });
```

Also update the existing "blocks duplicate applications" test (lines 75–93 in the file): the `args` object stays as-is (it already includes `current_title`); we keep this field accepted in the schema.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/convex/jobBoard.test.ts`
Expected: 3 new tests FAIL (validator + normalizer + required-check absent). Existing tests still pass.

- [ ] **Step 3: Update `convex/jobApplications.ts:create` args and validation**

In `convex/jobApplications.ts`, replace lines 19–32 (the `args` block) with:

```ts
export const create = mutation({
  args: {
    job_id: v.id("jobs"),
    phone: v.string(),
    current_company: v.optional(v.string()),
    current_title: v.optional(v.string()),
    linkedin_url: v.string(),
    years_of_experience: v.number(),
    cover_note: v.optional(v.string()),
    resume_storage_id: v.string(),
    resume_file_name: v.string(),
    resume_content_type: v.string(),
    resume_size_bytes: v.number(),
  },
```

(Kept `current_title` as optional; changed `linkedin_url` from optional to required.)

Update the import at the top of the file (line ~5–10):

```ts
import {
  APPLICATION_STATUSES,
  canApplyToJob,
  isPdfResumeFile,
  isValidLinkedInUrl,
  normalizeLinkedInUrl,
  RESUME_MAX_SIZE_BYTES,
} from "../src/jobs/config";
```

Add this validation block just after the `phone` trim block (around line 67, between the `phone` and `years_of_experience` checks):

```ts
    const rawLinkedIn = args.linkedin_url.trim();
    if (!rawLinkedIn) {
      appError("job_application_linkedin_required", "LinkedIn URL is required.", 400);
    }
    const linkedinUrl = normalizeLinkedInUrl(rawLinkedIn);
    if (!isValidLinkedInUrl(linkedinUrl)) {
      appError(
        "job_application_linkedin_invalid",
        "LinkedIn URL must look like https://www.linkedin.com/in/your-handle",
        400,
      );
    }
```

The existing insert block (lines 84–102) needs only one change — replace the `...(args.linkedin_url?.trim() ? { linkedin_url: args.linkedin_url.trim() } : {})` spread with unconditional `linkedin_url: linkedinUrl,`. Keep `current_title` spread as-is:

```ts
    const now = Date.now();
    const applicationId = await ctx.db.insert("jobApplications", {
      job_id: args.job_id,
      applicant_id: profile._id,
      name: profile.name,
      email: profile.email,
      phone,
      ...(args.current_company?.trim() ? { current_company: args.current_company.trim() } : {}),
      ...(args.current_title?.trim() ? { current_title: args.current_title.trim() } : {}),
      linkedin_url: linkedinUrl,
      years_of_experience: args.years_of_experience,
      ...(args.cover_note?.trim() ? { cover_note: args.cover_note.trim() } : {}),
      resume_storage_id: args.resume_storage_id,
      resume_file_name: resumeFileName,
      resume_content_type: resumeContentType,
      resume_size_bytes: args.resume_size_bytes,
      recruiter_status: "new",
      applied_at: now,
      updated_at: now,
    });
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/convex/jobBoard.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add convex/jobApplications.ts tests/convex/jobBoard.test.ts
git commit -m "feat(jobs): require + normalize LinkedIn URL on applications"
```

---

## Task 3 — Inline application form (in `/jobs/[slug]/apply`): require LinkedIn, add "Applying as" header, keep current_title editable

**Files:**
- Modify: `src/app/jobs/[slug]/apply/page.tsx` (specifically the inline `ApplicationForm` function at line ~329 and form state at ~348)
- Delete: `src/components/jobs/JobApplicationForm.tsx` (orphaned, no imports anywhere — verified by `grep -r "JobApplicationForm" src/ tests/`)
- Test: `tests/app/jobs-apply.page.test.tsx` (new — also covers Task 10's recruiter-guard verification)

**What stays:** `current_title` is kept on the form, pre-filled from `profile.current_title` (existing behavior at line 351), editable. We do NOT drop it — that would break the recruiter dashboard, which reads `application.current_title`, and would also leave users with stale profile data (profile editing is out of scope).

- [ ] **Step 1: Write failing tests**

Create `tests/app/jobs-apply.page.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = "jobseeker";
const mockProfile = {
  name: "Jane Doe",
  email: "jane@example.com",
  current_title: "ML Engineer",
  phone: "+91 99999 11111",
  linkedin_url: "",
};

vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({
    profile: mockProfile,
    role: mockJobBoardRole,
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock("@/components/shared/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/shared/Container", () => ({
  Container: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/shared/Breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));

vi.mock("convex/react", () => ({
  useQuery: (ref: unknown) => {
    if (String(ref).includes("getPublicBySlug")) {
      return {
        _id: "job_1",
        title: "AI Engineer",
        company_name: "Acme",
        category: "engineering",
        location: "Remote",
        workplace_type: "remote",
        job_type: "full-time",
        seniority: "mid",
      };
    }
    if (String(ref).includes("hasApplied")) return false;
    return undefined;
  },
  useMutation: () => vi.fn(),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    motion: new Proxy({}, {
      get: () => ({ children }: any) => <>{children}</>,
    }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock("@/lib/jobResumeUpload", () => ({
  validateResumeFile: () => null,
}));

vi.mock("@/lib/report-error", () => ({
  getErrorMessage: (_e: unknown, fallback: string) => fallback,
}));

beforeEach(() => {
  mockJobBoardRole = "jobseeker";
});

afterEach(() => {
  cleanup();
});

async function renderPage() {
  const Page = (await import("@/app/jobs/[slug]/apply/page")).default;
  const params = Promise.resolve({ slug: "ai-engineer" });
  render(<Page params={params} />);
  // Wait for the `useEffect` that resolves params to run + state update.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("/jobs/[slug]/apply — application form", () => {
  it("renders a current_title input pre-filled from profile", async () => {
    await renderPage();
    const input = screen.getByLabelText(/current title/i) as HTMLInputElement;
    expect(input.value).toBe("ML Engineer");
  });

  it("shows an 'Applying as' header with the profile name", async () => {
    await renderPage();
    expect(screen.getByText(/Applying as/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  it("requires LinkedIn URL", async () => {
    await renderPage();
    const input = screen.getByLabelText(/LinkedIn URL/i) as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it("rejects a malformed LinkedIn URL with an inline error", async () => {
    await renderPage();
    const input = screen.getByLabelText(/LinkedIn URL/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "https://github.com/jane" } });
    fireEvent.blur(input);
    expect(screen.getByText(/LinkedIn URL must look like/i)).toBeInTheDocument();
  });

  it("accepts a LinkedIn URL without https:// prefix (UI accepts; normalization happens server-side)", async () => {
    await renderPage();
    const input = screen.getByLabelText(/LinkedIn URL/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "www.linkedin.com/in/jane" } });
    fireEvent.blur(input);
    // No error: the normalized form (https://www.linkedin.com/in/jane) is valid.
    expect(screen.queryByText(/LinkedIn URL must look like/i)).not.toBeInTheDocument();
  });
});

describe("/jobs/[slug]/apply — recruiter guard", () => {
  it("shows the recruiter friendly block when role is recruiter", async () => {
    mockJobBoardRole = "recruiter";
    await renderPage();
    expect(screen.getByText(/Recruiter accounts cannot apply/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/LinkedIn URL/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/app/jobs-apply.page.test.tsx`
Expected: FAIL — no "Applying as" header, LinkedIn not required, no client-side LinkedIn validation (the normalization-accepts test will also fail). The current_title test and recruiter-guard test should already pass — included as regression coverage.

- [ ] **Step 3: Edit `src/app/jobs/[slug]/apply/page.tsx`**

(a) Update the import near the top (around line 23) to include the LinkedIn helpers:

```tsx
import {
  buildJobBoardSignInUrl,
  isValidLinkedInUrl,
  normalizeLinkedInUrl,
  sanitizeJobBoardReturnUrl,
} from "@/jobs/config";
```

(b) Inside the inline `ApplicationForm` function, just after the existing `form` state (lines 348–355), add a LinkedIn error state. The form state itself stays unchanged (it already includes `current_title` and `linkedin_url`):

```tsx
  const [linkedinError, setLinkedinError] = useState("");
```

(c) In `handleSubmit`, just before the `try { ... }` block (around line 376), add LinkedIn validation:

```tsx
    const normalizedLinkedIn = normalizeLinkedInUrl(form.linkedin_url);
    if (!isValidLinkedInUrl(normalizedLinkedIn)) {
      setLinkedinError(
        "LinkedIn URL must look like https://www.linkedin.com/in/your-handle"
      );
      return;
    }
```

(d) Inside `handleSubmit`, update the `createApplication` call (lines 401–413) to pass the normalized LinkedIn URL (other fields unchanged — `current_title` still sent):

```tsx
      await createApplication({
        job_id: job._id,
        phone: form.phone,
        current_company: form.current_company || undefined,
        current_title: form.current_title || undefined,
        linkedin_url: normalizedLinkedIn,
        years_of_experience: Number(form.years_of_experience),
        cover_note: form.cover_note || undefined,
        resume_storage_id: storageId as any,
        resume_file_name: resumeFile.name,
        resume_content_type: resumeFile.type || "application/pdf",
        resume_size_bytes: resumeFile.size,
      });
```

(e) Replace the form header block (lines 530–538) to add the "Applying as" header:

```tsx
      {/* Form header */}
      <div className="border-b border-enterprise-100 px-6 py-6 sm:px-8">
        <h1 className="font-display text-2xl font-bold text-enterprise-950">
          Submit your application
        </h1>
        <p className="mt-2 text-sm text-enterprise-700">
          Applying as <strong>{profile?.name ?? "—"}</strong>
        </p>
        <p className="mt-1 text-xs text-enterprise-500">
          Your information is shared only with the recruiter for this role.
        </p>
      </div>
```

(Note: we only show the name in "Applying as" — current_title is still presented as its own editable field below, since the user can override it per application.)

(f) In Section 1 ("Contact information") at lines 559–579, replace the LinkedIn field with a required + validated version:

```tsx
            <Field label="LinkedIn URL" required>
              <input
                required
                type="url"
                value={form.linkedin_url}
                onChange={(e) => {
                  setForm({ ...form, linkedin_url: e.target.value });
                  setLinkedinError("");
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const normalized = normalizeLinkedInUrl(value);
                  if (!isValidLinkedInUrl(normalized)) {
                    setLinkedinError(
                      "LinkedIn URL must look like https://www.linkedin.com/in/your-handle"
                    );
                  }
                }}
                placeholder="https://www.linkedin.com/in/your-handle"
                className={inputClassName}
              />
              {linkedinError ? (
                <p className="mt-1 text-xs text-red-600">{linkedinError}</p>
              ) : null}
            </Field>
```

(g) Section 2 ("Experience") at lines 589–620 stays as-is. `current_title` field remains present, pre-filled from profile, editable.

- [ ] **Step 4: Delete the orphaned standalone form component**

Run:
```bash
rm src/components/jobs/JobApplicationForm.tsx
```

(Verified orphaned: `grep -r "JobApplicationForm" src/ tests/` returns only the file itself.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/app/jobs-apply.page.test.tsx`
Expected: PASS, 6/6.

- [ ] **Step 6: Commit**

```bash
git add 'src/app/jobs/[slug]/apply/page.tsx' tests/app/jobs-apply.page.test.tsx
git rm src/components/jobs/JobApplicationForm.tsx
git commit -m "feat(jobs): require + normalize LinkedIn on apply form, add Applying as header, remove orphan"
```

---

## Task 4 — `JobOnboarding`: accept `presetRole`, hide picker when set, drop extra fields

**Files:**
- Modify: `src/components/jobs/JobOnboarding.tsx`
- Test: `tests/components/jobs/JobOnboarding.test.tsx` (new)

- [ ] **Step 1: Write failing tests**

Create `tests/components/jobs/JobOnboarding.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const createProfileMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

vi.mock("convex/react", () => ({
  useMutation: () => createProfileMock,
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      fullName: "Jane Doe",
      primaryEmailAddress: { emailAddress: "jane@example.com" },
    },
  }),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MOTION_PROPS = new Set([
    "animate", "exit", "initial", "transition", "whileTap",
  ]);
  const motion = new Proxy({}, {
    get: (_, tag: string) =>
      React.forwardRef<HTMLElement, any>(({ children, ...props }, ref) => {
        const filtered = Object.fromEntries(
          Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k))
        );
        return React.createElement(tag, { ...filtered, ref }, children);
      }),
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock("../../../convex/_generated/api", () => ({
  api: { jobProfiles: { createProfile: "jobProfiles.createProfile" } },
}));

afterEach(() => {
  cleanup();
  createProfileMock.mockReset();
  pushMock.mockReset();
});

async function importComponent() {
  return (await import("@/components/jobs/JobOnboarding")).JobOnboarding;
}

describe("JobOnboarding", () => {
  it("renders role picker when no presetRole is provided", async () => {
    const JobOnboarding = await importComponent();
    render(<JobOnboarding returnUrl="/jobs/dashboard" />);
    expect(screen.getByText(/Recruiter/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Seeker/i)).toBeInTheDocument();
  });

  it("hides role picker when presetRole='jobseeker' is provided", async () => {
    const JobOnboarding = await importComponent();
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="jobseeker" />);
    expect(screen.queryByText(/Choose carefully/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Current title/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Company name/i)).not.toBeInTheDocument();
  });

  it("hides role picker and shows company name when presetRole='recruiter'", async () => {
    const JobOnboarding = await importComponent();
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="recruiter" />);
    expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Current title/i)).not.toBeInTheDocument();
  });

  it("does not render LinkedIn or phone fields on the onboarding form", async () => {
    const JobOnboarding = await importComponent();
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="jobseeker" />);
    expect(screen.queryByLabelText(/LinkedIn/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Phone/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/jobs/JobOnboarding.test.tsx`
Expected: FAIL — `presetRole` prop not supported, LinkedIn/Phone fields still rendered.

- [ ] **Step 3: Update `src/components/jobs/JobOnboarding.tsx`**

(a) Change the signature (line 15) to accept `presetRole`:

```tsx
export function JobOnboarding({
  returnUrl,
  presetRole,
}: {
  returnUrl: string;
  presetRole?: JobBoardRole;
}) {
```

(b) Initialize `role` from `presetRole` (line 19):

```tsx
  const [role, setRole] = useState<JobBoardRole | null>(presetRole ?? null);
```

(c) Remove `linkedin_url` and `phone` from the initial form state (lines 22–29):

```tsx
  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    company_name: "",
    current_title: "",
  });
```

(d) Update the `createProfile` call (lines 41–49) to drop the now-removed fields:

```tsx
      await createProfile({
        role,
        name: form.name,
        email: form.email,
        company_name: role === "recruiter" ? form.company_name : undefined,
        current_title: role === "jobseeker" ? form.current_title : undefined,
      });
```

(e) Conditionally render the role picker and indicator. Wrap the step indicator (lines 73–82) and `<StaggerContainer>` block (lines 84–103) in `{!presetRole && (...)}`:

```tsx
        {!presetRole && (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className={`h-0.5 w-12 rounded-full transition-colors duration-300 ${role ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-enterprise-200'}`} />
              <div className={`h-3 w-3 rounded-full transition-colors duration-300 ${role ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-enterprise-200'}`} />
            </div>

            <p className="mb-6 text-center text-xs text-enterprise-400">
              Choose carefully — this selection cannot be changed later.
            </p>

            <StaggerContainer className="grid gap-4 md:grid-cols-2">
              <StaggerItem>
                <RoleCard
                  title="Recruiter"
                  body="Post AI roles and review applicants from one dashboard."
                  icon={<BriefcaseBusiness className="h-5 w-5" />}
                  selected={role === "recruiter"}
                  onClick={() => setRole("recruiter")}
                />
              </StaggerItem>
              <StaggerItem>
                <RoleCard
                  title="Job Seeker"
                  body="Apply to AI roles and track your applications."
                  icon={<Send className="h-5 w-5" />}
                  selected={role === "jobseeker"}
                  onClick={() => setRole("jobseeker")}
                />
              </StaggerItem>
            </StaggerContainer>
          </>
        )}
```

(f) Remove the `<Field label="LinkedIn URL">` and `<Field label="Phone">` blocks (lines 158–171) from the form.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/jobs/JobOnboarding.test.tsx`
Expected: PASS, 4/4.

- [ ] **Step 5: Commit**

```bash
git add src/components/jobs/JobOnboarding.tsx tests/components/jobs/JobOnboarding.test.tsx
git commit -m "feat(jobs): support presetRole on onboarding, drop linkedin/phone fields"
```

---

## Task 5 — `/jobs/onboarding` page: read `?role=` and pass to component

**Files:**
- Modify: `src/app/jobs/onboarding/page.tsx`

- [ ] **Step 1: Add a quick page-level test**

Create `tests/app/jobs-onboarding.page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const jobOnboardingPropsMock = vi.fn();
const searchParamsGetMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: searchParamsGetMock }),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: null, isLoaded: true, isSignedIn: true }),
}));

vi.mock("@/components/shared/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/shared/Container", () => ({
  Container: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/jobs/JobOnboarding", () => ({
  JobOnboarding: (props: Record<string, unknown>) => {
    jobOnboardingPropsMock(props);
    return <div>JobOnboarding</div>;
  },
}));

beforeEach(() => {
  jobOnboardingPropsMock.mockReset();
  searchParamsGetMock.mockReset();
});

describe("/jobs/onboarding page", () => {
  it("passes presetRole='jobseeker' when ?role=jobseeker is in the URL", async () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "role" ? "jobseeker" : null
    );
    const Page = (await import("@/app/jobs/onboarding/page")).default;
    render(<Page />);
    expect(jobOnboardingPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ presetRole: "jobseeker" })
    );
  });

  it("passes presetRole='recruiter' when ?role=recruiter is in the URL", async () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "role" ? "recruiter" : null
    );
    const Page = (await import("@/app/jobs/onboarding/page")).default;
    render(<Page />);
    expect(jobOnboardingPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ presetRole: "recruiter" })
    );
  });

  it("omits presetRole when ?role is missing or invalid", async () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "role" ? "bogus" : null
    );
    const Page = (await import("@/app/jobs/onboarding/page")).default;
    render(<Page />);
    expect(jobOnboardingPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ presetRole: undefined })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/jobs-onboarding.page.test.tsx`
Expected: FAIL — `presetRole` not passed.

- [ ] **Step 3: Update `src/app/jobs/onboarding/page.tsx`**

In the `JobBoardOnboardingContent` function (line 21), read and validate the role param:

Add import (line 10):
```tsx
import { buildJobBoardSignInUrl, isJobBoardRole, sanitizeJobBoardReturnUrl } from "@/jobs/config";
```

Inside `JobBoardOnboardingContent`, after reading `returnUrl` (around line 30), add:
```tsx
  const roleParam = searchParams.get("role");
  const presetRole = isJobBoardRole(roleParam) ? roleParam : undefined;
```

Update the `<JobOnboarding>` render (line 64):
```tsx
          <JobOnboarding returnUrl={returnUrl} presetRole={presetRole} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/jobs-onboarding.page.test.tsx`
Expected: PASS, 3/3.

- [ ] **Step 5: Commit**

```bash
git add src/app/jobs/onboarding/page.tsx tests/app/jobs-onboarding.page.test.tsx
git commit -m "feat(jobs): pass role URL param through to onboarding component"
```

---

## Task 6 — `JobHero`: state-aware CTA matrix

**Files:**
- Modify: `src/components/jobs/JobHero.tsx`
- Test: `tests/components/jobs/JobHero.test.tsx` (new)

- [ ] **Step 1: Write failing tests**

Create `tests/components/jobs/JobHero.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;
let mockIsSignedIn = false;

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: mockIsSignedIn }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole, isLoaded: true }),
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  mockJobBoardRole = null;
  mockIsSignedIn = false;
});

const baseProps = {
  search: "",
  onSearchChange: () => {},
  category: "",
  onCategoryChange: () => {},
};

async function importHero() {
  return (await import("@/components/jobs/JobHero")).JobHero;
}

describe("JobHero CTAs", () => {
  it("signed-out: shows both Find Your Next AI Role and Hire AI Talent", async () => {
    mockIsSignedIn = false;
    mockJobBoardRole = null;
    const JobHero = await importHero();
    render(<JobHero {...baseProps} />);
    expect(screen.getByRole("link", { name: /Find Your Next AI Role/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hire AI Talent/i })).toBeInTheDocument();
  });

  it("signed-out: CTAs point at sign-up with role-specific redirect_url", async () => {
    mockIsSignedIn = false;
    mockJobBoardRole = null;
    const JobHero = await importHero();
    render(<JobHero {...baseProps} />);
    const jobseekerCta = screen.getByRole("link", { name: /Find Your Next AI Role/i });
    const recruiterCta = screen.getByRole("link", { name: /Hire AI Talent/i });
    expect(jobseekerCta.getAttribute("href")).toBe(
      "/sign-up?redirect_url=%2Fjobs%2Fonboarding%3Frole%3Djobseeker"
    );
    expect(recruiterCta.getAttribute("href")).toBe(
      "/sign-up?redirect_url=%2Fjobs%2Fonboarding%3Frole%3Drecruiter"
    );
  });

  it("signed-in with no job-board role: CTAs go straight to onboarding", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = null;
    const JobHero = await importHero();
    render(<JobHero {...baseProps} />);
    expect(
      screen.getByRole("link", { name: /Find Your Next AI Role/i }).getAttribute("href")
    ).toBe("/jobs/onboarding?role=jobseeker");
    expect(
      screen.getByRole("link", { name: /Hire AI Talent/i }).getAttribute("href")
    ).toBe("/jobs/onboarding?role=recruiter");
  });

  it("signed-in jobseeker: shows only 'My Applications' linking to dashboard", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = "jobseeker";
    const JobHero = await importHero();
    render(<JobHero {...baseProps} />);
    expect(
      screen.getByRole("link", { name: /My Applications/i }).getAttribute("href")
    ).toBe("/jobs/dashboard");
    expect(screen.queryByRole("link", { name: /Find Your Next AI Role/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Hire AI Talent/i })).not.toBeInTheDocument();
  });

  it("signed-in recruiter: shows only 'Post a Job' linking to /jobs/post", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = "recruiter";
    const JobHero = await importHero();
    render(<JobHero {...baseProps} />);
    expect(
      screen.getByRole("link", { name: /Post a Job/i }).getAttribute("href")
    ).toBe("/jobs/post");
    expect(screen.queryByRole("link", { name: /Find Your Next AI Role/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/jobs/JobHero.test.tsx`
Expected: FAIL — current hero renders a single "Post a Job" button.

- [ ] **Step 3: Update `src/components/jobs/JobHero.tsx`**

Replace the entire CTA row (lines 50–69, the `<StaggerItem>` containing the search + button) with this logic. First, add imports at the top of the file:

```tsx
import { useAuth } from "@clerk/nextjs";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";
```

Then inside the component, before the `return`:

```tsx
  const { isSignedIn } = useAuth();
  const { role: jobBoardRole } = useJobBoardRole();

  const signedOutHref = (role: "jobseeker" | "recruiter") =>
    `/sign-up?redirect_url=${encodeURIComponent(`/jobs/onboarding?role=${role}`)}`;
  const signedInHref = (role: "jobseeker" | "recruiter") =>
    `/jobs/onboarding?role=${role}`;
  const ctaHref = (role: "jobseeker" | "recruiter") =>
    isSignedIn ? signedInHref(role) : signedOutHref(role);
```

Replace the CTA row (the `<StaggerItem>` that wraps the search bar and "Post a Job" button) with this — keeping the search bar but changing the right-hand button(s) based on state:

```tsx
          <StaggerItem>
            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-enterprise-200 bg-white px-4 py-3 shadow-card transition-all duration-400 ease-smooth focus-within:border-blue-400 focus-within:shadow-card-hover">
                <Search className="h-4 w-4 text-enterprise-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search jobs, companies, skills, or locations"
                  className="w-full bg-transparent text-sm text-enterprise-900 outline-none placeholder:text-enterprise-400"
                />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-4 flex flex-wrap gap-3">
              {jobBoardRole === "jobseeker" ? (
                <Button asChild className="rounded-2xl">
                  <Link href="/jobs/dashboard">
                    My Applications
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : jobBoardRole === "recruiter" ? (
                <Button asChild className="rounded-2xl">
                  <Link href="/jobs/post">
                    Post a Job
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="rounded-2xl">
                    <Link href={ctaHref("jobseeker")}>
                      Find Your Next AI Role
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-2xl">
                    <Link href={ctaHref("recruiter")}>
                      Hire AI Talent
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </StaggerItem>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/jobs/JobHero.test.tsx`
Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/components/jobs/JobHero.tsx tests/components/jobs/JobHero.test.tsx
git commit -m "feat(jobs): state-aware hero CTAs based on jobBoardRole + auth state"
```

---

## Task 7 — Navbar: hide "Join Now" on `/jobs/*`, add "Sign in", pathname-first dashboard

**Files:**
- Modify: `src/components/shared/Navbar.tsx`
- Test: `tests/components/shared/Navbar.test.tsx` (extend)

- [ ] **Step 1: Write failing tests**

Append these tests inside the existing `describe("Navbar", ...)` block in `tests/components/shared/Navbar.test.tsx`. Note: the test file mocks `useJobBoardRole` to return `{ role: null }` by default — we need a way to override per-test, so first add a `mockJobBoardRole` variable at the top.

Find the existing `vi.mock("@/jobs/useJobBoardRole", ...)` (around line 35) and replace it with:

```ts
let mockJobBoardRole: "recruiter" | "jobseeker" | null = null;

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole }),
}));
```

Add to the `afterEach` reset (around line 75):
```ts
  mockJobBoardRole = null;
```

Now add these tests:

```ts
  it("hides 'Join Now' on /jobs/* for signed-out users", () => {
    mockPathname = "/jobs";
    mockIsSignedIn = false;
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /Join Now/i })).not.toBeInTheDocument();
  });

  it("shows a 'Sign in' link on /jobs/* for signed-out users with redirect_url to current pathname", () => {
    mockPathname = "/jobs";
    mockIsSignedIn = false;
    render(<Navbar />);
    const signIn = screen.getByRole("link", { name: /Sign in/i });
    expect(signIn).toBeInTheDocument();
    expect(signIn.getAttribute("href")).toBe("/sign-in?redirect_url=%2Fjobs");
  });

  it("preserves the deep-link pathname in the Sign in redirect_url", () => {
    mockPathname = "/jobs/ai-engineer";
    mockIsSignedIn = false;
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Sign in/i }).getAttribute("href")
    ).toBe("/sign-in?redirect_url=%2Fjobs%2Fai-engineer");
  });

  it("keeps 'Join Now' on non-/jobs paths for signed-out users", () => {
    mockPathname = "/directory";
    mockIsSignedIn = false;
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /Join Now/i })).toBeInTheDocument();
  });

  it("routes Dashboard to /jobs/dashboard when on /jobs/* with a job-board role", () => {
    mockPathname = "/jobs";
    mockIsSignedIn = true;
    mockRole = "gcc";
    mockJobBoardRole = "jobseeker";
    render(<Navbar />);
    const dashboard = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashboard.getAttribute("href")).toBe("/jobs/dashboard");
  });

  it("routes Dashboard to gcc-dashboard when off /jobs/* with gcc + jobseeker", () => {
    mockPathname = "/directory";
    mockIsSignedIn = true;
    mockRole = "gcc";
    mockJobBoardRole = "jobseeker";
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i }).getAttribute("href")
    ).toBe("/gcc-dashboard");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/shared/Navbar.test.tsx`
Expected: FAIL — Join Now still rendered on /jobs, no Sign in link, dashboardPath not pathname-first.

- [ ] **Step 3: Update `src/components/shared/Navbar.tsx`**

(a) Replace the `dashboardPath` calculation (line 61–62) with pathname-first logic:

```tsx
  const dashboardPath = (() => {
    if (isJobsPage && jobBoardRole) return '/jobs/dashboard'
    if (role === 'gcc') return '/gcc-dashboard'
    if (providerSetupStarted) return '/provider/setup'
    if (jobBoardRole) return '/jobs/dashboard'
    return '/dashboard'
  })()
```

(b) Replace the signed-out auth CTA in the desktop nav (lines 230–237) with a context-aware version that preserves the current pathname:

```tsx
              ) : isJobsPage ? (
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
                  className={`ml-2 text-sm font-medium transition-colors duration-300 ${
                    hasScrolledBg ? 'text-enterprise-600 hover:text-enterprise-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign in
                </Link>
              ) : (
                <Link href="/sign-up" className="ml-2">
                  <Button size="sm">
                    <Sparkles className="w-4 h-4" />
                    Join Now
                  </Button>
                </Link>
              )}
```

(c) Replace the mobile-menu signed-out CTA (lines 366–372) similarly:

```tsx
                      ) : isJobsPage ? (
                        <Link
                          href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 text-center text-sm font-medium text-enterprise-700 rounded-lg hover:bg-enterprise-50"
                        >
                          Sign in
                        </Link>
                      ) : (
                        <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">
                            <Sparkles className="w-4 h-4" />
                            Join Now
                          </Button>
                        </Link>
                      )}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/shared/Navbar.test.tsx`
Expected: All tests PASS (including pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/Navbar.tsx tests/components/shared/Navbar.test.tsx
git commit -m "feat(jobs): swap Join Now for Sign in on /jobs/*, pathname-first dashboard"
```

---

## Task 8 — `/auth-redirect`: route job-board-only users to `/jobs/dashboard`

**Files:**
- Modify: `src/app/auth-redirect/page.tsx`
- Test: `tests/app/auth-redirect.page.test.tsx` (new)

- [ ] **Step 1: Write failing tests**

Create `tests/app/auth-redirect.page.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const replaceMock = vi.fn();
let mockUserRole: { role: "gcc" | "provider" | null; isLoaded: boolean; providerSetupStarted: boolean } = {
  role: null,
  isLoaded: true,
  providerSetupStarted: false,
};
let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => mockUserRole,
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole, isLoaded: true }),
}));

vi.mock("@/hooks/usePendingInviteActivation", () => ({
  usePendingInviteActivation: () => ({ isResolving: false }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => null,
}));

vi.mock("../../../convex/_generated/api", () => ({
  api: { companyMembers: { getMyCompany: "companyMembers.getMyCompany" } },
}));

beforeEach(() => {
  replaceMock.mockReset();
  mockUserRole = { role: null, isLoaded: true, providerSetupStarted: false };
  mockJobBoardRole = null;
});

describe("/auth-redirect", () => {
  it("routes job-board-only jobseekers to /jobs/dashboard", async () => {
    mockUserRole = { role: null, isLoaded: true, providerSetupStarted: false };
    mockJobBoardRole = "jobseeker";
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);
    expect(replaceMock).toHaveBeenCalledWith("/jobs/dashboard");
  });

  it("routes job-board-only recruiters to /jobs/dashboard", async () => {
    mockJobBoardRole = "recruiter";
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);
    expect(replaceMock).toHaveBeenCalledWith("/jobs/dashboard");
  });

  it("keeps gcc routing when user has both gcc and a job-board role", async () => {
    mockUserRole = { role: "gcc", isLoaded: true, providerSetupStarted: false };
    mockJobBoardRole = "jobseeker";
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);
    expect(replaceMock).toHaveBeenCalledWith("/gcc-dashboard");
  });

  it("falls back to /onboarding when no role of any kind exists", async () => {
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);
    expect(replaceMock).toHaveBeenCalledWith("/onboarding");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/app/auth-redirect.page.test.tsx`
Expected: FAIL — auth-redirect doesn't consult job-board role yet.

- [ ] **Step 3: Update `src/app/auth-redirect/page.tsx`**

Add the import (line 8 area):
```tsx
import { useJobBoardRole } from "@/jobs/useJobBoardRole";
```

In the component, add the hook call after `useUserRole` (line 12):
```tsx
  const { role: jobBoardRole, isLoaded: jobBoardRoleLoaded } = useJobBoardRole();
```

Replace the `useEffect` body (lines 17–26) with:
```tsx
  useEffect(() => {
    if (!isLoaded || !jobBoardRoleLoaded || isResolvingInvite) return;
    if (role === "gcc") {
      router.replace("/gcc-dashboard");
      return;
    }
    if (role === "provider") {
      if (myCompany === undefined) return;
      router.replace(myCompany ? "/dashboard" : "/provider/setup");
      return;
    }
    if (providerSetupStarted) {
      router.replace("/provider/setup");
      return;
    }
    if (jobBoardRole) {
      router.replace("/jobs/dashboard");
      return;
    }
    router.replace("/onboarding");
  }, [
    role,
    isLoaded,
    isResolvingInvite,
    myCompany,
    providerSetupStarted,
    jobBoardRole,
    jobBoardRoleLoaded,
    router,
  ]);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/app/auth-redirect.page.test.tsx`
Expected: PASS, 4/4.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth-redirect/page.tsx tests/app/auth-redirect.page.test.tsx
git commit -m "feat(auth): route job-board-only users to /jobs/dashboard after sign-in"
```

---

## Task 9 — `/jobs/post`: add regression test for existing recruiter-only guard

**Context:** `src/app/jobs/post/page.tsx:43-70` already renders a friendly block ("Only recruiter accounts can post jobs") when `role !== "recruiter"`. No code change needed — just lock in the behavior with a test so it can't regress.

**Files:**
- Test only: `tests/app/jobs-post.page.test.tsx` (new)

- [ ] **Step 1: Write the test**

Create `tests/app/jobs-post.page.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = "jobseeker";
const replaceMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({
    profile: { company_name: "Acme" },
    role: mockJobBoardRole,
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock("@/components/shared/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/shared/Container", () => ({
  Container: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/jobs/JobPostForm", () => ({
  JobPostForm: () => <div>JobPostForm</div>,
}));

beforeEach(() => {
  mockJobBoardRole = "jobseeker";
  replaceMock.mockReset();
});

afterEach(() => cleanup());

describe("/jobs/post page", () => {
  it("shows the recruiter-only friendly block when the user is a jobseeker", async () => {
    mockJobBoardRole = "jobseeker";
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);
    expect(
      screen.getByText(/Only recruiter accounts can post jobs/i)
    ).toBeInTheDocument();
    expect(screen.queryByText("JobPostForm")).not.toBeInTheDocument();
  });

  it("renders the post form when the user is a recruiter", async () => {
    mockJobBoardRole = "recruiter";
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);
    expect(screen.getByText("JobPostForm")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run tests/app/jobs-post.page.test.tsx`
Expected: PASS, 2/2 (the underlying behavior already exists; this just locks it in).

- [ ] **Step 3: Commit**

```bash
git add tests/app/jobs-post.page.test.tsx
git commit -m "test(jobs): regression test for /jobs/post recruiter-only guard"
```

---

## Task 10 — `/jobs/[slug]/apply` recruiter guard: already covered in Task 3

The recruiter friendly block at `src/app/jobs/[slug]/apply/page.tsx:153-188` ("Recruiter accounts cannot apply") already exists in the codebase, and Task 3's test file (`tests/app/jobs-apply.page.test.tsx`) includes a `describe("/jobs/[slug]/apply — recruiter guard", ...)` block that locks it in.

No additional work for this task — skip to Task 11.

---

## Task 11 — Carry role intent through action-page redirects and JobDetail CTAs

**Why:** Without this, a signed-in null-role user (e.g. a GCC buyer) clicking "Apply Now" on a job detail page, or hitting `/jobs/post` via a deep link, still gets redirected to `/jobs/onboarding` *without* a `role=` param — meaning they hit the role picker. The hero CTAs already set role intent (Task 6); this task closes the same loop for the other two entry paths.

**Files:**
- Modify: `src/app/jobs/post/page.tsx:27`
- Modify: `src/app/jobs/[slug]/apply/page.tsx:94-98`
- Modify: `src/components/jobs/JobDetail.tsx:214-225`
- Test: `tests/app/jobs-post.page.test.tsx` (extend), `tests/app/jobs-apply.page.test.tsx` (extend)

- [ ] **Step 1: Write failing tests**

Extend `tests/app/jobs-post.page.test.tsx` (created in Task 9 — note that the test file already declares `const replaceMock = vi.fn()` at module level and resets it in `beforeEach`) with this additional case inside `describe("/jobs/post page", ...)`:

```tsx
  it("redirects null-role signed-in users to onboarding with role=recruiter", async () => {
    mockJobBoardRole = null;
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(replaceMock).toHaveBeenCalledWith(
      "/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost"
    );
  });
```

Extend `tests/app/jobs-apply.page.test.tsx` (created in Task 3) — first add a module-level `replaceMock` and update the `next/navigation` mock:

```tsx
// Add near the top (replace the existing next/navigation mock):
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

// And reset in beforeEach:
beforeEach(() => {
  mockJobBoardRole = "jobseeker";
  replaceMock.mockReset();
});
```

Then add a new `describe` block:

```tsx
describe("/jobs/[slug]/apply — null-role redirect", () => {
  it("redirects null-role signed-in users to onboarding with role=jobseeker", async () => {
    mockJobBoardRole = null;
    await renderPage();
    expect(replaceMock).toHaveBeenCalledWith(
      expect.stringContaining("/jobs/onboarding?role=jobseeker&returnUrl=")
    );
  });
});
```

Create `tests/components/jobs/JobDetail.cta.test.tsx`. Important: `JobDetail` only accepts `{ slug }` and loads the job via `api.jobs.getPublicBySlug`, so mock `useQuery` based on the Convex function reference rather than passing a `job` prop:

```tsx
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockIsSignedIn = false;
let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;

vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: mockIsSignedIn }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({
    role: mockJobBoardRole,
    isLoaded: true,
    profile: null,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: (ref: unknown) => {
    if (String(ref).includes("getPublicBySlug")) return job;
    if (String(ref).includes("hasApplied")) return false;
    return undefined;
  },
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    motion: new Proxy({}, { get: () => ({ children }: any) => <>{children}</> }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

afterEach(() => {
  cleanup();
  mockIsSignedIn = false;
  mockJobBoardRole = null;
});

const job = {
  _id: "job_1",
  title: "AI Engineer",
  company_name: "Acme",
  location: "Remote",
  workplace_type: "remote",
  job_type: "full-time",
  seniority: "mid",
  category: "engineering",
  description: "Build cool stuff.",
  can_apply: true,
  apply_url: null,
};

async function importDetail() {
  return (await import("@/components/jobs/JobDetail")).JobDetail;
}

describe("JobDetail Apply Now CTA — role intent", () => {
  it("signed-out: 'Sign in to apply' carries role=jobseeker into the apply URL", async () => {
    mockIsSignedIn = false;
    const JobDetail = await importDetail();
    render(<JobDetail slug="ai-engineer" />);
    const cta = screen.getByRole("link", { name: /Sign in to apply/i });
    expect(cta.getAttribute("href")).toContain("role%3Djobseeker");
  });

  it("signed-in no-role: 'Set up your Job Board profile' goes to onboarding with role=jobseeker", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = null;
    const JobDetail = await importDetail();
    render(<JobDetail slug="ai-engineer" />);
    const cta = screen.getByRole("link", { name: /Set up your Job Board profile/i });
    expect(cta.getAttribute("href")).toMatch(
      /^\/jobs\/onboarding\?role=jobseeker&returnUrl=/
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/app/jobs-post.page.test.tsx tests/app/jobs-apply.page.test.tsx tests/components/jobs/JobDetail.cta.test.tsx`
Expected: FAIL — current redirects don't include role param.

- [ ] **Step 3: Update `src/app/jobs/post/page.tsx`**

Replace line 27:
```tsx
      router.replace("/jobs/onboarding?returnUrl=%2Fjobs%2Fpost");
```

with:
```tsx
      router.replace("/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost");
```

- [ ] **Step 4: Update `src/app/jobs/[slug]/apply/page.tsx`**

Replace lines 94–98:
```tsx
    if (!role) {
      router.replace(
        `/jobs/onboarding?returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
```

with:
```tsx
    if (!role) {
      router.replace(
        `/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
```

- [ ] **Step 5: Update `src/components/jobs/JobDetail.tsx`**

Replace the signed-out branch (lines 214–219):
```tsx
                ) : !isSignedIn ? (
                  <Button asChild className="w-full">
                    <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}>
                      Sign in to apply
                    </Link>
                  </Button>
```

with:
```tsx
                ) : !isSignedIn ? (
                  <Button asChild className="w-full">
                    <Link
                      href={`/sign-in?redirect_url=${encodeURIComponent(
                        `/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`
                      )}`}
                    >
                      Sign in to apply
                    </Link>
                  </Button>
```

Replace the no-role branch (lines 220–225):
```tsx
                ) : !role ? (
                  <Button asChild className="w-full">
                    <Link href={`/jobs/onboarding?returnUrl=${encodeURIComponent(returnUrl)}`}>
                      Set up your Job Board profile to apply
                    </Link>
                  </Button>
```

with:
```tsx
                ) : !role ? (
                  <Button asChild className="w-full">
                    <Link
                      href={`/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`}
                    >
                      Set up your Job Board profile to apply
                    </Link>
                  </Button>
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/app/jobs-post.page.test.tsx tests/app/jobs-apply.page.test.tsx tests/components/jobs/JobDetail.cta.test.tsx`
Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/jobs/post/page.tsx 'src/app/jobs/[slug]/apply/page.tsx' src/components/jobs/JobDetail.tsx tests/app/jobs-post.page.test.tsx tests/app/jobs-apply.page.test.tsx tests/components/jobs/JobDetail.cta.test.tsx
git commit -m "feat(jobs): carry role intent through action-page redirects and JobDetail CTAs"
```

---

## Task 12 — Full-suite verification + manual QA

- [ ] **Step 1: Run the entire Vitest suite**

Run: `npm test -- --run`
Expected: All tests pass. Investigate any unrelated failures (existing tests should not be affected).

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint`
Expected: No errors.

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Manual QA in the running app**

With `npm run dev` and `npx convex dev` running, walk through:

1. **Signed-out on `/jobs`** — both hero CTAs visible; navbar shows "Sign in" not "Join Now"; the Sign in link's `redirect_url` is the current pathname (verify on `/jobs/[slug]` too).
2. **Click "Find Your Next AI Role"** (signed out) — Clerk sign-up flow, then `/jobs/onboarding` with role-confirm form (no picker). After submit → `/jobs/dashboard`.
3. **Click "Hire AI Talent"** (signed out) — same flow with `company_name` field, ends at `/jobs/dashboard`.
4. **Existing jobseeker on `/jobs`** — hero shows only "My Applications".
5. **Existing recruiter on `/jobs`** — hero shows only "Post a Job".
6. **GCC user on `/jobs`** (no job-board role) — both hero CTAs visible; clicking either goes directly to `/jobs/onboarding?role=X` (no Clerk re-auth). After completing, they're a multi-role user with both marketplace and job-board identities.
7. **GCC user clicks "Apply Now" on a job detail page** — routed to `/jobs/onboarding?role=jobseeker&returnUrl=/jobs/[slug]/apply` (no role picker). After onboarding → back to apply form.
8. **GCC user hits `/jobs/post` via deep link** — routed to `/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost`.
9. **Apply to a job** — application form: "Applying as Jane Doe" header, current_title field pre-filled from profile (editable), required LinkedIn URL field. Submit with `linkedin.com/in/handle` (no https://) — should succeed (server normalizes).
10. **LinkedIn validation** — try `https://github.com/foo` → inline error. Try empty → required-field error on submit.
11. **Jobseeker visits `/jobs/post`** — friendly block, no form.
12. **Recruiter clicks "Apply Now"** on a listing — friendly block, no form.
13. **Sign in via the `/jobs` "Sign in" link** on `/jobs/ai-engineer` (deep link) as a returning user — lands back on `/jobs/ai-engineer`, not the bare `/jobs`.
14. **Recruiter dashboard** — open an existing job that has applicants and verify `current_title` displays correctly for both legacy applications (already have it) and new applications submitted post-change.

Document any deviations and fix before declaring done.

- [ ] **Step 4: Final commit if any fix-ups needed**

```bash
git status
# If anything needs fixing, fix and commit as a small follow-up.
```

---

## Out of scope (deferred to future plans)

- Recruiter dashboard UX changes.
- Email / push notifications for state changes.
- Job-board role switching for an existing account.
- Profile editing UI.
- External `apply_url` UX rework.
- SEO / schema markup for `/jobs`.
