import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminClaimsTab } from "@/components/admin/AdminClaimsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useActionMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useAction: (...args: unknown[]) => useActionMock(...args),
}));

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Company Logo</div>,
}));

describe("AdminClaimsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useActionMock.mockReset();

    useQueryMock.mockReturnValue([
      {
        _id: "claim-1",
        claimant_name: "Asha Singh",
        claimant_email: "asha@acme.ai",
        claimant_linkedin: "https://www.linkedin.com/in/asha-singh",
        created_at: Date.now(),
        company: {
          _id: "company-1",
          name: "Acme AI",
          logo_url: "https://cdn.example.com/acme-logo.svg",
          logo_bg: "dark",
        },
      },
    ]);
    useMutationMock.mockReturnValue(vi.fn());
    useActionMock.mockReturnValue(vi.fn());
  });

  it("renders company claims with the shared company logo component", () => {
    render(<AdminClaimsTab />);

    expect(screen.getByText("Asha Singh")).toBeInTheDocument();
    expect(screen.getByText("Company Logo")).toBeInTheDocument();
    expect(screen.getByText("Acme AI")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /linkedin profile/i })
    ).toHaveAttribute("href", "https://www.linkedin.com/in/asha-singh");
  });
});
