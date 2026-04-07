import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMutationMock = vi.fn();
const useQueryMock = vi.fn();
const submitClaimMock = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("ClaimForm", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryMock.mockReset();
    submitClaimMock.mockReset();

    useMutationMock.mockReturnValue(submitClaimMock);
    useQueryMock.mockReturnValue({
      _id: "company-1",
      name: "Test Co",
      slug: "test-company",
    });
    submitClaimMock.mockResolvedValue("claim-1");
  });

  it("shows an error for a free email provider", async () => {
    const { ClaimForm } = await import("@/components/claim/ClaimForm");
    render(<ClaimForm companySlug="test-company" />);

    const emailInput = screen.getByLabelText(/corporate email/i);
    fireEvent.change(emailInput, { target: { value: "user@gmail.com" } });
    fireEvent.blur(emailInput);

    expect(
      screen.getByText(/please use a corporate email address/i)
    ).toBeInTheDocument();
  });

  it("requires a valid LinkedIn profile URL before submission", async () => {
    const { ClaimForm } = await import("@/components/claim/ClaimForm");
    render(<ClaimForm companySlug="test-company" />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Asha Singh" },
    });
    fireEvent.change(screen.getByLabelText(/corporate email/i), {
      target: { value: "asha@testco.com" },
    });

    const linkedinInput = screen.getByLabelText(/linkedin profile/i);
    fireEvent.change(linkedinInput, {
      target: { value: "https://www.linkedin.com/company/testco" },
    });
    fireEvent.blur(linkedinInput);

    expect(
      screen.getByText(/enter a valid linkedin profile url ending in \/in\/\.\.\. or \/pub\//i)
    ).toBeInTheDocument();
    expect(submitClaimMock).not.toHaveBeenCalled();
  });

  it("submits the required LinkedIn URL with the claim request", async () => {
    const { ClaimForm } = await import("@/components/claim/ClaimForm");
    render(<ClaimForm companySlug="test-company" />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Asha Singh" },
    });
    fireEvent.change(screen.getByLabelText(/corporate email/i), {
      target: { value: "asha@testco.com" },
    });
    fireEvent.change(screen.getByLabelText(/linkedin profile/i), {
      target: { value: "https://www.linkedin.com/in/asha-singh" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit claim/i }));

    await waitFor(() =>
      expect(submitClaimMock).toHaveBeenCalledWith({
        company_id: "company-1",
        claimant_name: "Asha Singh",
        claimant_email: "asha@testco.com",
        claimant_linkedin: "https://www.linkedin.com/in/asha-singh",
      })
    );
  });
});
