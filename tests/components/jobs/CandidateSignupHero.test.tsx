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

function fillForm({ name = "Ravi Menon", email = "ravi@example.com" } = {}) {
  fireEvent.change(screen.getByLabelText(/^name$/i), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: email },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /notify me/i }));
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
  it("only asks for a name and an email", async () => {
    await renderHero();

    expect(screen.getByLabelText(/^name$/i)).toBeTruthy();
    expect(screen.getByLabelText(/^email$/i)).toBeTruthy();
    expect(screen.queryByLabelText(/job title/i)).toBeNull();
    expect(screen.queryByLabelText(/experience/i)).toBeNull();
    expect(screen.queryByLabelText(/kind of role/i)).toBeNull();
  });

  it("submits just the name and email, then shows the done state", async () => {
    await renderHero();
    fillForm();
    submit();

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    expect(submitLead).toHaveBeenCalledWith({
      full_name: "Ravi Menon",
      email: "ravi@example.com",
      source: "linkedin",
      user_agent: expect.any(String),
    });

    expect(await screen.findByText(/you[’']re on the list/i)).toBeTruthy();
    expect(window.localStorage.getItem(CANDIDATE_LEAD_STORAGE_KEY)).toBe(
      "ravi@example.com"
    );
  });

  it("does not submit when the email is invalid", async () => {
    await renderHero();
    fillForm({ email: "not-an-email" });
    submit();

    expect(await screen.findByText(/valid email/i)).toBeTruthy();
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("does not submit when the name is missing", async () => {
    await renderHero();
    fillForm({ name: "" });
    submit();

    expect(await screen.findByText(/enter your full name/i)).toBeTruthy();
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("renders the done state on mount when the visitor already signed up", async () => {
    window.localStorage.setItem(CANDIDATE_LEAD_STORAGE_KEY, "ravi@example.com");

    await renderHero();

    expect(await screen.findByText(/you[’']re on the list/i)).toBeTruthy();
    expect(screen.queryByLabelText(/^email$/i)).toBeNull();
  });

  it("surfaces a server message without losing the form", async () => {
    submitLead.mockRejectedValue({
      data: { message: "Please enter a valid email address." },
    });
    await renderHero();
    fillForm();
    submit();

    expect(await screen.findByText(/valid email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/^email$/i)).toBeTruthy();
  });

  it("falls back to a friendly message when the failure is opaque", async () => {
    submitLead.mockRejectedValue({});
    await renderHero();
    fillForm();
    submit();

    expect(await screen.findByText(/couldn't add you/i)).toBeTruthy();
    expect(screen.getByLabelText(/^email$/i)).toBeTruthy();
  });
});
