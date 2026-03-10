import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
  useQuery: () => ({ _id: "123", name: "Test Co", slug: "test-company" }),
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ClaimForm", () => {
  it("shows error for free email provider", async () => {
    const { ClaimForm } = await import("@/components/claim/ClaimForm");
    render(<ClaimForm companySlug="test-company" />);

    const emailInput = screen.getByLabelText(/company email/i);
    fireEvent.change(emailInput, { target: { value: "user@gmail.com" } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/corporate email/i)).toBeInTheDocument();
  });
});
