import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { primaryEmailAddress: { emailAddress: "test@test.com" } } }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("GccOnboardingForm", () => {
  it("renders all 4 fields", async () => {
    const { GccOnboardingForm } = await import("@/components/onboarding/GccOnboardingForm");
    render(<GccOnboardingForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
  });
});
