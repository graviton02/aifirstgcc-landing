import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-job-user",
  email: "admin@orbys360.com",
};

const recruiterIdentity = {
  subject: "recruiter-job-user",
  email: "recruiter@example.com",
};

const seekerIdentity = {
  subject: "jobseeker-user",
  email: "seeker@example.com",
};

describe("job board workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("keeps pending jobs private until admin approval", async () => {
    await t.withIdentity(recruiterIdentity).mutation(api.jobProfiles.createProfile, {
      role: "recruiter",
      name: "Recruiter",
      email: recruiterIdentity.email,
      company_name: "Recruiter Co",
    });

    const createdJob = await t.withIdentity(recruiterIdentity).mutation(api.jobs.create, {
      title: "AI Engineer",
      company_name: "Recruiter Co",
      location: "Bengaluru, India",
      workplace_type: "remote",
      job_type: "full-time",
      seniority: "mid",
      category: "engineering",
      description: "Build production AI systems.",
      requirements: "TypeScript and Python",
      skills: ["TypeScript", "Python"],
    });

    const privateListings = await t.query(api.jobs.listPublic, {});
    expect(privateListings.count).toBe(0);

    await t.withIdentity(adminIdentity).mutation(api.admin.approveJob, {
      job_id: createdJob!._id as Id<"jobs">,
    });

    const publicListings = await t.query(api.jobs.listPublic, {});
    expect(publicListings.count).toBe(1);

    const detail = await t.query(api.jobs.getPublicBySlug, {
      slug: createdJob!.slug,
    });
    expect(detail?.title).toBe("AI Engineer");
  });

  it("blocks duplicate applications for the same job and jobseeker", async () => {
    const jobId = await seedApprovedJob(t);

    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    const args = {
      job_id: jobId,
      phone: "+91 99999 11111",
      current_company: "Current Co",
      current_title: "ML Engineer",
      linkedin_url: "https://www.linkedin.com/in/seeker",
      years_of_experience: 4,
      cover_note: "I would be a good fit.",
      resume_storage_id: "storage-resume-1" as any,
      resume_file_name: "resume.pdf",
      resume_content_type: "application/pdf",
      resume_size_bytes: 1024,
    };

    await t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, args);

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, args)
    ).rejects.toThrow("You have already applied to this job.");
  });

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
        linkedin_url: "",
        years_of_experience: 4,
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
        linkedin_url: "https://github.com/jane",
        years_of_experience: 4,
        resume_storage_id: "storage-resume-1" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      })
    ).rejects.toThrow("LinkedIn URL must look like");
  });

  it("normalizes LinkedIn URLs missing the https:// prefix", async () => {
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
        current_title: "ML Engineer",
        linkedin_url: "www.linkedin.com/in/seeker",
        years_of_experience: 4,
        resume_storage_id: "storage-resume-1" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      });

    expect(application?.linkedin_url).toBe("https://www.linkedin.com/in/seeker");
    expect(application?.current_title).toBe("ML Engineer");
  });

  it("creates jobseeker profiles without Clerk organization fields", async () => {
    const profile = await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    expect(profile?.role).toBe("jobseeker");
    expect(profile).not.toHaveProperty("organization_id");
    expect(profile).not.toHaveProperty("clerk_org_id");
  });

  it("blocks jobseekers from posting jobs", async () => {
    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobs.create, {
        title: "AI Engineer",
        company_name: "Recruiter Co",
        location: "Bengaluru, India",
        workplace_type: "remote",
        job_type: "full-time",
        seniority: "mid",
        category: "engineering",
        description: "Build production AI systems.",
      })
    ).rejects.toThrow("Recruiter profile required.");
  });

  it("blocks recruiters from applying to jobs", async () => {
    const jobId = await seedApprovedJob(t);

    await expect(
      t.withIdentity(recruiterIdentity).mutation(api.jobApplications.create, {
        job_id: jobId,
        phone: "+91 99999 11111",
        linkedin_url: "https://www.linkedin.com/in/recruiter",
        years_of_experience: 4,
        resume_storage_id: "storage-recruiter-resume" as any,
        resume_file_name: "resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: 1024,
      })
    ).rejects.toThrow("Jobseeker profile required.");
  });

  it("shows applications on the owning recruiter dashboard", async () => {
    const jobId = await seedApprovedJob(t);

    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    await t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, {
      job_id: jobId,
      phone: "+91 99999 11111",
      current_company: "Current Co",
      current_title: "ML Engineer",
      linkedin_url: "https://www.linkedin.com/in/seeker",
      years_of_experience: 4,
      cover_note: "I would be a good fit.",
      resume_storage_id: "storage-dashboard-resume" as any,
      resume_file_name: "resume.pdf",
      resume_content_type: "application/pdf",
      resume_size_bytes: 1024,
    });

    const dashboard = await t
      .withIdentity(recruiterIdentity)
      .query(api.jobs.getRecruiterDashboard, {});

    expect(dashboard).toHaveLength(1);
    expect(dashboard[0].applicant_count).toBe(1);
    expect(dashboard[0].applicants[0].email).toBe(seekerIdentity.email);
  });

  it("rejects applications for external-apply and expired jobs", async () => {
    const externalJobId = await seedApprovedJob(t, {
      apply_url: "https://company.example/apply",
    });
    const expiredJobId = await seedApprovedJob(t);

    await t.run((ctx) =>
      ctx.db.patch(expiredJobId, {
        deadline: Date.now() - 60_000,
      })
    );

    await t.withIdentity(seekerIdentity).mutation(api.jobProfiles.createProfile, {
      role: "jobseeker",
      name: "Seeker",
      email: seekerIdentity.email,
      current_title: "ML Engineer",
    });

    const commonArgs = {
      phone: "+91 99999 11111",
      current_company: "Current Co",
      current_title: "ML Engineer",
      linkedin_url: "https://www.linkedin.com/in/seeker",
      years_of_experience: 4,
      cover_note: "Interested.",
      resume_storage_id: "storage-resume-2" as any,
      resume_file_name: "resume.pdf",
      resume_content_type: "application/pdf",
      resume_size_bytes: 1024,
    };

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, {
        job_id: externalJobId,
        ...commonArgs,
      })
    ).rejects.toThrow("This job is not accepting applications.");

    await expect(
      t.withIdentity(seekerIdentity).mutation(api.jobApplications.create, {
        job_id: expiredJobId,
        ...commonArgs,
      })
    ).rejects.toThrow("This job is not accepting applications.");
  });
});

async function seedApprovedJob(
  t: ReturnType<typeof createTestConvex>,
  overrides: Partial<{
    apply_url: string;
  }> = {}
) {
  await t.withIdentity(recruiterIdentity).mutation(api.jobProfiles.createProfile, {
    role: "recruiter",
    name: "Recruiter",
    email: recruiterIdentity.email,
    company_name: "Recruiter Co",
  }).catch(() => null);

  const createdJob = await t.withIdentity(recruiterIdentity).mutation(api.jobs.create, {
    title: `AI Engineer ${Math.random().toString(36).slice(2, 8)}`,
    company_name: "Recruiter Co",
    location: "Bengaluru, India",
    workplace_type: "remote",
    job_type: "full-time",
    seniority: "mid",
    category: "engineering",
    description: "Build production AI systems.",
    requirements: "TypeScript and Python",
    skills: ["TypeScript", "Python"],
    apply_url: overrides.apply_url,
  });

  await t.withIdentity(adminIdentity).mutation(api.admin.approveJob, {
    job_id: createdJob!._id as Id<"jobs">,
  });

  return createdJob!._id as Id<"jobs">;
}
