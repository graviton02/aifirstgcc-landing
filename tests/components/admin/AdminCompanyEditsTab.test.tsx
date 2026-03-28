import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminCompanyEditsTab } from "@/components/admin/AdminCompanyEditsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const approveMock = vi.fn();
const rejectMock = vi.fn();

let queryCall = 0;
let mutationCall = 0;
let pendingResponse: unknown[] = [];
let historyResponse: unknown[] = [];

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("AdminCompanyEditsTab", () => {
  beforeEach(() => {
    queryCall = 0;
    mutationCall = 0;
    pendingResponse = [];
    historyResponse = [];

    useQueryMock.mockReset();
    useMutationMock.mockReset();
    approveMock.mockReset();
    rejectMock.mockReset();

    useQueryMock.mockImplementation((_query: unknown, args?: unknown) => {
      const slot = queryCall % 2;
      queryCall += 1;

      if (args === "skip") {
        return [];
      }

      return slot === 0 ? pendingResponse : historyResponse;
    });

    useMutationMock.mockImplementation(() => {
      const fn = mutationCall % 2 === 0 ? approveMock : rejectMock;
      mutationCall += 1;
      return fn;
    });
  });

  it("shows an expandable before/after diff for pending company edits", () => {
    pendingResponse = [
      {
        _id: "edit-1",
        company_id: "company-1",
        status: "pending",
        created_at: Date.now(),
        company: {
          name: "Acme AI Labs",
          description: "Original company description.",
          website: "https://old.example.com",
          headquarters: "Bengaluru",
        },
        payload: {
          description: "Updated company description for review.",
          website: "https://new.example.com",
        },
      },
    ];

    render(<AdminCompanyEditsTab token="admin-token" />);

    expect(screen.getByText("Acme AI Labs")).toBeInTheDocument();
    expect(screen.getByText(/2 fields changed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show changes/i }));

    expect(screen.getByText(/only changed fields shown/i)).toBeInTheDocument();
    expect(screen.getByText("Original company description.")).toBeInTheDocument();
    expect(screen.getByText("Updated company description for review.")).toBeInTheDocument();
    expect(screen.getByText("https://old.example.com")).toBeInTheDocument();
    expect(screen.getByText("https://new.example.com")).toBeInTheDocument();
    expect(screen.queryByText("Headquarters")).not.toBeInTheDocument();
  });

  it("keeps approve actions working and renders history without crashing", async () => {
    pendingResponse = [
      {
        _id: "edit-1",
        company_id: "company-1",
        status: "pending",
        created_at: Date.now(),
        company: { name: "Acme AI Labs" },
        payload: { website: "https://new.example.com" },
      },
    ];

    historyResponse = [
      {
        _id: "edit-2",
        company_id: "company-1",
        status: "approved",
        created_at: Date.now(),
        reviewed_at: Date.now(),
        company: { name: "Acme AI Labs" },
        payload: { description: "History payload summary" },
      },
    ];

    render(<AdminCompanyEditsTab token="admin-token" />);

    fireEvent.click(screen.getByTitle(/approve/i));

    await waitFor(() =>
      expect(approveMock).toHaveBeenCalledWith({
        edit_id: "edit-1",
        token: "admin-token",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /history/i }));

    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("History payload summary")).toBeInTheDocument();
  });
});
