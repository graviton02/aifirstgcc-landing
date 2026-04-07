import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";

const createProfileMock = vi.fn();
const pushMock = vi.fn();
const reloadMock = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: () => createProfileMock,
}));
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      reload: reloadMock,
      primaryEmailAddress: { emailAddress: "test@test.com" },
    },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("GccOnboardingForm", () => {
  beforeEach(() => {
    createProfileMock.mockReset();
    pushMock.mockReset();
    reloadMock.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true } as Response));
  });

  it("renders all 4 fields", async () => {
    const { GccOnboardingForm } = await import("@/components/onboarding/GccOnboardingForm");
    render(<GccOnboardingForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
  });

  it("shows a persona conflict message when GCC onboarding is blocked", async () => {
    const error = new Error("provider conflict") as Error & {
      data?: { message: string; status: number };
    };
    error.data = {
      message:
        "This account is already set up as a provider account. Use a different email if you need GCC access.",
      status: 409,
    };
    createProfileMock.mockRejectedValue(error);

    const { GccOnboardingForm } = await import("@/components/onboarding/GccOnboardingForm");
    render(<GccOnboardingForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Priya Sharma" },
    });
    fireEvent.change(screen.getByLabelText(/organization/i), {
      target: { value: "Acme GCC" },
    });
    fireEvent.change(screen.getByLabelText(/industry/i), {
      target: { value: "Healthcare & Life Sciences" },
    });
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /this account is already set up as a provider account\. use a different email if you need gcc access\./i
        )
      ).toBeInTheDocument()
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
