import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminCompanySubmissionsTab } from "@/components/admin/AdminCompanySubmissionsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Company Logo</div>,
}));

describe("AdminCompanySubmissionsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();

    useQueryMock.mockReturnValue([
      {
        _id: "submission-1",
        company_name: "Acme AI",
        website: "https://acme.example.com",
        headquarters: "Bengaluru, India",
        description: "Builds AI systems for large enterprise operations teams.",
        primary_verticals: ["Technology"],
        contact_email: "hello@acme.example.com",
        logo_url: "https://cdn.example.com/acme-logo.svg",
        logo_bg: "dark",
        created_at: Date.now(),
        initial_agent: null,
        initialAgentValidationErrors: [],
      },
    ]);
    useMutationMock.mockReturnValue(vi.fn());
  });

  it("shows the submitted company logo preview for review", () => {
    render(<AdminCompanySubmissionsTab />);

    expect(screen.getAllByText("Company Logo").length).toBeGreaterThan(0);
    expect(screen.getByText("Submitted Logo")).toBeInTheDocument();
    expect(
      screen.getByText(/dark background treatment requested/i)
    ).toBeInTheDocument();
  });
});
