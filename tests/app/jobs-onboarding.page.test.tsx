import { render, waitFor } from "@testing-library/react";
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
  Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  it("passes presetRole from a valid role query param", async () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "role" ? "jobseeker" : null
    );
    const Page = (await import("@/app/jobs/onboarding/page")).default;
    render(<Page />);

    await waitFor(() =>
      expect(jobOnboardingPropsMock).toHaveBeenCalledWith(
        expect.objectContaining({ presetRole: "jobseeker" })
      )
    );
  });

  it("omits presetRole for invalid role query params", async () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "role" ? "bogus" : null
    );
    const Page = (await import("@/app/jobs/onboarding/page")).default;
    render(<Page />);

    await waitFor(() =>
      expect(jobOnboardingPropsMock).toHaveBeenCalledWith(
        expect.objectContaining({ presetRole: undefined })
      )
    );
  });
});
