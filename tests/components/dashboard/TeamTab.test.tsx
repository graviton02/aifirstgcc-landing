import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("TeamTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();

    useQueryMock.mockReturnValue([
      {
        _id: "owner-1",
        email: "owner@company.com",
        role: "owner",
        status: "active",
      },
      {
        _id: "member-1",
        email: "member@company.com",
        role: "member",
        status: "active",
      },
    ]);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("hides invite controls for non-owners", async () => {
    const { TeamTab } = await import("@/components/dashboard/TeamTab");

    render(<TeamTab companyId={"company-1" as any} membershipRole="member" />);

    expect(screen.queryByRole("button", { name: /invite/i })).not.toBeInTheDocument();
    expect(screen.getByText(/only company owners can invite or remove team members/i)).toBeInTheDocument();
  });

  it("shows a success message after a successful invite", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn(),
    } as unknown as Response);

    const { TeamTab } = await import("@/components/dashboard/TeamTab");

    render(<TeamTab companyId={"company-1" as any} membershipRole="owner" />);

    fireEvent.click(screen.getByRole("button", { name: /invite/i }));
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "newperson@company.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send invite/i }).closest("form")!);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/provider-team/invite",
        expect.objectContaining({
          method: "POST",
        })
      )
    );
    expect(screen.getByText(/invite sent\. the teammate will appear as pending until they accept it\./i)).toBeInTheDocument();
  });

  it("shows backend errors instead of failing silently", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "Only the company owner can invite members",
      }),
    } as unknown as Response);

    const { TeamTab } = await import("@/components/dashboard/TeamTab");

    render(<TeamTab companyId={"company-1" as any} membershipRole="owner" />);

    fireEvent.click(screen.getByRole("button", { name: /invite/i }));
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "newperson@company.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send invite/i }).closest("form")!);

    await waitFor(() =>
      expect(screen.getByText(/only the company owner can invite members/i)).toBeInTheDocument()
    );
  });
});
