import type { ReactNode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CANDIDATE_LEAD_STORAGE_KEY } from "@/jobs/config";

const submitLead = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("src=linkedin"),
}));

vi.mock("convex/react", () => ({
  useMutation: () => submitLead,
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

async function renderHero() {
  const { CandidateSignupHero } = await import(
    "@/components/jobs/CandidateSignupHero"
  );
  return render(<CandidateSignupHero />);
}

function completeStepOne() {
  fireEvent.change(screen.getByLabelText(/^name$/i), {
    target: { value: "Ravi Menon" },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "ravi@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
}

function completeStepTwo({ withProfileUrl = true } = {}) {
  fireEvent.change(screen.getByLabelText(/current job title/i), {
    target: { value: "Senior ML Engineer" },
  });
  fireEvent.change(screen.getByLabelText(/years of experience/i), {
    target: { value: "6-10" },
  });
  fireEvent.change(screen.getByLabelText(/kind of role/i), {
    target: { value: "ai-ml" },
  });
  if (withProfileUrl) {
    fireEvent.change(screen.getByLabelText(/linkedin/i), {
      target: { value: "https://www.linkedin.com/in/ravi-menon" },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: /join the list/i }));
}

beforeEach(() => {
  submitLead.mockReset();
  submitLead.mockResolvedValue({ ok: true, alreadyRegistered: false });
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("CandidateSignupHero", () => {
  it("advances to step two once a name and valid email are entered", async () => {
    await renderHero();

    expect(screen.queryByLabelText(/current job title/i)).toBeNull();
    completeStepOne();

    expect(await screen.findByLabelText(/current job title/i)).toBeTruthy();
  });

  it("does not advance when the email is invalid", async () => {
    await renderHero();

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Ravi Menon" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/valid email/i)).toBeTruthy();
    expect(screen.queryByLabelText(/current job title/i)).toBeNull();
  });

  it("submits the collected values and shows the done state", async () => {
    await renderHero();
    completeStepOne();
    await screen.findByLabelText(/current job title/i);
    completeStepTwo();

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Ravi Menon",
        email: "ravi@example.com",
        current_title: "Senior ML Engineer",
        years_experience: "6-10",
        job_category: "ai-ml",
        profile_url: "https://www.linkedin.com/in/ravi-menon",
        source: "linkedin",
      })
    );

    expect(await screen.findByText(/you[’']re on the list/i)).toBeTruthy();
    expect(window.localStorage.getItem(CANDIDATE_LEAD_STORAGE_KEY)).toBe(
      "ravi@example.com"
    );
  });

  it("omits an empty profile URL from the submission", async () => {
    await renderHero();
    completeStepOne();
    await screen.findByLabelText(/current job title/i);
    completeStepTwo({ withProfileUrl: false });

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead.mock.calls[0][0].profile_url).toBeUndefined();
  });

  it("renders the done state on mount when the visitor already signed up", async () => {
    window.localStorage.setItem(CANDIDATE_LEAD_STORAGE_KEY, "ravi@example.com");

    await renderHero();

    expect(await screen.findByText(/you[’']re on the list/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /continue/i })).toBeNull();
  });

  it("surfaces a server validation message without losing the form", async () => {
    submitLead.mockRejectedValue({
      data: { message: "Please enter a valid email address." },
    });
    await renderHero();
    completeStepOne();
    await screen.findByLabelText(/current job title/i);
    completeStepTwo();

    expect(await screen.findByText(/valid email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/current job title/i)).toBeTruthy();
  });

  it("falls back to a friendly message when the failure is opaque", async () => {
    submitLead.mockRejectedValue({});
    await renderHero();
    completeStepOne();
    await screen.findByLabelText(/current job title/i);
    completeStepTwo();

    expect(await screen.findByText(/couldn't add you/i)).toBeTruthy();
    expect(screen.getByLabelText(/current job title/i)).toBeTruthy();
  });
});
