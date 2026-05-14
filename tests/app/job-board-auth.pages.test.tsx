import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signInPropsMock = vi.fn();
const signUpPropsMock = vi.fn();
const searchParamsGetMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: searchParamsGetMock,
  }),
}));

vi.mock("@clerk/nextjs", () => ({
  SignIn: (props: Record<string, unknown>) => {
    signInPropsMock(props);
    return <div>SignIn</div>;
  },
  SignUp: (props: Record<string, unknown>) => {
    signUpPropsMock(props);
    return <div>SignUp</div>;
  },
}));

describe("job-board auth pages", () => {
  beforeEach(() => {
    signInPropsMock.mockReset();
    signUpPropsMock.mockReset();
    searchParamsGetMock.mockReset();
  });

  it("forces sign-in through job-board onboarding for job routes", async () => {
    searchParamsGetMock.mockReturnValue("/jobs/post");

    const Page = (await import("@/app/sign-in/[[...sign-in]]/page")).default;
    render(<Page />);

    expect(screen.getByText("SignIn")).toBeInTheDocument();
    expect(signInPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackRedirectUrl: "/jobs/onboarding?returnUrl=%2Fjobs%2Fpost",
        forceRedirectUrl: "/jobs/onboarding?returnUrl=%2Fjobs%2Fpost",
      })
    );
  });

  it("keeps the default sign-in fallback for non-job routes", async () => {
    searchParamsGetMock.mockReturnValue("/dashboard");

    const Page = (await import("@/app/sign-in/[[...sign-in]]/page")).default;
    render(<Page />);

    expect(signInPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackRedirectUrl: "/auth-redirect",
        forceRedirectUrl: undefined,
      })
    );
  });

  it("forces sign-up through job-board onboarding for job routes", async () => {
    searchParamsGetMock.mockReturnValue("/jobs/ai-qa-e2e-role");

    const Page = (await import("@/app/sign-up/[[...sign-up]]/page")).default;
    render(<Page />);

    expect(screen.getByText("SignUp")).toBeInTheDocument();
    expect(signUpPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackRedirectUrl:
          "/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-e2e-role",
        forceRedirectUrl:
          "/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-e2e-role",
      })
    );
  });

  it("preserves apply routes through job-board onboarding", async () => {
    searchParamsGetMock.mockReturnValue("/jobs/ai-qa-e2e-role/apply");

    const Page = (await import("@/app/sign-in/[[...sign-in]]/page")).default;
    render(<Page />);

    expect(signInPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackRedirectUrl:
          "/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-e2e-role%2Fapply",
        forceRedirectUrl:
          "/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-e2e-role%2Fapply",
      })
    );
  });
});
